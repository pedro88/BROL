/**
 * Tests des helpers d'ownership (lib/owned-objects.ts).
 * Sécurité : ces helpers sont LA barrière anti-IDOR de photos/objects/
 * loans/qr. Un trou ici = accès cross-user partout.
 * @package @brol/api
 */

import { describe, it, expect } from "vitest";
import {
  getOwnedObject,
  assertObjectOwned,
  getOwnedCollection,
} from "../owned-objects";
import { prisma, createTestContext } from "../../test/setup";

async function seedObject(userId: string) {
  const coll = await prisma.collection.create({
    data: { userId, name: "C", type: "BOOK" },
  });
  return prisma.object.create({
    data: { collectionId: coll.id, name: "Obj", notes: "secret" },
  });
}

describe("getOwnedObject / assertObjectOwned", () => {
  it("returns the object for its owner", async () => {
    const ctx = await createTestContext();
    const obj = await seedObject(ctx.userId);

    const found = await getOwnedObject(prisma, ctx.userId, obj.id);
    expect(found.id).toBe(obj.id);
  });

  it("throws NOT_FOUND for another user's object (anti-IDOR)", async () => {
    const owner = await createTestContext();
    const attacker = await createTestContext();
    const obj = await seedObject(owner.userId);

    await expect(getOwnedObject(prisma, attacker.userId, obj.id)).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
    await expect(assertObjectOwned(prisma, attacker.userId, obj.id)).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("does not distinguish 'missing' from 'not yours' (no ownership oracle)", async () => {
    const owner = await createTestContext();
    const attacker = await createTestContext();
    const obj = await seedObject(owner.userId);

    const notYours = await getOwnedObject(prisma, attacker.userId, obj.id).catch((e) => e);
    const missing = await getOwnedObject(
      prisma,
      attacker.userId,
      "c00000000000000000000000"
    ).catch((e) => e);

    expect(notYours.code).toBe(missing.code);
    expect(notYours.message).toBe(missing.message);
  });

  it("honours select/include args", async () => {
    const ctx = await createTestContext();
    const obj = await seedObject(ctx.userId);

    const selected = await getOwnedObject(prisma, ctx.userId, obj.id, {
      select: { id: true, name: true },
    });
    expect(selected).toEqual({ id: obj.id, name: "Obj" });

    const included = await getOwnedObject(prisma, ctx.userId, obj.id, {
      include: { collection: true },
    });
    expect((included as { collection: { userId: string } }).collection.userId).toBe(
      ctx.userId
    );
  });
});

describe("getOwnedCollection", () => {
  it("throws NOT_FOUND for another user's collection", async () => {
    const owner = await createTestContext();
    const attacker = await createTestContext();
    const coll = await prisma.collection.create({
      data: { userId: owner.userId, name: "C", type: "BOOK" },
    });

    await expect(
      getOwnedCollection(prisma, attacker.userId, coll.id)
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
