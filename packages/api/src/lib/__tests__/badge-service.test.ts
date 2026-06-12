/**
 * Tests du moteur de badges (lib/badge-service.ts).
 * @package @brol/api
 */

import { describe, it, expect, beforeEach } from "vitest";
import { syncUserBadges } from "../badge-service";
import { prisma, createTestContext } from "../../test/setup";

async function seedDef(slug: string, criteria: object) {
  return prisma.badgeDefinition.upsert({
    where: { slug },
    update: { criteria: criteria as never },
    create: {
      slug,
      name: slug,
      description: slug,
      icon: "🏅",
      criteria: criteria as never,
    },
  });
}

describe("syncUserBadges", () => {
  beforeEach(async () => {
    await prisma.notification.deleteMany();
    await prisma.userBadge.deleteMany();
  });

  it("counts VIDEOGAME objects for object_by_type (regression 2026-06-12)", async () => {
    // VIDEOGAME manquait de la liste objectByType → tous les badges GAMING
    // étaient indébloquables.
    await seedDef("first-game-test", {
      type: "object_by_type",
      threshold: 1,
      params: { objectType: "VIDEOGAME" },
    });
    const ctx = await createTestContext();
    const coll = await prisma.collection.create({
      data: { userId: ctx.userId, name: "Jeux", type: "VIDEOGAME" },
    });
    await prisma.object.create({
      data: { collectionId: coll.id, name: "Zelda", objectType: "VIDEOGAME" },
    });

    const awarded = await syncUserBadges(prisma, ctx.userId);

    expect(awarded).toContain("first-game-test");
  });

  it("creates a BADGE_UNLOCKED notification on unlock", async () => {
    await seedDef("collector-1-test", { type: "object_count", threshold: 1 });
    const ctx = await createTestContext();
    const coll = await prisma.collection.create({
      data: { userId: ctx.userId, name: "C", type: "BOOK" },
    });
    await prisma.object.create({ data: { collectionId: coll.id, name: "Livre" } });

    await syncUserBadges(prisma, ctx.userId);

    const notif = await prisma.notification.findFirst({
      where: { userId: ctx.userId, type: "BADGE_UNLOCKED" },
    });
    expect(notif).not.toBeNull();
    expect(notif!.relatedType).toBe("badge");
  });

  it("is idempotent: second sync does not duplicate badge nor notification", async () => {
    await seedDef("collector-1-test", { type: "object_count", threshold: 1 });
    const ctx = await createTestContext();
    const coll = await prisma.collection.create({
      data: { userId: ctx.userId, name: "C", type: "BOOK" },
    });
    await prisma.object.create({ data: { collectionId: coll.id, name: "Livre" } });

    const first = await syncUserBadges(prisma, ctx.userId);
    const second = await syncUserBadges(prisma, ctx.userId);

    expect(first).toContain("collector-1-test");
    expect(second).not.toContain("collector-1-test");

    const badges = await prisma.userBadge.findMany({ where: { userId: ctx.userId } });
    expect(badges.filter((b) => b.userId === ctx.userId)).toHaveLength(1);

    const notifs = await prisma.notification.findMany({
      where: { userId: ctx.userId, type: "BADGE_UNLOCKED" },
    });
    expect(notifs).toHaveLength(1);
  });

  it("does not award below threshold", async () => {
    await seedDef("collector-10-test", { type: "object_count", threshold: 10 });
    const ctx = await createTestContext();
    const coll = await prisma.collection.create({
      data: { userId: ctx.userId, name: "C", type: "BOOK" },
    });
    await prisma.object.createMany({
      data: Array.from({ length: 9 }, (_, i) => ({
        collectionId: coll.id,
        name: `Obj ${i}`,
      })),
    });

    const awarded = await syncUserBadges(prisma, ctx.userId);
    expect(awarded).not.toContain("collector-10-test");
  });

  it("ignores definitions with unknown criteria type (forward compat)", async () => {
    await seedDef("future-badge-test", { type: "criteria_from_the_future", threshold: 1 });
    const ctx = await createTestContext();

    const awarded = await syncUserBadges(prisma, ctx.userId);
    expect(awarded).not.toContain("future-badge-test");
  });

  it("only considers the target user's data", async () => {
    await seedDef("collector-1-test", { type: "object_count", threshold: 1 });
    const rich = await createTestContext();
    const poor = await createTestContext();
    const coll = await prisma.collection.create({
      data: { userId: rich.userId, name: "C", type: "BOOK" },
    });
    await prisma.object.create({ data: { collectionId: coll.id, name: "Livre" } });

    const awarded = await syncUserBadges(prisma, poor.userId);
    expect(awarded).not.toContain("collector-1-test");
  });
});
