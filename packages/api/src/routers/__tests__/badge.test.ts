/**
 * Badge router tests.
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

/** Seed badge definitions once before all tests */
describe("badgeRouter", () => {
  beforeEach(async () => {
    // Seed badge definitions if not already present
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
    const caller = appRouter.createCaller({ prisma, userId: ctx.userId, headers: {}, session: { user: { id: ctx.userId } } });

    const result = await caller.badge.definitions();

    expect(result.length).toBeGreaterThan(0);
    expect(result.some((b) => b.slug === "first-loan")).toBe(true);
  });

  it("list returns empty for new user", async () => {
    const ctx = await createTestContext();
    const caller = appRouter.createCaller({ prisma, userId: ctx.userId, headers: {}, session: { user: { id: ctx.userId } } });

    const result = await caller.badge.list({ userId: ctx.userId });

    expect(result).toHaveLength(0);
  });

  it("award creates a badge for user", async () => {
    const ctx = await createTestContext();
    const caller = appRouter.createCaller({ prisma, userId: ctx.userId, headers: {}, session: { user: { id: ctx.userId } } });

    const result = await caller.badge.award({ userId: ctx.userId, badgeSlug: "first-loan" });

    expect(result.awarded).toBe(true);
    expect(result.badge.slug).toBe("first-loan");

    const list = await caller.badge.list({ userId: ctx.userId });
    expect(list).toHaveLength(1);
    expect(list[0].slug).toBe("first-loan");
  });

  it("award returns alreadyHas if badge exists", async () => {
    const ctx = await createTestContext();
    const caller = appRouter.createCaller({ prisma, userId: ctx.userId, headers: {}, session: { user: { id: ctx.userId } } });

    await caller.badge.award({ userId: ctx.userId, badgeSlug: "first-loan" });
    const result = await caller.badge.award({ userId: ctx.userId, badgeSlug: "first-loan" });

    expect(result.awarded).toBe(false);
    expect(result.alreadyHas).toBe(true);
  });

  it("syncUser awards first-loan after first loan", async () => {
    const ctx = await createTestContext();
    const caller = appRouter.createCaller({ prisma, userId: ctx.userId, headers: {}, session: { user: { id: ctx.userId } } });

    // Create a collection and object first
    const coll = await prisma.collection.create({
      data: { userId: ctx.userId, name: "Test", type: "BOOK" },
    });
    const obj = await prisma.object.create({
      data: { collectionId: coll.id, name: "Test Object" },
    });
    const borrower = await createTestUser({ email: "borrower@example.com" });

    // Create a loan
    await prisma.loan.create({
      data: {
        objectId: obj.id,
        ownerId: ctx.userId,
        borrowerId: borrower.id,
        status: "RETURNED",
      },
    });

    const result = await caller.badge.syncUser({ userId: ctx.userId });

    expect(result.awarded).toContain("first-loan");

    const badges = await caller.badge.list({ userId: ctx.userId });
    expect(badges.some((b) => b.slug === "first-loan")).toBe(true);
  });
});
