/**
 * Tests for the request-messages router (in-app messaging on a
 * CommunityRequest thread).
 *
 * @package @brol/api
 */

import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "../../router";
import { prisma, createTestUser } from "../../test/setup";

function callerFor(userId: string) {
  return appRouter.createCaller({
    prisma,
    userId,
    session: { user: { id: userId } },
    headers: {},
  });
}

const BRUSSELS = {
  country: "BE",
  postalCode: "1000",
  city: "Bruxelles",
  lat: 50.8503,
  lng: 4.3517,
};

describe("requestMessagesRouter", () => {
  let alice: Awaited<ReturnType<typeof createTestUser>>;
  let bob: Awaited<ReturnType<typeof createTestUser>>;
  let charlie: Awaited<ReturnType<typeof createTestUser>>;
  let requestId: string;

  beforeEach(async () => {
    await prisma.requestMessage.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.communityRequest.deleteMany();
    await prisma.user.deleteMany();

    alice = await createTestUser({ email: "alice@example.com", name: "Alice" });
    bob = await createTestUser({ email: "bob@example.com", name: "Bob" });
    charlie = await createTestUser({ email: "charlie@example.com", name: "Charlie" });

    for (const u of [alice, bob, charlie]) {
      await prisma.user.update({ where: { id: u.id }, data: BRUSSELS });
    }

    // Alice crée une demande.
    const res = await callerFor(alice.id).communityRequest.create({
      title: "Cherche perceuse",
      radiusKm: 25,
    });
    requestId = res.request.id;
  });

  describe("send", () => {
    it("owner can send the first message to the author", async () => {
      const msg = await callerFor(bob.id).requestMessages.send({
        requestId,
        content: "Bonjour, j'ai une perceuse Bosch — ça vous intéresse ?",
      });
      expect(msg.fromUserId).toBe(bob.id);
      expect(msg.toUserId).toBe(alice.id);
      expect(msg.content).toContain("Bosch");

      // Les messages n'alimentent plus la cloche (notif transactionnelle) :
      // pas de Notification créée pour le destinataire.
      const notif = await prisma.notification.findFirst({
        where: { userId: alice.id, type: "COMMUNITY_REQUEST" },
        orderBy: { createdAt: "desc" },
      });
      expect(notif).toBeNull();

      // Ils alimentent le badge Mail : le destinataire a un message non lu.
      const unread = await callerFor(alice.id).messages.unreadCount();
      expect(unread.count).toBe(1);
    });

    it("author cannot send the first message (no owner has replied yet)", async () => {
      await expect(
        callerFor(alice.id).requestMessages.send({
          requestId,
          content: "Bonjour",
        }),
      ).rejects.toThrow(/Aucun voisin/);
    });

    it("author can reply once an owner has spoken — to that owner", async () => {
      await callerFor(bob.id).requestMessages.send({
        requestId,
        content: "Je peux vous prêter ma perceuse.",
      });
      const reply = await callerFor(alice.id).requestMessages.send({
        requestId,
        content: "Super, on se voit quand ?",
      });
      expect(reply.fromUserId).toBe(alice.id);
      expect(reply.toUserId).toBe(bob.id);
    });

    it("rejects empty content via zod", async () => {
      await expect(
        callerFor(bob.id).requestMessages.send({ requestId, content: "  " }),
      ).rejects.toThrow();
    });

    it("404 if request id does not exist", async () => {
      await expect(
        callerFor(bob.id).requestMessages.send({
          requestId: "does-not-exist",
          content: "Hello",
        }),
      ).rejects.toThrow(/introuvable/);
    });
  });

  describe("list", () => {
    beforeEach(async () => {
      await callerFor(bob.id).requestMessages.send({
        requestId,
        content: "Bob propose sa perceuse",
      });
      await callerFor(charlie.id).requestMessages.send({
        requestId,
        content: "Charlie aussi a une perceuse",
      });
    });

    it("author sees all incoming messages from every owner", async () => {
      const res = await callerFor(alice.id).requestMessages.list({ requestId });
      expect(res.messages).toHaveLength(2);
      expect(res.isAuthor).toBe(true);
    });

    it("non-author owner sees only their own thread (their own + replies)", async () => {
      await callerFor(alice.id).requestMessages.send({
        requestId,
        content: "Merci Bob",
      });
      const bobView = await callerFor(bob.id).requestMessages.list({ requestId });
      expect(bobView.isAuthor).toBe(false);
      expect(bobView.messages.every((m) => m.fromUserId === bob.id || m.toUserId === bob.id))
        .toBe(true);
      // Charlie's message must not leak.
      expect(bobView.messages.find((m) => m.content.includes("Charlie"))).toBeUndefined();
    });

    it("third-party user is FORBIDDEN", async () => {
      const dave = await createTestUser({ email: "dave@example.com", name: "Dave" });
      await prisma.user.update({ where: { id: dave.id }, data: BRUSSELS });
      await expect(
        callerFor(dave.id).requestMessages.list({ requestId }),
      ).rejects.toThrow(/accès/);
    });

    it("marks received messages as read on read", async () => {
      // Alice (author) opens the thread → both incoming messages flip to isRead=true.
      await callerFor(alice.id).requestMessages.list({ requestId });
      const unread = await prisma.requestMessage.count({
        where: { toUserId: alice.id, isRead: false },
      });
      expect(unread).toBe(0);
    });
  });
});
