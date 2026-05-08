/**
 * Contacts router tests.
 *
 * @package @brol/api
 */

import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "../../router";
import { prisma, createTestUser } from "../../test/setup";

/** Create a tRPC caller for a given userId */
function callerFor(userId: string) {
  return appRouter.createCaller({ prisma, userId, headers: {} });
}

describe("contactsRouter", () => {
  let user1: Awaited<ReturnType<typeof createTestUser>>;
  let user2: Awaited<ReturnType<typeof createTestUser>>;

  beforeEach(async () => {
    await prisma.loan.deleteMany();
    await prisma.contact.deleteMany();
    await prisma.user.deleteMany();

    user1 = await createTestUser({ email: "user1@example.com", name: "User One" });
    user2 = await createTestUser({ email: "user2@example.com", name: "User Two" });
  });

  describe("list", () => {
    it("returns empty list initially", async () => {
      const result = await callerFor(user1.id).contacts.list();
      expect(result.items).toHaveLength(0);
    });

    it("returns only own contacts", async () => {
      await callerFor(user1.id).contacts.create({ name: "Contact 1", email: "c1@example.com" });
      await callerFor(user2.id).contacts.create({ name: "Contact 2", email: "c2@example.com" });

      const result = await callerFor(user1.id).contacts.list();
      expect(result.items).toHaveLength(1);
      expect(result.items[0].name).toBe("Contact 1");
    });
  });

  describe("create", () => {
    it("creates a contact", async () => {
      const result = await callerFor(user1.id).contacts.create({
        name: "Alice",
        email: "alice@example.com",
        phone: "+1234567890",
      });
      expect(result.name).toBe("Alice");
      expect(result.email).toBe("alice@example.com");
      expect(result.phone).toBe("+1234567890");
      expect(result.userId).toBe(user1.id);
    });
  });

  describe("get", () => {
    it("returns own contact", async () => {
      const contact = await callerFor(user1.id).contacts.create({ name: "Bob", email: "bob@example.com" });
      const result = await callerFor(user1.id).contacts.get({ id: contact.id });
      expect(result.name).toBe("Bob");
    });

    it("throws for other user's contact", async () => {
      const contact = await callerFor(user1.id).contacts.create({ name: "Bob", email: "bob@example.com" });
      await expect(callerFor(user2.id).contacts.get({ id: contact.id })).rejects.toThrow();
    });
  });

  describe("update", () => {
    it("updates own contact", async () => {
      const contact = await callerFor(user1.id).contacts.create({ name: "Bob", email: "bob@example.com" });
      const result = await callerFor(user1.id).contacts.update({
        id: contact.id,
        data: { name: "Bobby" },
      });
      expect(result.name).toBe("Bobby");
    });

    it("throws when updating other user's contact", async () => {
      const contact = await callerFor(user1.id).contacts.create({ name: "Bob", email: "bob@example.com" });
      await expect(
        callerFor(user2.id).contacts.update({ id: contact.id, data: { name: "Hacked" } })
      ).rejects.toThrow();
    });
  });

  describe("delete", () => {
    it("deletes own contact", async () => {
      const contact = await callerFor(user1.id).contacts.create({ name: "Bob", email: "bob@example.com" });
      await callerFor(user1.id).contacts.delete({ id: contact.id });
      const result = await callerFor(user1.id).contacts.list();
      expect(result.items).toHaveLength(0);
    });
  });

  describe("addFromScan", () => {
    it("adds another user as contact", async () => {
      const result = await callerFor(user1.id).contacts.addFromScan({ userId: user2.id });
      expect(result.email).toBe(user2.email);
    });

    it("throws when adding self", async () => {
      await expect(
        callerFor(user1.id).contacts.addFromScan({ userId: user1.id })
      ).rejects.toThrow("ne pouvez pas vous ajouter vous-même");
    });
  });

  describe("invite", () => {
    it("creates contact for non-user email", async () => {
      const result = await callerFor(user1.id).contacts.invite({
        email: "newuser@example.com",
        name: "New User",
      });
      expect(result.email).toBe("newuser@example.com");
      expect(result.note).toBe("Invitation en attente");
    });

    it("throws for existing user email", async () => {
      await expect(
        callerFor(user1.id).contacts.invite({ email: user2.email })
      ).rejects.toThrow("déjà utilisé");
    });
  });
});
