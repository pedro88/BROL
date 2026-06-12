/**
 * Tests de l'enforcement des quotas par tier (lib/quota.ts).
 * Sécurité : sans ces gardes, un user FREE peut créer des ressources
 * illimitées (DoS stockage / abus).
 * @package @brol/api
 */

import { describe, it, expect } from "vitest";
import { TRPCError } from "@trpc/server";
import { enforceQuota } from "../quota";
import { prisma, createTestUser, createTestContext } from "../../test/setup";

function ctxFor(userId: string) {
  return { prisma, userId, headers: {}, session: { user: { id: userId } } } as never;
}

async function bulkCollections(userId: string, n: number) {
  await prisma.collection.createMany({
    data: Array.from({ length: n }, (_, i) => ({
      userId,
      name: `Coll ${i}`,
      type: "BOOK",
    })),
  });
}

describe("enforceQuota", () => {
  it("allows creation under the FREE collection limit", async () => {
    const ctx = await createTestContext();
    await bulkCollections(ctx.userId, 4);

    const result = await enforceQuota(ctxFor(ctx.userId), "collections");
    expect(result).toEqual({ current: 4, max: 5 });
  });

  it("blocks the 6th collection for FREE tier", async () => {
    const ctx = await createTestContext();
    await bulkCollections(ctx.userId, 5);

    await expect(enforceQuota(ctxFor(ctx.userId), "collections")).rejects.toThrowError(
      TRPCError
    );
    await expect(enforceQuota(ctxFor(ctx.userId), "collections")).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("blocks the 51st object for FREE tier", async () => {
    const ctx = await createTestContext();
    const coll = await prisma.collection.create({
      data: { userId: ctx.userId, name: "C", type: "BOOK" },
    });
    await prisma.object.createMany({
      data: Array.from({ length: 50 }, (_, i) => ({
        collectionId: coll.id,
        name: `Obj ${i}`,
      })),
    });

    await expect(enforceQuota(ctxFor(ctx.userId), "objects")).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("blocks the 11th active loan for FREE tier (RETURNED loans don't count)", async () => {
    const ctx = await createTestContext();
    const borrower = await createTestUser({ email: `b-${Date.now()}@example.com` });
    const coll = await prisma.collection.create({
      data: { userId: ctx.userId, name: "C", type: "BOOK" },
    });
    const obj = await prisma.object.create({
      data: { collectionId: coll.id, name: "Obj" },
    });

    // 10 prêts actifs → limite atteinte
    await prisma.loan.createMany({
      data: Array.from({ length: 10 }, () => ({
        objectId: obj.id,
        ownerId: ctx.userId,
        borrowerId: borrower.id,
        status: "ACTIVE" as const,
      })),
    });
    // Les prêts terminés ne doivent PAS compter
    await prisma.loan.createMany({
      data: Array.from({ length: 5 }, () => ({
        objectId: obj.id,
        ownerId: ctx.userId,
        borrowerId: borrower.id,
        status: "RETURNED" as const,
      })),
    });

    await expect(enforceQuota(ctxFor(ctx.userId), "activeLoans")).rejects.toMatchObject({
      code: "FORBIDDEN",
    });

    // En rendant un prêt, le quota se libère
    const one = await prisma.loan.findFirst({
      where: { ownerId: ctx.userId, status: "ACTIVE" },
    });
    await prisma.loan.update({ where: { id: one!.id }, data: { status: "RETURNED" } });

    const result = await enforceQuota(ctxFor(ctx.userId), "activeLoans");
    expect(result).toEqual({ current: 9, max: 10 });
  });

  it("TIER_3 is unlimited", async () => {
    const ctx = await createTestContext();
    await prisma.profile.create({
      data: { userId: ctx.userId, tier: "TIER_3" },
    });
    await bulkCollections(ctx.userId, 20);

    const result = await enforceQuota(ctxFor(ctx.userId), "collections");
    expect(result).toEqual({ current: 0, max: null });
  });

  it("collections.create actually enforces the quota end-to-end", async () => {
    const { appRouter } = await import("../../router");
    const ctx = await createTestContext();
    await bulkCollections(ctx.userId, 5);

    const caller = appRouter.createCaller({
      prisma,
      userId: ctx.userId,
      headers: {},
      session: { user: { id: ctx.userId } },
    });

    await expect(
      caller.collections.create({ name: "Une de trop", type: "BOOK" })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
