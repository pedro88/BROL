/**
 * Tier router tests.
 * @package @brol/api
 */

import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "../../router";
import { prisma, createTestUser, createTestContext } from "../../test/setup";

function callerFor(userId: string) {
  return appRouter.createCaller({ prisma, userId, headers: {}, session: { user: { id: userId } } });
}

describe("tierRouter", () => {
  beforeEach(async () => {
    // Cleanup handled by createTestContext
  });

  it("getLimits returns FREE tier with default limits", async () => {
    const ctx = await createTestContext();
    const caller = appRouter.createCaller({ prisma, userId: ctx.userId, headers: {}, session: { user: { id: ctx.userId } } });

    const result = await caller.tier.getLimits();

    expect(result.tier).toBe("FREE");
    expect(result.limits.collections.max).toBe(5);
    expect(result.limits.objects.max).toBe(50);
    expect(result.limits.activeLoans.max).toBe(10);
    expect(typeof result.limits.collections.current).toBe("number");
  });

  it("getLimits returns TIER_2 tier with larger limits", async () => {
    const ctx = await createTestContext();
    // Set user tier to TIER_2
    await prisma.profile.upsert({
      where: { userId: ctx.userId },
      update: { tier: "TIER_2" },
      create: { userId: ctx.userId, tier: "TIER_2" },
    });

    const caller = appRouter.createCaller({ prisma, userId: ctx.userId, headers: {}, session: { user: { id: ctx.userId } } });
    const result = await caller.tier.getLimits();

    expect(result.tier).toBe("TIER_2");
    expect(result.limits.collections.max).toBe(10);
    expect(result.limits.objects.max).toBe(500);
    expect(result.limits.activeLoans.max).toBe(50);
  });

  it("getLimits returns TIER_3 with unlimited for all", async () => {
    const ctx = await createTestContext();
    await prisma.profile.upsert({
      where: { userId: ctx.userId },
      update: { tier: "TIER_3" },
      create: { userId: ctx.userId, tier: "TIER_3" },
    });

    const caller = appRouter.createCaller({ prisma, userId: ctx.userId, headers: {}, session: { user: { id: ctx.userId } } });
    const result = await caller.tier.getLimits();

    expect(result.tier).toBe("TIER_3");
    expect(result.limits.collections.max).toBe(null);
    expect(result.limits.objects.max).toBe(null);
    expect(result.limits.activeLoans.max).toBe(null);
  });

  it("checkLimit returns allowed when under limit", async () => {
    const ctx = await createTestContext();
    const caller = appRouter.createCaller({ prisma, userId: ctx.userId, headers: {}, session: { user: { id: ctx.userId } } });

    const result = await caller.tier.checkLimit({ type: "collection" });
    expect(result.allowed).toBe(true);
    expect(result.reason).toBe("ok");
  });

  it("upgrade changes tier to TIER_2", async () => {
    const ctx = await createTestContext();
    const caller = appRouter.createCaller({ prisma, userId: ctx.userId, headers: {}, session: { user: { id: ctx.userId } } });

    const result = await caller.tier.upgrade({ tier: "TIER_2" });
    expect(result.success).toBe(true);
    expect(result.tier).toBe("TIER_2");

    const profile = await prisma.profile.findUnique({ where: { userId: ctx.userId } });
    expect(profile?.tier).toBe("TIER_2");
  });

  it("getLimits counts existing collections", async () => {
    const ctx = await createTestContext();
    // Create 2 collections
    await prisma.collection.createMany({
      data: [
        { userId: ctx.userId, name: "Collection 1", type: "BOOK" },
        { userId: ctx.userId, name: "Collection 2", type: "BOARD_GAME" },
      ],
    });

    const caller = appRouter.createCaller({ prisma, userId: ctx.userId, headers: {}, session: { user: { id: ctx.userId } } });
    const result = await caller.tier.getLimits();

    expect(result.limits.collections.current).toBe(2);
  });
});
