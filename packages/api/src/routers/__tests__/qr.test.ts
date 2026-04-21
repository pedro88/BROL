/**
 * QR router tests.
 *
 * @package @brol/api
 */

import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "../../router";
import { prisma, createTestUser, createTestCollection, createTestObject } from "../../test/setup";

/** Create a tRPC caller for a given userId */
function callerFor(userId: string) {
  return appRouter.createCaller({ prisma, userId, headers: {} });
}

describe("qrRouter", () => {
  let owner: Awaited<ReturnType<typeof createTestUser>>;
  let otherUser: Awaited<ReturnType<typeof createTestUser>>;
  let collection: Awaited<ReturnType<typeof createTestCollection>>;
  let object: Awaited<ReturnType<typeof createTestObject>>;

  beforeEach(async () => {
    await prisma.loan.deleteMany();
    await prisma.object.deleteMany();
    await prisma.collection.deleteMany();
    await prisma.qrStock.deleteMany();
    await prisma.user.deleteMany();

    owner = await createTestUser({ email: "owner@example.com", name: "Owner" });
    otherUser = await createTestUser({ email: "other@example.com", name: "Other" });
    collection = await createTestCollection(owner.id);
    object = await createTestObject(collection.id, { name: "Test Object" });
  });

  describe("generateStock", () => {
    it("generates QR codes", async () => {
      const result = await callerFor(owner.id).qr.generateStock({ count: 3 });
      expect(result.count).toBe(3);
      expect(result.codes).toHaveLength(3);
      expect(result.codes[0].used).toBe(false);
      expect(result.codes[0].userId).toBe(owner.id);
    });

    it("QR codes have unique codes", async () => {
      const result = await callerFor(owner.id).qr.generateStock({ count: 10 });
      const codes = result.codes.map((c) => c.code);
      const unique = new Set(codes);
      expect(unique.size).toBe(10);
    });
  });

  describe("listStock", () => {
    it("returns empty list initially", async () => {
      const result = await callerFor(owner.id).qr.listStock();
      expect(result.items).toHaveLength(0);
    });

    it("returns only user's QR codes", async () => {
      await callerFor(owner.id).qr.generateStock({ count: 2 });
      await callerFor(otherUser.id).qr.generateStock({ count: 1 });

      const result = await callerFor(owner.id).qr.listStock();
      expect(result.items).toHaveLength(2);
    });

    it("filters by used status", async () => {
      const qr = (await callerFor(owner.id).qr.generateStock({ count: 1 })).codes[0];
      // Assign to object (marks as used)
      await callerFor(owner.id).qr.assignToObject({ qrStockId: qr.id, objectId: object.id });

      const usedResult = await callerFor(owner.id).qr.listStock({ used: true });
      const unusedResult = await callerFor(owner.id).qr.listStock({ used: false });
      expect(usedResult.items).toHaveLength(1);
      expect(unusedResult.items).toHaveLength(0);
    });
  });

  describe("assignToObject", () => {
    it("assigns QR code to object", async () => {
      const qr = (await callerFor(owner.id).qr.generateStock({ count: 1 })).codes[0];
      const result = await callerFor(owner.id).qr.assignToObject({
        qrStockId: qr.id,
        objectId: object.id,
      });
      expect(result.qrStockId).toBe(qr.id);
    });

    it("throws for already-used QR", async () => {
      const qr = (await callerFor(owner.id).qr.generateStock({ count: 1 })).codes[0];
      await callerFor(owner.id).qr.assignToObject({ qrStockId: qr.id, objectId: object.id });

      const otherObject = await createTestObject(collection.id, { name: "Other Object" });
      await expect(
        callerFor(owner.id).qr.assignToObject({ qrStockId: qr.id, objectId: otherObject.id })
      ).rejects.toThrow("non disponible");
    });

    it("throws when assigning to other user's object", async () => {
      const qr = (await callerFor(owner.id).qr.generateStock({ count: 1 })).codes[0];
      await expect(
        callerFor(otherUser.id).qr.assignToObject({ qrStockId: qr.id, objectId: object.id })
      ).rejects.toThrow();
    });
  });

  describe("getByCode", () => {
    it("returns QR by code", async () => {
      const generated = await callerFor(owner.id).qr.generateStock({ count: 1 });
      const qr = generated.codes[0];
      const result = await callerFor(owner.id).qr.getByCode({ code: qr.code });
      expect(result.id).toBe(qr.id);
    });

    it("throws for other user's QR code", async () => {
      const qr = (await callerFor(owner.id).qr.generateStock({ count: 1 })).codes[0];
      await expect(
        callerFor(otherUser.id).qr.getByCode({ code: qr.code })
      ).rejects.toThrow();
    });
  });

  describe("deleteStock", () => {
    it("deletes unused QR code", async () => {
      const qr = (await callerFor(owner.id).qr.generateStock({ count: 1 })).codes[0];
      await callerFor(owner.id).qr.deleteStock({ id: qr.id });
      const result = await callerFor(owner.id).qr.listStock();
      expect(result.items).toHaveLength(0);
    });

    it("throws for used QR code", async () => {
      const qr = (await callerFor(owner.id).qr.generateStock({ count: 1 })).codes[0];
      await callerFor(owner.id).qr.assignToObject({ qrStockId: qr.id, objectId: object.id });
      await expect(
        callerFor(owner.id).qr.deleteStock({ id: qr.id })
      ).rejects.toThrow();
    });
  });
});
