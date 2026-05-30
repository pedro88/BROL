/**
 * Messages router tests.
 *
 * Email sending is short-circuited when RESEND_API_KEY is unset, so these
 * tests assert DB persistence + ownership checks without hitting Resend.
 *
 * @package @brol/api
 */

import { describe, it, expect, beforeEach, beforeAll } from "vitest";
import { appRouter } from "../../router";
import {
  prisma,
  createTestUser,
  createTestCollection,
  createTestObject,
} from "../../test/setup";

beforeAll(() => {
  // Ensure no real email gets sent during tests, regardless of host env.
  delete process.env.RESEND_API_KEY;
});

function publicCaller() {
  return appRouter.createCaller({
    prisma,
    userId: null,
    session: null,
    headers: {},
  });
}

describe("messagesRouter", () => {
  let owner: Awaited<ReturnType<typeof createTestUser>>;
  let collection: Awaited<ReturnType<typeof createTestCollection>>;
  let object: Awaited<ReturnType<typeof createTestObject>>;

  beforeEach(async () => {
    await prisma.message.deleteMany();
    await prisma.object.deleteMany();
    await prisma.collection.deleteMany();
    await prisma.user.deleteMany();

    owner = await createTestUser({ email: "owner@example.com", name: "Owner" });
    collection = await createTestCollection(owner.id, { name: "Coll" });
    object = await createTestObject(collection.id, { name: "Livre" });
  });

  describe("create", () => {
    it("persists the message and returns success", async () => {
      const res = await publicCaller().messages.create({
        objectId: object.id,
        ownerId: owner.id,
        fromName: "Visitor",
        fromEmail: "visitor@example.com",
        content: "Bonjour, votre objet m'intéresse",
      });

      expect(res.success).toBe(true);
      expect(res.messageId).toBeDefined();

      const stored = await prisma.message.findUnique({ where: { id: res.messageId } });
      expect(stored).not.toBeNull();
      expect(stored?.objectId).toBe(object.id);
      expect(stored?.ownerId).toBe(owner.id);
      expect(stored?.fromName).toBe("Visitor");
      expect(stored?.fromEmail).toBe("visitor@example.com");
      expect(stored?.content).toBe("Bonjour, votre objet m'intéresse");
    });

    it("throws NOT_FOUND when objectId does not exist", async () => {
      await expect(
        publicCaller().messages.create({
          objectId: "does-not-exist",
          ownerId: owner.id,
          fromName: "X",
          fromEmail: "x@example.com",
          content: "Hello",
        }),
      ).rejects.toThrow(/Objet non trouvé/);
    });

    it("throws NOT_FOUND when ownerId does not exist", async () => {
      await expect(
        publicCaller().messages.create({
          objectId: object.id,
          ownerId: "does-not-exist",
          fromName: "X",
          fromEmail: "x@example.com",
          content: "Hello",
        }),
      ).rejects.toThrow(/Propriétaire non trouvé/);
    });

    it("rejects invalid email", async () => {
      await expect(
        publicCaller().messages.create({
          objectId: object.id,
          ownerId: owner.id,
          fromName: "X",
          fromEmail: "not-an-email",
          content: "Hello",
        }),
      ).rejects.toThrow();
    });

    it("rejects empty content", async () => {
      await expect(
        publicCaller().messages.create({
          objectId: object.id,
          ownerId: owner.id,
          fromName: "X",
          fromEmail: "x@example.com",
          content: "",
        }),
      ).rejects.toThrow();
    });

    it("rejects content over 500 chars", async () => {
      await expect(
        publicCaller().messages.create({
          objectId: object.id,
          ownerId: owner.id,
          fromName: "X",
          fromEmail: "x@example.com",
          content: "a".repeat(501),
        }),
      ).rejects.toThrow();
    });

    it("is accessible without auth (publicProcedure)", async () => {
      const res = await publicCaller().messages.create({
        objectId: object.id,
        ownerId: owner.id,
        fromName: "Anon",
        fromEmail: "anon@example.com",
        content: "Test",
      });
      expect(res.success).toBe(true);
    });

    it("throws NOT_FOUND when owner has no email", async () => {
      const noEmailOwner = await prisma.user.create({
        data: {
          id: `noemail-${Date.now()}`,
          email: `tmp-${Date.now()}@example.com`,
          name: "NoEmail",
          updatedAt: new Date(),
        },
      });
      // Wipe email after create (Prisma schema forbids null at create-time in some setups)
      await prisma.user.update({
        where: { id: noEmailOwner.id },
        data: { email: "" },
      });

      // Object owned by this user (well, the object is in `owner`'s collection,
      // but we test the ownerId param resolution: passing noEmailOwner.id with
      // empty email should throw).
      await expect(
        publicCaller().messages.create({
          objectId: object.id,
          ownerId: noEmailOwner.id,
          fromName: "X",
          fromEmail: "x@example.com",
          content: "Hello",
        }),
      ).rejects.toThrow(/Propriétaire non trouvé/);
    });
  });
});
