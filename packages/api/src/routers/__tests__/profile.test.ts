/**
 * Profile router tests — get (public) + update (protected).
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

function publicCaller() {
  return appRouter.createCaller({
    prisma,
    userId: null,
    session: null,
    headers: {},
  });
}

describe("profileRouter", () => {
  let alice: Awaited<ReturnType<typeof createTestUser>>;
  let bob: Awaited<ReturnType<typeof createTestUser>>;

  beforeEach(async () => {
    await prisma.review.deleteMany();
    await prisma.userBadge.deleteMany();
    await prisma.profile.deleteMany();
    await prisma.user.deleteMany();

    alice = await createTestUser({ email: "alice@example.com", name: "Alice" });
    bob = await createTestUser({ email: "bob@example.com", name: "Bob" });

    await prisma.user.update({
      where: { id: alice.id },
      data: { handle: "alice1234" },
    });
  });

  // -------------------------------------------------------------------------
  // get
  // -------------------------------------------------------------------------

  describe("get", () => {
    it("returns user by cuid", async () => {
      const res = await publicCaller().profile.get({ userId: alice.id });
      expect(res.id).toBe(alice.id);
      expect(res.name).toBe("Alice");
      expect(res.handle).toBe("alice1234");
      expect(res.bio).toBeNull();
      expect(res.avatarUrl).toBeNull();
    });

    it("returns user by handle (resolves to same record)", async () => {
      const res = await publicCaller().profile.get({ userId: "alice1234" });
      expect(res.id).toBe(alice.id);
    });

    it('accepts "#"-prefixed handle', async () => {
      const res = await publicCaller().profile.get({ userId: "#alice1234" });
      expect(res.id).toBe(alice.id);
    });

    it("includes bio + avatarUrl when profile row exists", async () => {
      await prisma.profile.create({
        data: { userId: alice.id, bio: "love books", avatarUrl: "https://x/a.png" },
      });

      const res = await publicCaller().profile.get({ userId: alice.id });
      expect(res.bio).toBe("love books");
      expect(res.avatarUrl).toBe("https://x/a.png");
    });

    it("returns 0 average + 0 count when no reviews exist", async () => {
      const res = await publicCaller().profile.get({ userId: alice.id });
      expect(res.averageRating).toBe(0);
      expect(res.reviewCount).toBe(0);
    });

    it("returns empty badges list when none awarded", async () => {
      const res = await publicCaller().profile.get({ userId: alice.id });
      expect(res.badges).toEqual([]);
    });

    it("throws NOT_FOUND when neither cuid nor handle match", async () => {
      await expect(
        publicCaller().profile.get({ userId: "ghost-id" }),
      ).rejects.toThrow(/not found/i);
    });
  });

  // -------------------------------------------------------------------------
  // update
  // -------------------------------------------------------------------------

  describe("update", () => {
    it("creates a Profile row on first call (upsert)", async () => {
      const res = await callerFor(alice.id).profile.update({
        bio: "hello",
        avatarUrl: "https://example.com/a.png",
      });
      expect(res.bio).toBe("hello");
      expect(res.avatarUrl).toBe("https://example.com/a.png");
      expect(res.userId).toBe(alice.id);
    });

    it("updates an existing Profile row", async () => {
      await prisma.profile.create({
        data: { userId: alice.id, bio: "old", avatarUrl: null },
      });

      const res = await callerFor(alice.id).profile.update({ bio: "new" });
      expect(res.bio).toBe("new");
    });

    it("rejects an unauthenticated caller", async () => {
      await expect(
        publicCaller().profile.update({ bio: "x" }),
      ).rejects.toThrow(/connecté|unauthorized/i);
    });
  });

  describe("personal info + visibility", () => {
    it("persists birthYear/gender/phone + toggles", async () => {
      const res = await callerFor(alice.id).profile.update({
        birthYear: 1985,
        gender: "F",
        phone: "+32 477 12 34 56",
        publicPhone: true,
        publicBirthYear: false,
      });
      expect(res.birthYear).toBe(1985);
      expect(res.gender).toBe("F");
      expect(res.phone).toBe("+32 477 12 34 56");
      expect(res.publicPhone).toBe(true);
      expect(res.publicBirthYear).toBe(false);
    });

    it("rejects birthYear outside [1900, current]", async () => {
      await expect(
        callerFor(alice.id).profile.update({ birthYear: 1850 }),
      ).rejects.toThrow();
    });

    it("get hides email/phone/birthYear/gender by default for anonymous", async () => {
      await callerFor(alice.id).profile.update({
        phone: "+32 1",
        birthYear: 1990,
        gender: "X",
      });
      const res = await publicCaller().profile.get({ userId: alice.id });
      expect(res.email).toBeNull();
      expect(res.phone).toBeNull();
      expect(res.birthYear).toBeNull();
      expect(res.gender).toBeNull();
      expect(res.visibility).toBeNull();
    });

    it("get exposes fields with public flag set", async () => {
      await callerFor(alice.id).profile.update({
        phone: "+32 2",
        birthYear: 1990,
        publicPhone: true,
        publicBirthYear: true,
      });
      const res = await publicCaller().profile.get({ userId: alice.id });
      expect(res.phone).toBe("+32 2");
      expect(res.birthYear).toBe(1990);
    });

    it("get returns all private fields + visibility flags to self", async () => {
      await callerFor(alice.id).profile.update({
        phone: "+32 3",
        birthYear: 1990,
        publicPhone: false,
      });
      const res = await callerFor(alice.id).profile.get({ userId: alice.id });
      expect(res.phone).toBe("+32 3");
      expect(res.birthYear).toBe(1990);
      expect(res.email).toBe("alice@example.com");
      expect(res.visibility).toEqual({
        publicEmail: false,
        publicPhone: false,
        publicBirthYear: false,
        publicGender: false,
        publicCity: true,
      });
    });

    it("publicCity defaults to true", async () => {
      await prisma.user.update({ where: { id: alice.id }, data: { city: "Bruxelles" } });
      await callerFor(alice.id).profile.update({ bio: "hi" }); // creates Profile row with defaults
      const res = await publicCaller().profile.get({ userId: alice.id });
      expect(res.city).toBe("Bruxelles");
    });
  });
});
