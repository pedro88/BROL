/**
 * Badge router tests.
 *
 * Note sécurité : `badge.award` a été retiré du router (n'importe quel
 * utilisateur connecté pouvait s'attribuer n'importe quel badge) et
 * `badge.syncUser` ne prend plus de userId — il synchronise le caller.
 * L'attribution passe exclusivement par `syncUserBadges` (badge-service).
 *
 * @package @brol/api
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { appRouter } from "../../router";
import { prisma, createTestUser, createTestContext } from "../../test/setup";

function callerFor(userId: string) {
  return appRouter.createCaller({
    prisma,
    userId,
    headers: {},
    session: { user: { id: userId } },
  });
}

describe("badgeRouter", () => {
  beforeEach(async () => {
    const badges = [
      { slug: "first-loan", name: "Premier prêt", description: "1er prêt", icon: "🎉", criteria: { type: "loan_count", threshold: 1 } },
      { slug: "lender-5", name: "Prêteur confirmé", description: "5 prêts", icon: "⭐", criteria: { type: "loan_count", threshold: 5 } },
      { slug: "collector-10", name: "Collectionneur", description: "10 objets", icon: "📚", criteria: { type: "object_count", threshold: 10 } },
      { slug: "reviewer", name: "Critique", description: "1 review", icon: "💬", criteria: { type: "review_count", threshold: 1 } },
    ];
    for (const b of badges) {
      await prisma.badgeDefinition.upsert({
        where: { slug: b.slug },
        update: b,
        create: b,
      });
    }
  });

  afterEach(async () => {
    await prisma.userBadge.deleteMany();
  });

  it("definitions returns all badge definitions", async () => {
    const ctx = await createTestContext();
    const caller = callerFor(ctx.userId);

    const result = await caller.badge.definitions();

    expect(result.length).toBeGreaterThan(0);
    expect(result.some((b) => b.slug === "first-loan")).toBe(true);
  });

  it("list returns empty for new user", async () => {
    const ctx = await createTestContext();
    const caller = callerFor(ctx.userId);

    const result = await caller.badge.list({ userId: ctx.userId });

    expect(result).toHaveLength(0);
  });

  it("award procedure no longer exists (security: self-award was possible)", () => {
    // Regression guard : si quelqu'un réintroduit une procédure d'award
    // exposée au client, ce test doit le signaler.
    expect((appRouter as Record<string, any>)._def.procedures["badge.award"]).toBeUndefined();
  });

  it("syncUser awards first-loan to the CALLER after first loan", async () => {
    const ctx = await createTestContext();
    const caller = callerFor(ctx.userId);

    const coll = await prisma.collection.create({
      data: { userId: ctx.userId, name: "Test", type: "BOOK" },
    });
    const obj = await prisma.object.create({
      data: { collectionId: coll.id, name: "Test Object" },
    });
    const borrower = await createTestUser({ email: `borrower-${Date.now()}@example.com` });

    await prisma.loan.create({
      data: {
        objectId: obj.id,
        ownerId: ctx.userId,
        borrowerId: borrower.id,
        status: "RETURNED",
      },
    });

    const result = await caller.badge.syncUser();

    expect(result.awarded).toContain("first-loan");

    const badges = await caller.badge.list({ userId: ctx.userId });
    expect(badges.some((b) => b.slug === "first-loan")).toBe(true);
  });

  it("syncUser cannot grant badges to another user", async () => {
    // L'ancien syncUser({ userId }) permettait de forcer le recalcul (et
    // l'attribution) pour n'importe qui. La nouvelle signature ne prend
    // aucun input : seul le caller est synchronisé.
    const victim = await createTestUser({ email: `victim-${Date.now()}@example.com` });
    const ctx = await createTestContext();
    const caller = callerFor(ctx.userId);

    await caller.badge.syncUser();

    const victimBadges = await prisma.userBadge.findMany({ where: { userId: victim.id } });
    expect(victimBadges).toHaveLength(0);
  });
});
