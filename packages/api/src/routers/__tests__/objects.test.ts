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

    it("returns empty list for other user's collection", async () => {
      const result = await callerFor(borrower.id).objects.list({ collectionId: collection.id });
      expect(result.items).toHaveLength(0);
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

  describe("lookupIsbn", () => {
    it("returns null for any ISBN (not implemented)", async () => {
      const result = await callerFor(owner.id).objects.lookupIsbn({ isbn: "978-2-07-040850-4" });
      expect(result).toBeNull();
    });
  });
});
