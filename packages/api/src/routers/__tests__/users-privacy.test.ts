/**
 * Tests privacy de users.getById.
 * Faille corrigée 2026-06-12 : l'endpoint retournait l'email de n'importe
 * quel utilisateur (lookup par id OU handle) à tout utilisateur connecté,
 * en bypass total du flag Profile.publicEmail → énumération d'emails.
 * @package @brol/api
 */

import { describe, it, expect } from "vitest";
import { appRouter } from "../../router";
import { prisma, createTestContext } from "../../test/setup";

function callerFor(userId: string) {
  return appRouter.createCaller({
    prisma,
    userId,
    headers: {},
    session: { user: { id: userId } },
  });
}

describe("users.getById — privacy email", () => {
  it("hides the email from other users by default", async () => {
    const target = await createTestContext();
    const caller = await createTestContext();

    const result = await callerFor(caller.userId).users.getById({ id: target.userId });

    expect(result).not.toBeNull();
    expect(result!.id).toBe(target.userId);
    expect(result!.email).toBeNull();
  });

  it("hides the email on handle lookup too (pas d'énumération par pseudo)", async () => {
    const target = await createTestContext();
    await prisma.user.update({
      where: { id: target.userId },
      data: { handle: `target${Date.now() % 100000}` },
    });
    const targetUser = await prisma.user.findUnique({ where: { id: target.userId } });
    const caller = await createTestContext();

    const result = await callerFor(caller.userId).users.getById({
      id: `#${targetUser!.handle}`,
    });

    expect(result).not.toBeNull();
    expect(result!.email).toBeNull();
  });

  it("returns the email to the user himself", async () => {
    const ctx = await createTestContext();
    const me = await prisma.user.findUnique({ where: { id: ctx.userId } });

    const result = await callerFor(ctx.userId).users.getById({ id: ctx.userId });

    expect(result!.email).toBe(me!.email);
  });

  it("returns the email when Profile.publicEmail is true (opt-in)", async () => {
    const target = await createTestContext();
    await prisma.profile.create({
      data: { userId: target.userId, publicEmail: true },
    });
    const caller = await createTestContext();

    const result = await callerFor(caller.userId).users.getById({ id: target.userId });

    expect(result!.email).not.toBeNull();
  });

  it("publicEmail=false explicitly keeps the email hidden", async () => {
    const target = await createTestContext();
    await prisma.profile.create({
      data: { userId: target.userId, publicEmail: false },
    });
    const caller = await createTestContext();

    const result = await callerFor(caller.userId).users.getById({ id: target.userId });

    expect(result!.email).toBeNull();
  });
});
