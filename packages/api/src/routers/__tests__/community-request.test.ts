/**
 * Community Request router tests.
 *
 * @package @brol/api
 */

import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "../../router";
import { prisma, createTestUser } from "../../test/setup";

/** Caller that mirrors what protectedProcedure expects (session + userId). */
function callerFor(userId: string) {
  return appRouter.createCaller({
    prisma,
    userId,
    session: { user: { id: userId } },
    headers: {},
  });
}

function publicCaller() {
  return appRouter.createCaller({
    prisma,
    userId: null,
    session: null,
    headers: {},
  });
}

describe("communityRequestRouter", () => {
  let alice: Awaited<ReturnType<typeof createTestUser>>;
  let bob: Awaited<ReturnType<typeof createTestUser>>;

  beforeEach(async () => {
    await prisma.notification.deleteMany();
    await prisma.communityRequest.deleteMany();
    await prisma.user.deleteMany();

    alice = await createTestUser({ email: "alice@example.com", name: "Alice" });
    bob = await createTestUser({ email: "bob@example.com", name: "Bob" });
  });

  describe("create", () => {
    it("creates a request owned by the caller", async () => {
      const res = await callerFor(alice.id).communityRequest.create({
        title: "Cherche perceuse",
        description: "Pour week-end",
        zone: "Liège",
      });
      expect(res.authorId).toBe(alice.id);
      expect(res.title).toBe("Cherche perceuse");
      expect(res.status).toBe("OPEN");
      expect(res.author.id).toBe(alice.id);
    });

    it("rejects too-short titles", async () => {
      await expect(
        callerFor(alice.id).communityRequest.create({ title: "no" }),
      ).rejects.toThrow();
    });

    it("accepts an optional expiresAt", async () => {
      const future = new Date(Date.now() + 7 * 24 * 3600_000).toISOString();
      const res = await callerFor(alice.id).communityRequest.create({
        title: "Tente 2 places",
        expiresAt: future,
      });
      expect(res.expiresAt).not.toBeNull();
    });
  });

  describe("list", () => {
    beforeEach(async () => {
      await callerFor(alice.id).communityRequest.create({
        title: "Ouverte Alice",
        zone: "Bruxelles",
      });
      await callerFor(bob.id).communityRequest.create({
        title: "Ouverte Bob",
        zone: "Liège",
      });
      const cancelled = await callerFor(alice.id).communityRequest.create({
        title: "À annuler",
      });
      await callerFor(alice.id).communityRequest.cancel({ id: cancelled.id });
    });

    it("defaults to OPEN requests only", async () => {
      const res = await publicCaller().communityRequest.list({ limit: 20 });
      expect(res.items).toHaveLength(2);
      expect(res.items.every((r) => r.status === "OPEN")).toBe(true);
    });

    it("filters by explicit status", async () => {
      const res = await publicCaller().communityRequest.list({
        status: "CANCELLED",
        limit: 20,
      });
      expect(res.items).toHaveLength(1);
      expect(res.items[0].title).toBe("À annuler");
    });

    it("filters by zone (case-insensitive)", async () => {
      const res = await publicCaller().communityRequest.list({
        zone: "liège",
        limit: 20,
      });
      expect(res.items).toHaveLength(1);
      expect(res.items[0].zone).toBe("Liège");
    });

    it("filters by search on title", async () => {
      const res = await publicCaller().communityRequest.list({
        search: "alice",
        limit: 20,
      });
      expect(res.items).toHaveLength(1);
      expect(res.items[0].title).toBe("Ouverte Alice");
    });

    it("is accessible without auth (publicProcedure)", async () => {
      const res = await publicCaller().communityRequest.list({ limit: 20 });
      expect(res).toBeDefined();
    });
  });

  describe("get", () => {
    it("returns a request by id", async () => {
      const created = await callerFor(alice.id).communityRequest.create({
        title: "Vélo enfant",
      });
      const res = await publicCaller().communityRequest.get({ id: created.id });
      expect(res.id).toBe(created.id);
      expect(res.author.id).toBe(alice.id);
    });

    it("throws NOT_FOUND on unknown id", async () => {
      await expect(
        publicCaller().communityRequest.get({ id: "does-not-exist" }),
      ).rejects.toThrow(/introuvable/);
    });
  });

  describe("cancel", () => {
    it("cancels own OPEN request", async () => {
      const created = await callerFor(alice.id).communityRequest.create({
        title: "Annulable",
      });
      const res = await callerFor(alice.id).communityRequest.cancel({ id: created.id });
      expect(res.status).toBe("CANCELLED");
    });

    it("throws FORBIDDEN if the caller is not the author", async () => {
      const created = await callerFor(alice.id).communityRequest.create({
        title: "Pas la tienne",
      });
      await expect(
        callerFor(bob.id).communityRequest.cancel({ id: created.id }),
      ).rejects.toThrow(/propres demandes/);
    });

    it("throws BAD_REQUEST when not OPEN", async () => {
      const created = await callerFor(alice.id).communityRequest.create({
        title: "Double cancel",
      });
      await callerFor(alice.id).communityRequest.cancel({ id: created.id });
      await expect(
        callerFor(alice.id).communityRequest.cancel({ id: created.id }),
      ).rejects.toThrow(/ouvertes/);
    });
  });

  describe("fulfill", () => {
    it("marks an OPEN request as FULFILLED", async () => {
      const created = await callerFor(alice.id).communityRequest.create({
        title: "À fulfill",
      });
      const res = await callerFor(bob.id).communityRequest.fulfill({ id: created.id });
      expect(res.status).toBe("FULFILLED");
    });

    it("creates a notification for the author when someone else fulfills", async () => {
      const created = await callerFor(alice.id).communityRequest.create({
        title: "Notif please",
      });
      await callerFor(bob.id).communityRequest.fulfill({ id: created.id });
      const notifs = await prisma.notification.findMany({ where: { userId: alice.id } });
      expect(notifs).toHaveLength(1);
      expect(notifs[0].type).toBe("REQUEST_FULFILLED");
      expect(notifs[0].relatedId).toBe(created.id);
    });

    it("does NOT notify when the author fulfills their own request", async () => {
      const created = await callerFor(alice.id).communityRequest.create({
        title: "Self-fulfill",
      });
      await callerFor(alice.id).communityRequest.fulfill({ id: created.id });
      const notifs = await prisma.notification.findMany({ where: { userId: alice.id } });
      expect(notifs).toHaveLength(0);
    });
  });

  describe("myRequests", () => {
    it("returns only the caller's requests", async () => {
      await callerFor(alice.id).communityRequest.create({ title: "Mine A" });
      await callerFor(alice.id).communityRequest.create({ title: "Mine B" });
      await callerFor(bob.id).communityRequest.create({ title: "Not mine" });

      const res = await callerFor(alice.id).communityRequest.myRequests();
      expect(res).toHaveLength(2);
      expect(res.every((r) => r.authorId === alice.id)).toBe(true);
    });
  });
});
