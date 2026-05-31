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

// Brussels area — for matching radius tests.
const BRUSSELS = { country: "BE", postalCode: "1000", city: "Bruxelles", lat: 50.8503, lng: 4.3517 };
// Paris ≈ 260 km from Brussels — outside any radius up to 100km.
const PARIS = { country: "FR", postalCode: "75001", city: "Paris", lat: 48.8566, lng: 2.3522 };

describe("communityRequestRouter", () => {
  let alice: Awaited<ReturnType<typeof createTestUser>>;
  let bob: Awaited<ReturnType<typeof createTestUser>>;

  beforeEach(async () => {
    await prisma.notification.deleteMany();
    await prisma.communityRequest.deleteMany();
    await prisma.object.deleteMany();
    await prisma.collection.deleteMany();
    await prisma.user.deleteMany();

    alice = await createTestUser({ email: "alice@example.com", name: "Alice" });
    bob = await createTestUser({ email: "bob@example.com", name: "Bob" });

    // Localisation par défaut : Bruxelles pour tous, sauf override par test.
    await prisma.user.update({ where: { id: alice.id }, data: BRUSSELS });
    await prisma.user.update({ where: { id: bob.id }, data: BRUSSELS });
  });

  describe("create", () => {
    it("creates a request owned by the caller with derived zone", async () => {
      const res = await callerFor(alice.id).communityRequest.create({
        title: "Cherche perceuse",
        description: "Pour week-end",
      });
      expect(res.request.authorId).toBe(alice.id);
      expect(res.request.title).toBe("Cherche perceuse");
      expect(res.request.status).toBe("OPEN");
      expect(res.request.zone).toBe("Bruxelles (1000)");
      expect(res.request.author.id).toBe(alice.id);
      expect(res.matchCount).toBe(0);
    });

    it("rejects too-short titles", async () => {
      await expect(
        callerFor(alice.id).communityRequest.create({ title: "no" }),
      ).rejects.toThrow();
    });

    it("throws BAD_REQUEST when caller has no location", async () => {
      const nomad = await createTestUser({ email: "nomad@example.com", name: "Nomad" });
      await expect(
        callerFor(nomad.id).communityRequest.create({ title: "Sans loc" }),
      ).rejects.toThrow(/localisation/);
    });

    it("accepts an optional expiresAt", async () => {
      const future = new Date(Date.now() + 7 * 24 * 3600_000).toISOString();
      const res = await callerFor(alice.id).communityRequest.create({
        title: "Tente 2 places",
        expiresAt: future,
      });
      expect(res.request.expiresAt).not.toBeNull();
    });
  });

  describe("create — matching", () => {
    async function seedObject(ownerId: string, name: string, author?: string) {
      const collection = await prisma.collection.create({
        data: { userId: ownerId, name: "Test col", type: "TOOL" },
      });
      return prisma.object.create({
        data: { collectionId: collection.id, name, author, objectType: "TOOL" },
      });
    }

    it("notifies an owner in radius whose object name matches", async () => {
      await seedObject(bob.id, "Scie à onglet Bosch");
      const res = await callerFor(alice.id).communityRequest.create({
        title: "scie à onglet",
        radiusKm: 25,
      });
      expect(res.matchCount).toBe(1);
      const notifs = await prisma.notification.findMany({ where: { userId: bob.id } });
      expect(notifs).toHaveLength(1);
      expect(notifs[0].type).toBe("COMMUNITY_REQUEST");
      expect(notifs[0].relatedId).toBe(res.request.id);
    });

    it("does NOT notify owners outside the radius", async () => {
      await prisma.user.update({ where: { id: bob.id }, data: PARIS });
      await seedObject(bob.id, "Scie à onglet");
      const res = await callerFor(alice.id).communityRequest.create({
        title: "scie à onglet",
        radiusKm: 100,
      });
      expect(res.matchCount).toBe(0);
      const notifs = await prisma.notification.findMany({ where: { userId: bob.id } });
      expect(notifs).toHaveLength(0);
    });

    it("does NOT notify owners in radius without matching object name", async () => {
      await seedObject(bob.id, "Tournevis cruciforme");
      const res = await callerFor(alice.id).communityRequest.create({
        title: "scie à onglet",
        radiusKm: 25,
      });
      expect(res.matchCount).toBe(0);
    });

    it("matches on Object.author too (books)", async () => {
      await seedObject(bob.id, "Du côté de chez Swann", "Marcel Proust");
      const res = await callerFor(alice.id).communityRequest.create({
        title: "Proust",
        radiusKm: 25,
      });
      expect(res.matchCount).toBe(1);
    });

    it("does NOT notify the author about their own objects", async () => {
      await seedObject(alice.id, "Scie à onglet personnelle");
      const res = await callerFor(alice.id).communityRequest.create({
        title: "scie à onglet",
        radiusKm: 25,
      });
      expect(res.matchCount).toBe(0);
    });
  });

  describe("list", () => {
    beforeEach(async () => {
      // Bob déménage à Liège pour tester le filtre zone.
      await prisma.user.update({
        where: { id: bob.id },
        data: { country: "BE", postalCode: "4000", city: "Liège", lat: 50.6326, lng: 5.5797 },
      });
      await callerFor(alice.id).communityRequest.create({ title: "Ouverte Alice" });
      await callerFor(bob.id).communityRequest.create({ title: "Ouverte Bob" });
      const cancelled = await callerFor(alice.id).communityRequest.create({
        title: "À annuler",
      });
      await callerFor(alice.id).communityRequest.cancel({ id: cancelled.request.id });
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
      expect(res.items[0].zone).toBe("Liège (4000)");
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
      const res = await publicCaller().communityRequest.get({ id: created.request.id });
      expect(res.id).toBe(created.request.id);
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
      const res = await callerFor(alice.id).communityRequest.cancel({ id: created.request.id });
      expect(res.status).toBe("CANCELLED");
    });

    it("throws FORBIDDEN if the caller is not the author", async () => {
      const created = await callerFor(alice.id).communityRequest.create({
        title: "Pas la tienne",
      });
      await expect(
        callerFor(bob.id).communityRequest.cancel({ id: created.request.id }),
      ).rejects.toThrow(/propres demandes/);
    });

    it("throws BAD_REQUEST when not OPEN", async () => {
      const created = await callerFor(alice.id).communityRequest.create({
        title: "Double cancel",
      });
      await callerFor(alice.id).communityRequest.cancel({ id: created.request.id });
      await expect(
        callerFor(alice.id).communityRequest.cancel({ id: created.request.id }),
      ).rejects.toThrow(/ouvertes/);
    });
  });

  describe("fulfill", () => {
    it("marks an OPEN request as FULFILLED", async () => {
      const created = await callerFor(alice.id).communityRequest.create({
        title: "À fulfill",
      });
      const res = await callerFor(bob.id).communityRequest.fulfill({ id: created.request.id });
      expect(res.status).toBe("FULFILLED");
    });

    it("creates a notification for the author when someone else fulfills", async () => {
      const created = await callerFor(alice.id).communityRequest.create({
        title: "Notif please",
      });
      await callerFor(bob.id).communityRequest.fulfill({ id: created.request.id });
      const notifs = await prisma.notification.findMany({
        where: { userId: alice.id, type: "REQUEST_FULFILLED" },
      });
      expect(notifs).toHaveLength(1);
      expect(notifs[0].relatedId).toBe(created.request.id);
    });

    it("does NOT notify when the author fulfills their own request", async () => {
      const created = await callerFor(alice.id).communityRequest.create({
        title: "Self-fulfill",
      });
      await callerFor(alice.id).communityRequest.fulfill({ id: created.request.id });
      const notifs = await prisma.notification.findMany({
        where: { userId: alice.id, type: "REQUEST_FULFILLED" },
      });
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
