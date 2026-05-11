/**
 * Photos router tests.
 *
 * @package @brol/api
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { appRouter } from "../../router";
import {
  prisma,
  createTestUser,
  createTestCollection,
  createTestObject,
} from "../../test/setup";
import type { PresignedUpload } from "../../lib/s3";

/** Create a tRPC caller for a given userId */
function callerFor(userId: string) {
  return appRouter.createCaller({ prisma, userId, headers: {} });
}

// Mock the S3 client so we don't need real credentials
vi.mock("../../lib/s3", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../lib/s3")>();
  return {
    ...actual,
    getPresignedUploadUrl: vi.fn().mockResolvedValue({
      uploadUrl: "https://mock-s3.example.com/presigned",
      publicUrl: "https://mock-s3.example.com/bucket/photos/obj123/uuid.jpg",
      key: "photos/obj123/uuid.jpg",
    } satisfies PresignedUpload),
    deleteS3Object: vi.fn().mockResolvedValue(undefined),
    extractKeyFromUrl: vi.fn().mockReturnValue("photos/obj123/uuid.jpg"),
  };
});

describe("photosRouter", () => {
  let owner: Awaited<ReturnType<typeof createTestUser>>;
  let otherUser: Awaited<ReturnType<typeof createTestUser>>;
  let collection: Awaited<ReturnType<typeof createTestCollection>>;
  let object: Awaited<ReturnType<typeof createTestObject>>;

  beforeEach(async () => {
    // Clean slate (order: child → parent for FK constraints)
    await prisma.photo.deleteMany();
    await prisma.loan.deleteMany();
    await prisma.object.deleteMany();
    await prisma.collection.deleteMany();
    await prisma.user.deleteMany(); // Clean users between tests to avoid unique email conflicts

    // Owner
    owner = await createTestUser({ email: `owner-${Date.now()}@example.com`, name: "Owner" });
    otherUser = await createTestUser({ email: `other-${Date.now()}@example.com`, name: "Other" });
    collection = await createTestCollection(owner.id, { name: "Ma collection" });
    object = await createTestObject(collection.id, { name: "Mon objet" });
  });

  afterEach(async () => {
    await prisma.photo.deleteMany();
    await prisma.user.deleteMany();
  });

  // =============================================
  // LIST
  // =============================================
  describe("list", () => {
    it("returns empty list when no photos", async () => {
      const caller = callerFor(owner.id);
      const result = await caller.photos.list({ objectId: object.id });
      expect(result).toEqual([]);
    });

    it("returns photos ordered by position", async () => {
      await prisma.photo.createMany({
        data: [
          { objectId: object.id, url: "https://example.com/1.jpg", position: 2 },
          { objectId: object.id, url: "https://example.com/2.jpg", position: 0 },
          { objectId: object.id, url: "https://example.com/3.jpg", position: 1 },
        ],
      });

      const caller = callerFor(owner.id);
      const result = await caller.photos.list({ objectId: object.id });

      expect(result).toHaveLength(3);
      expect(result[0].url).toBe("https://example.com/2.jpg"); // position 0
      expect(result[1].url).toBe("https://example.com/3.jpg"); // position 1
      expect(result[2].url).toBe("https://example.com/1.jpg"); // position 2
    });

    it("rejects listing photos of another user's object", async () => {
      const caller = callerFor(otherUser.id);
      await expect(
        caller.photos.list({ objectId: object.id })
      ).rejects.toThrow();
    });
  });

  // =============================================
  // ADD
  // =============================================
  describe("add", () => {
    it("adds a photo to an object", async () => {
      const caller = callerFor(owner.id);
      const result = await caller.photos.add({
        objectId: object.id,
        url: "https://example.com/cover.jpg",
        position: 0,
      });

      expect(result.objectId).toBe(object.id);
      expect(result.url).toBe("https://example.com/cover.jpg");
      expect(result.position).toBe(0);
      expect(result.id).toBeDefined();
    });

    it("rejects adding photo to another user's object", async () => {
      const caller = callerFor(otherUser.id);
      await expect(
        caller.photos.add({
          objectId: object.id,
          url: "https://example.com/cover.jpg",
          position: 0,
        })
      ).rejects.toThrow();
    });
  });

  // =============================================
  // REMOVE
  // =============================================
  describe("remove", () => {
    it("removes a photo from an object", async () => {
      const photo = await prisma.photo.create({
        data: { objectId: object.id, url: "https://example.com/1.jpg", position: 0 },
      });

      const caller = callerFor(owner.id);
      await caller.photos.remove({ objectId: object.id, photoId: photo.id });

      const remaining = await prisma.photo.findMany({ where: { objectId: object.id } });
      expect(remaining).toHaveLength(0);
    });

    it("rejects removing another user's photo", async () => {
      const photo = await prisma.photo.create({
        data: { objectId: object.id, url: "https://example.com/1.jpg", position: 0 },
      });

      const caller = callerFor(otherUser.id);
      await expect(
        caller.photos.remove({ objectId: object.id, photoId: photo.id })
      ).rejects.toThrow();
    });

    it("throws NOT_FOUND for non-existent photo", async () => {
      const caller = callerFor(owner.id);
      await expect(
        caller.photos.remove({ objectId: object.id, photoId: "cnotfound123456789012345678" })
      ).rejects.toThrow();
    });
  });

  // =============================================
  // GET PRESIGNED URL
  // =============================================
  describe("getPresignedUrl", () => {
    it("returns presigned upload URL", async () => {
      const caller = callerFor(owner.id);
      const result = await caller.photos.getPresignedUrl({
        objectId: object.id,
        filename: "photo.jpg",
        contentType: "image/jpeg",
        fileSize: 1024 * 500,
      });

      expect(result.uploadUrl).toContain("mock-s3.example.com");
      expect(result.publicUrl).toContain("mock-s3.example.com");
      expect(result.key).toMatch(/^photos\//);
    });

    it("rejects another user's object", async () => {
      const caller = callerFor(otherUser.id);
      await expect(
        caller.photos.getPresignedUrl({
          objectId: object.id,
          filename: "photo.jpg",
          contentType: "image/jpeg",
          fileSize: 1024 * 500,
        })
      ).rejects.toThrow();
    });
  });

  // =============================================
  // REORDER
  // =============================================
  describe("reorder", () => {
    it("updates photo positions", async () => {
      const p1 = await prisma.photo.create({
        data: { objectId: object.id, url: "https://example.com/1.jpg", position: 0 },
      });
      const p2 = await prisma.photo.create({
        data: { objectId: object.id, url: "https://example.com/2.jpg", position: 1 },
      });

      const caller = callerFor(owner.id);
      const result = await caller.photos.reorder({
        objectId: object.id,
        positions: { [p1.id]: 1, [p2.id]: 0 },
      });

      const sorted = [...result].sort((a, b) => a.position - b.position);
      expect(sorted[0].id).toBe(p2.id); // was 1, now 0
      expect(sorted[1].id).toBe(p1.id); // was 0, now 1
    });

    it("rejects reordering another user's photos", async () => {
      const p1 = await prisma.photo.create({
        data: { objectId: object.id, url: "https://example.com/1.jpg", position: 0 },
      });

      const caller = callerFor(otherUser.id);
      await expect(
        caller.photos.reorder({
          objectId: object.id,
          positions: { [p1.id]: 1 },
        })
      ).rejects.toThrow();
    });
  });
});
