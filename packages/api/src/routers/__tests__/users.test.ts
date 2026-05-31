/**
 * Users router tests — search, getById, getByHandle, me.
 *
 * @package @brol/api
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { appRouter } from "../../router";
import { prisma, createTestUser } from "../../test/setup";

function callerFor(userId: string) {
  return appRouter.createCaller({ prisma, userId, headers: {} });
}

describe("usersRouter", () => {
  let alice: Awaited<ReturnType<typeof createTestUser>>;
  let bob: Awaited<ReturnType<typeof createTestUser>>;

  beforeEach(async () => {
    await prisma.profile.deleteMany();
    await prisma.user.deleteMany();

    alice = await createTestUser({ email: "alice@example.com", name: "Alice Wonderland" });
    bob = await createTestUser({ email: "bob@example.com", name: "Bob Builder" });

    // Give Alice a stable handle so we can search/look it up.
    await prisma.user.update({
      where: { id: alice.id },
      data: { handle: "alice1234" },
    });
    await prisma.user.update({
      where: { id: bob.id },
      data: { handle: "bob5678" },
    });
  });

  // -------------------------------------------------------------------------
  // search
  // -------------------------------------------------------------------------

  describe("search", () => {
    it("finds a user by name (case-insensitive)", async () => {
      const res = await callerFor(bob.id).users.search({ query: "alice" });
      expect(res).toHaveLength(1);
      expect(res[0].id).toBe(alice.id);
    });

    it("finds a user by email substring", async () => {
      const res = await callerFor(alice.id).users.search({ query: "bob@" });
      expect(res).toHaveLength(1);
      expect(res[0].id).toBe(bob.id);
    });

    it("finds a user by handle (with or without #)", async () => {
      const bare = await callerFor(bob.id).users.search({ query: "alice1234" });
      expect(bare).toHaveLength(1);
      expect(bare[0].handle).toBe("alice1234");

      const hashed = await callerFor(bob.id).users.search({ query: "#alice1234" });
      expect(hashed).toHaveLength(1);
      expect(hashed[0].handle).toBe("alice1234");
    });

    it("returns empty when nothing matches", async () => {
      const res = await callerFor(alice.id).users.search({ query: "nobody-xyz" });
      expect(res).toHaveLength(0);
    });
  });

  // -------------------------------------------------------------------------
  // getById
  // -------------------------------------------------------------------------

  describe("getById", () => {
    it("returns user by cuid", async () => {
      const res = await callerFor(bob.id).users.getById({ id: alice.id });
      expect(res?.id).toBe(alice.id);
      expect(res?.handle).toBe("alice1234");
    });

    it("returns user by bare handle", async () => {
      const res = await callerFor(bob.id).users.getById({ id: "alice1234" });
      expect(res?.id).toBe(alice.id);
    });

    it('returns user by "#"-prefixed handle', async () => {
      const res = await callerFor(bob.id).users.getById({ id: "#alice1234" });
      expect(res?.id).toBe(alice.id);
    });

    it("normalizes handle to lowercase", async () => {
      const res = await callerFor(bob.id).users.getById({ id: "#ALICE1234" });
      expect(res?.id).toBe(alice.id);
    });

    it("returns null when neither cuid nor handle match", async () => {
      const res = await callerFor(alice.id).users.getById({ id: "doesnotexist" });
      expect(res).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // getByHandle
  // -------------------------------------------------------------------------

  describe("getByHandle", () => {
    it("looks up by bare handle", async () => {
      const res = await callerFor(bob.id).users.getByHandle({ handle: "alice1234" });
      expect(res?.id).toBe(alice.id);
    });

    it('looks up by "#"-prefixed handle', async () => {
      const res = await callerFor(bob.id).users.getByHandle({ handle: "#alice1234" });
      expect(res?.id).toBe(alice.id);
    });

    it("returns null for unknown handle", async () => {
      const res = await callerFor(alice.id).users.getByHandle({ handle: "ghost9999" });
      expect(res).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // me
  // -------------------------------------------------------------------------

  describe("me", () => {
    it("returns the authenticated user", async () => {
      const res = await callerFor(alice.id).users.me();
      expect(res?.id).toBe(alice.id);
      expect(res?.handle).toBe("alice1234");
      expect(res?.email).toBe("alice@example.com");
    });
  });

  // -------------------------------------------------------------------------
  // checkHandleAvailability
  // -------------------------------------------------------------------------

  describe("checkHandleAvailability", () => {
    it("returns available=true for an unused handle", async () => {
      const res = await callerFor(alice.id).users.checkHandleAvailability({ handle: "freshone" });
      expect(res).toEqual({ available: true });
    });

    it("returns reason=taken when another user owns the handle", async () => {
      const res = await callerFor(alice.id).users.checkHandleAvailability({ handle: "bob5678" });
      expect(res).toEqual({ available: false, reason: "taken" });
    });

    it("treats the current user's own handle as available (no-op)", async () => {
      const res = await callerFor(alice.id).users.checkHandleAvailability({ handle: "alice1234" });
      expect(res).toEqual({ available: true });
    });

    it("strips '#' prefix and lowercases before checking", async () => {
      const res = await callerFor(alice.id).users.checkHandleAvailability({ handle: "#Bob5678" });
      expect(res).toEqual({ available: false, reason: "taken" });
    });

    it("returns reason=reserved for reserved handles", async () => {
      const res = await callerFor(alice.id).users.checkHandleAvailability({ handle: "admin" });
      expect(res).toEqual({ available: false, reason: "reserved" });
    });

    it("returns reason=invalid for malformed input", async () => {
      const tooShort = await callerFor(alice.id).users.checkHandleAvailability({ handle: "ab" });
      expect(tooShort).toEqual({ available: false, reason: "invalid" });

      const badChar = await callerFor(alice.id).users.checkHandleAvailability({ handle: "with space" });
      expect(badChar).toEqual({ available: false, reason: "invalid" });
    });
  });

  // -------------------------------------------------------------------------
  // updateHandle
  // -------------------------------------------------------------------------

  describe("updateHandle (désactivé)", () => {
    it("throws FORBIDDEN — handle immuable", async () => {
      await expect(
        callerFor(alice.id).users.updateHandle({ handle: "alicenew" }),
      ).rejects.toThrow(/définitif/);
      // Vérifie qu'aucune modification n'a touché la DB.
      const reloaded = await prisma.user.findUnique({
        where: { id: alice.id },
        select: { handle: true },
      });
      expect(reloaded?.handle).toBe("alice1234");
    });
  });

  // -------------------------------------------------------------------------
  // previewLocation + updateLocation
  // -------------------------------------------------------------------------

  describe("location procedures", () => {
    let fetchSpy: ReturnType<typeof vi.spyOn>;

    function mockZippoResponse(body: unknown, status = 200) {
      return {
        ok: status >= 200 && status < 300,
        status,
        json: async () => body,
      } as unknown as Response;
    }

    const brusselsPayload = {
      "post code": "1000",
      country: "Belgium",
      "country abbreviation": "BE",
      places: [
        { "place name": "Brussels", latitude: "50.8333", longitude: "4.35" },
      ],
    };

    beforeEach(() => {
      fetchSpy = vi.spyOn(globalThis, "fetch");
    });

    afterEach(() => {
      fetchSpy.mockRestore();
    });

    it("previewLocation returns coords + city without persisting", async () => {
      fetchSpy.mockResolvedValueOnce(mockZippoResponse(brusselsPayload));
      const res = await callerFor(alice.id).users.previewLocation({
        country: "BE",
        postalCode: "1000",
      });
      expect(res).toEqual({ lat: 50.8333, lng: 4.35, city: "Brussels" });
      const reloaded = await prisma.user.findUnique({
        where: { id: alice.id },
        select: { postalCode: true, lat: true },
      });
      expect(reloaded?.postalCode).toBeNull();
      expect(reloaded?.lat).toBeNull();
    });

    it("previewLocation returns null on unknown postal code (404)", async () => {
      fetchSpy.mockResolvedValueOnce(mockZippoResponse({}, 404));
      const res = await callerFor(alice.id).users.previewLocation({
        country: "BE",
        postalCode: "9999",
      });
      expect(res).toBeNull();
    });

    it("updateLocation persists country/postalCode/city/lat/lng", async () => {
      fetchSpy.mockResolvedValueOnce(mockZippoResponse(brusselsPayload));
      const res = await callerFor(alice.id).users.updateLocation({
        country: "BE",
        postalCode: "1000",
      });
      expect(res.country).toBe("BE");
      expect(res.postalCode).toBe("1000");
      expect(res.city).toBe("Brussels");
      expect(res.lat).toBeCloseTo(50.8333);
      expect(res.lng).toBeCloseTo(4.35);

      const reloaded = await prisma.user.findUnique({
        where: { id: alice.id },
        select: { country: true, postalCode: true, city: true, lat: true, lng: true },
      });
      expect(reloaded?.city).toBe("Brussels");
      expect(reloaded?.lat).toBeCloseTo(50.8333);
    });

    it("updateLocation throws BAD_REQUEST on unknown postal code", async () => {
      fetchSpy.mockResolvedValueOnce(mockZippoResponse({}, 404));
      await expect(
        callerFor(alice.id).users.updateLocation({ country: "BE", postalCode: "9999" }),
      ).rejects.toThrow(/inconnu/);
    });

    it("updateLocation rejects invalid country format via zod", async () => {
      await expect(
        callerFor(alice.id).users.updateLocation({ country: "BEL", postalCode: "1000" }),
      ).rejects.toThrow();
      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });
});
