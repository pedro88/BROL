/**
 * Collections router tests.
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

describe("collectionsRouter", () => {
  let owner: Awaited<ReturnType<typeof createTestUser>>;
  let otherUser: Awaited<ReturnType<typeof createTestUser>>;
  let collection: Awaited<ReturnType<typeof createTestCollection>>;

  // Clean up before each test
  beforeEach(async () => {
    await prisma.loan.deleteMany();
    await prisma.object.deleteMany();
    await prisma.collection.deleteMany();
    await prisma.user.deleteMany();
  });

  // Setup: create test data for tests that need it
  beforeEach(async () => {
    owner = await createTestUser({ email: "owner@example.com", name: "Owner" });
    otherUser = await createTestUser({ email: "other@example.com", name: "Other" });
    collection = await createTestCollection(owner.id, { name: "Test Collection" });
  });

  describe("list", () => {
    it("returns empty list when no collections", async () => {
      // Delete the collection created by the setup beforeEach
      await prisma.collection.deleteMany();
      const result = await callerFor(owner.id).collections.list();
      expect(result.items).toHaveLength(0);
    });

    it("returns only owner's collections", async () => {
      // Delete all collections (keep users from beforeEach)
      await prisma.collection.deleteMany();
      await createTestCollection(owner.id, { name: "Collection 1" });
      await createTestCollection(owner.id, { name: "Collection 2" });
      await createTestCollection(otherUser.id, { name: "Other Collection" });

      const result = await callerFor(owner.id).collections.list();
      expect(result.items).toHaveLength(2);
      expect(result.items.map((c) => c.name).sort()).toEqual(["Collection 1", "Collection 2"]);
    });
  });

  describe("get", () => {
    it("returns own collection", async () => {
      const result = await callerFor(owner.id).collections.get({ id: collection.id });
      expect(result.name).toBe("Test Collection");
      expect(result.userId).toBe(owner.id);
    });

    it("throws UNAUTHORIZED for other user's collection", async () => {
      await expect(
        callerFor(otherUser.id).collections.get({ id: collection.id })
      ).rejects.toThrow();
    });
  });

  describe("create", () => {
    it("creates a collection", async () => {
      const result = await callerFor(owner.id).collections.create({
        name: "New Collection",
        description: "A description",
        isPublic: true,
      });
      expect(result.name).toBe("New Collection");
      expect(result.isPublic).toBe(true);
      expect(result.userId).toBe(owner.id);
    });

    it("creates collection with isPublic default false", async () => {
      const result = await callerFor(owner.id).collections.create({
        name: "Private Collection",
      });
      expect(result.isPublic).toBe(false);
    });
  });

  describe("update", () => {
    it("updates own collection", async () => {
      const result = await callerFor(owner.id).collections.update({
        id: collection.id,
        data: { name: "Updated Name", isPublic: true },
      });
      expect(result.name).toBe("Updated Name");
      expect(result.isPublic).toBe(true);
    });

    it("throws UNAUTHORIZED when updating other user's collection", async () => {
      await expect(
        callerFor(otherUser.id).collections.update({
          id: collection.id,
          data: { name: "Hacked" },
        })
      ).rejects.toThrow();
    });
  });

  describe("delete", () => {
    it("deletes own collection", async () => {
      await callerFor(owner.id).collections.delete({ id: collection.id });
      const result = await callerFor(owner.id).collections.list();
      expect(result.items).toHaveLength(0);
    });

    it("throws UNAUTHORIZED when deleting other user's collection", async () => {
      await expect(
        callerFor(otherUser.id).collections.delete({ id: collection.id })
      ).rejects.toThrow();
    });
  });

  describe("listPublic", () => {
    it("returns only public collections", async () => {
      await createTestCollection(owner.id, { name: "Public Coll", isPublic: true });
      await createTestCollection(owner.id, { name: "Private Coll", isPublic: false });

      const result = await callerFor(otherUser.id).collections.listPublic();
      expect(result.items).toHaveLength(1);
      expect(result.items[0].name).toBe("Public Coll");
    });

    it("returns public collections to unauthenticated caller", async () => {
      await createTestCollection(owner.id, { name: "Public Coll", isPublic: true });
      const result = await appRouter.createCaller({ prisma, userId: null, headers: {} }).collections.listPublic();
      expect(result.items).toHaveLength(1);
    });
  });

  describe("getPublic", () => {
    it("returns public collection without loan data", async () => {
      // Create a public collection (the default collection from beforeEach is private)
      const publicColl = await createTestCollection(owner.id, {
        name: "Public Test Collection",
        isPublic: true,
      });
      const obj = await createTestObject(publicColl.id, { name: "An Object" });
      const result = await callerFor(otherUser.id).collections.getPublic({ id: publicColl.id });
      expect(result.name).toBe("Public Test Collection");
      expect(result.objects).toHaveLength(1);
      expect(result.objects[0].name).toBe("An Object");
    });

    it("throws for private collection", async () => {
      // collection from beforeEach is private
      await expect(
        callerFor(otherUser.id).collections.getPublic({ id: collection.id })
      ).rejects.toThrow();
    });
  });
});
