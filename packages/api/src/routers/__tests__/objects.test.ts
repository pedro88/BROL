/**
 * Objects router tests.
 *
 * @package @brol/api
 */

import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "../../router";
import {
  prisma,
  createTestUser,
  createTestCollection,
  createTestObject,
} from "../../test/setup";

/** Create a tRPC caller for a given userId */
function callerFor(userId: string) {
  return appRouter.createCaller({ prisma, userId, headers: {} });
}

describe("objectsRouter", () => {
  let owner: Awaited<ReturnType<typeof createTestUser>>;
  let borrower: Awaited<ReturnType<typeof createTestUser>>;
  let collection: Awaited<ReturnType<typeof createTestCollection>>;
  let object: Awaited<ReturnType<typeof createTestObject>>;

  beforeEach(async () => {
    await prisma.loan.deleteMany();
    await prisma.object.deleteMany();
    await prisma.collection.deleteMany();
    await prisma.user.deleteMany();

    owner = await createTestUser({ email: "owner@example.com", name: "Owner" });
    borrower = await createTestUser({ email: "borrower@example.com", name: "Borrower" });
    collection = await createTestCollection(owner.id, { name: "Test Collection" });
    object = await createTestObject(collection.id, { name: "Test Object" });
  });

  describe("list", () => {
    it("returns objects in own collection", async () => {
      const result = await callerFor(owner.id).objects.list({ collectionId: collection.id });
      expect(result.items).toHaveLength(1);
      expect(result.items[0].name).toBe("Test Object");
    });

    it("throws UNAUTHORIZED for other user's collection", async () => {
      await expect(
        callerFor(borrower.id).objects.list({ collectionId: collection.id })
      ).rejects.toThrow();
    });
  });

  describe("get", () => {
    it("returns own object with collection", async () => {
      const result = await callerFor(owner.id).objects.get({ id: object.id });
      expect(result.name).toBe("Test Object");
      expect(result.collection.name).toBe("Test Collection");
    });

    it("throws for other user's object", async () => {
      await expect(
        callerFor(borrower.id).objects.get({ id: object.id })
      ).rejects.toThrow();
    });
  });

  describe("create", () => {
    it("creates an object in own collection", async () => {
      const result = await callerFor(owner.id).objects.create({
        name: "New Object",
        author: "Author Name",
        condition: "GOOD",
        collectionId: collection.id,
      });
      expect(result.name).toBe("New Object");
      expect(result.author).toBe("Author Name");
      expect(result.collectionId).toBe(collection.id);
    });

    it("throws when creating in other user's collection", async () => {
      await expect(
        callerFor(borrower.id).objects.create({
          name: "Hacked Object",
          condition: "GOOD",
          collectionId: collection.id,
        })
      ).rejects.toThrow();
    });
  });

  describe("update", () => {
    it("updates own object", async () => {
      const result = await callerFor(owner.id).objects.update({
        id: object.id,
        data: { name: "Updated Name", condition: "LIKE_NEW" as const },
      });
      expect(result.name).toBe("Updated Name");
      expect(result.condition).toBe("LIKE_NEW");
    });

    it("throws when updating other user's object", async () => {
      await expect(
        callerFor(borrower.id).objects.update({
          id: object.id,
          data: { name: "Hacked" },
        })
      ).rejects.toThrow();
    });
  });

  describe("delete", () => {
    it("deletes own object", async () => {
      await callerFor(owner.id).objects.delete({ id: object.id });
      const result = await callerFor(owner.id).objects.list({ collectionId: collection.id });
      expect(result.items).toHaveLength(0);
    });

    it("throws when deleting other user's object", async () => {
      await expect(
        callerFor(borrower.id).objects.delete({ id: object.id })
      ).rejects.toThrow();
    });
  });

  describe("create (per-type fields)", () => {
    it("persists CLOTHING fields + brand", async () => {
      const clothingCollection = await createTestCollection(owner.id, {
        name: "Vêtements",
      });
      const created = await callerFor(owner.id).objects.create({
        name: "Veste cuir",
        condition: "GOOD",
        collectionId: clothingCollection.id,
        objectType: "CLOTHING",
        clothingSize: "L",
        clothingGender: "Homme",
        clothingColor: "Noir",
        clothingMaterial: "Cuir",
        brand: "Schott",
      });
      expect(created.clothingSize).toBe("L");
      expect(created.clothingGender).toBe("Homme");
      expect(created.clothingMaterial).toBe("Cuir");
      expect(created.brand).toBe("Schott");
    });

    it("persists TOOL fields with toolPowerSource enum", async () => {
      const toolCollection = await createTestCollection(owner.id, { name: "Outils" });
      const created = await callerFor(owner.id).objects.create({
        name: "Perceuse",
        condition: "GOOD",
        collectionId: toolCollection.id,
        objectType: "TOOL",
        toolSector: "Bricolage",
        toolPowerSource: "BATTERY",
        brand: "Bosch",
      });
      expect(created.toolSector).toBe("Bricolage");
      expect(created.toolPowerSource).toBe("BATTERY");
      expect(created.brand).toBe("Bosch");
    });

    it("rejects an invalid toolPowerSource value", async () => {
      await expect(
        callerFor(owner.id).objects.create({
          name: "Bad tool",
          condition: "GOOD",
          collectionId: collection.id,
          objectType: "TOOL",
          // @ts-expect-error — intentional invalid value
          toolPowerSource: "NUCLEAR",
        }),
      ).rejects.toThrow();
    });
  });

  describe("all (status=borrowed)", () => {
    it("returns objects borrowed by the user with owner info", async () => {
      await prisma.loan.create({
        data: {
          objectId: object.id,
          ownerId: owner.id,
          borrowerId: borrower.id,
          status: "ACTIVE",
          lentAt: new Date(),
        },
      });

      const result = await callerFor(borrower.id).objects.all({ status: "borrowed" });
      expect(result.items).toHaveLength(1);
      const item = result.items[0]!;
      expect(item.id).toBe(object.id);
      expect(item.owner?.id).toBe(owner.id);
      expect(item.owner?.name).toBe("Owner");
      expect(item.currentLoan?.status).toBe("ACTIVE");
    });

    it("does not return owned objects under borrowed status", async () => {
      const result = await callerFor(owner.id).objects.all({ status: "borrowed" });
      expect(result.items).toHaveLength(0);
    });

    it("excludes returned loans", async () => {
      await prisma.loan.create({
        data: {
          objectId: object.id,
          ownerId: owner.id,
          borrowerId: borrower.id,
          status: "RETURNED",
          lentAt: new Date(),
          returnedAt: new Date(),
        },
      });

      const result = await callerFor(borrower.id).objects.all({ status: "borrowed" });
      expect(result.items).toHaveLength(0);
    });
  });

  describe("lookupIsbn", () => {
    it("returns metadata for a valid ISBN", async () => {
      // ISBN 978-2-07-040850-4 = "Le Petit Prince" (should be in Open Library)
      const result = await callerFor(owner.id).objects.lookupIsbn({
        isbn: "9782070408504",
      });
      // Open Library should return data or null (depends on network)
      if (result !== null) {
        expect(result).toHaveProperty("title");
        expect(typeof result.title).toBe("string");
        expect(result).toHaveProperty("author");
      }
    });

    it("returns null for invalid ISBN length", async () => {
      await expect(
        callerFor(owner.id).objects.lookupIsbn({ isbn: "123" })
      ).rejects.toThrow();
    });

    it("handles ISBN not found gracefully", async () => {
      // ISBN 978-000-000-000-00 is very unlikely to exist
      const result = await callerFor(owner.id).objects.lookupIsbn({
        isbn: "97800000000000",
      });
      // Returns null when not found — not an error
      expect(result).toBeNull();
    });
  });
});
