/**
 * Tests des critères de badges revus le 2026-06-13 :
 *  - object_max_by_field (même genre / même série)
 *  - object_by_genre_value (genre précis)
 *  - object_by_edition_match (plateforme jeu via `edition`)
 *  - loans_within_days (fenêtre + filtre type)
 *  - on_time_returns_count (vrais retours à temps, pas tous les retours)
 *  - loan_as_owner/borrower_count filtrés par type d'objet
 * @package @brol/api
 */

import { describe, it, expect, beforeEach } from "vitest";
import { syncUserBadges, invalidateStatsCache } from "../badge-service";
import { prisma, createTestContext, createTestUser } from "../../test/setup";

async function seedDef(slug: string, criteria: object) {
  return prisma.badgeDefinition.upsert({
    where: { slug },
    update: { criteria: criteria as never },
    create: { slug, name: slug, description: slug, icon: "🏅", criteria: criteria as never },
  });
}

async function makeCollection(userId: string, type = "BOOK") {
  return prisma.collection.create({ data: { userId, name: `C-${type}`, type: type as never } });
}

describe("badge criteria — genre / series / edition", () => {
  beforeEach(async () => {
    await prisma.notification.deleteMany();
    await prisma.userBadge.deleteMany();
  });

  it("object_max_by_field series: awards when N share the same series", async () => {
    await seedDef("saga-3", { type: "object_max_by_field", threshold: 3, params: { objectType: "FILM", field: "series" } });
    const ctx = await createTestContext();
    const coll = await makeCollection(ctx.userId, "FILM");
    await prisma.object.createMany({
      data: [
        { collectionId: coll.id, name: "F1", objectType: "FILM", series: "Star Wars" },
        { collectionId: coll.id, name: "F2", objectType: "FILM", series: "Star Wars" },
        { collectionId: coll.id, name: "F3", objectType: "FILM", series: "Star Wars" },
        { collectionId: coll.id, name: "F4", objectType: "FILM", series: "Matrix" },
      ],
    });
    const awarded = await syncUserBadges(prisma, ctx.userId);
    expect(awarded).toContain("saga-3");
  });

  it("object_max_by_field series: does NOT award when spread across different series", async () => {
    await seedDef("saga-3b", { type: "object_max_by_field", threshold: 3, params: { objectType: "FILM", field: "series" } });
    const ctx = await createTestContext();
    const coll = await makeCollection(ctx.userId, "FILM");
    await prisma.object.createMany({
      data: [
        { collectionId: coll.id, name: "F1", objectType: "FILM", series: "A" },
        { collectionId: coll.id, name: "F2", objectType: "FILM", series: "B" },
        { collectionId: coll.id, name: "F3", objectType: "FILM", series: "C" },
      ],
    });
    const awarded = await syncUserBadges(prisma, ctx.userId);
    expect(awarded).not.toContain("saga-3b");
  });

  it("object_by_genre_value: counts a specific genre (case-insensitive)", async () => {
    await seedDef("manga-2", { type: "object_by_genre_value", threshold: 2, params: { objectType: "BOOK", value: "manga" } });
    const ctx = await createTestContext();
    const coll = await makeCollection(ctx.userId, "BOOK");
    await prisma.object.createMany({
      data: [
        { collectionId: coll.id, name: "B1", objectType: "BOOK", genre: "Manga" },
        { collectionId: coll.id, name: "B2", objectType: "BOOK", genre: "manga" },
        { collectionId: coll.id, name: "B3", objectType: "BOOK", genre: "Roman" },
      ],
    });
    const awarded = await syncUserBadges(prisma, ctx.userId);
    expect(awarded).toContain("manga-2");
  });

  it("object_by_edition_match: matches platform substring in edition", async () => {
    await seedDef("nes-2", { type: "object_by_edition_match", threshold: 2, params: { objectType: "VIDEOGAME", contains: "nes" } });
    const ctx = await createTestContext();
    const coll = await makeCollection(ctx.userId, "VIDEOGAME");
    await prisma.object.createMany({
      data: [
        { collectionId: coll.id, name: "G1", objectType: "VIDEOGAME", edition: "NES" },
        { collectionId: coll.id, name: "G2", objectType: "VIDEOGAME", edition: "Super NES" },
        { collectionId: coll.id, name: "G3", objectType: "VIDEOGAME", edition: "Mega Drive" },
      ],
    });
    const awarded = await syncUserBadges(prisma, ctx.userId);
    expect(awarded).toContain("nes-2");
  });
});

describe("badge criteria — loans (window, on-time, per-type)", () => {
  beforeEach(async () => {
    await prisma.notification.deleteMany();
    await prisma.userBadge.deleteMany();
  });

  async function makeLoan(opts: {
    ownerId: string;
    borrowerId: string;
    objectId: string;
    status?: string;
    createdAt?: Date;
    returnDueDate?: Date | null;
    returnedAt?: Date | null;
  }) {
    return prisma.loan.create({
      data: {
        ownerId: opts.ownerId,
        borrowerId: opts.borrowerId,
        objectId: opts.objectId,
        status: (opts.status ?? "ACTIVE") as never,
        createdAt: opts.createdAt ?? new Date(),
        returnDueDate: opts.returnDueDate ?? null,
        returnedAt: opts.returnedAt ?? null,
      },
    });
  }

  it("on_time_returns_count counts only returns made on time (not late ones)", async () => {
    await seedDef("ontime-1", { type: "on_time_returns_count", threshold: 1 });
    const ctx = await createTestContext();
    const borrower = await createTestUser({ email: `b1-${Date.now()}@ex.com` });
    const coll = await makeCollection(ctx.userId);
    const obj = await prisma.object.create({ data: { collectionId: coll.id, name: "O" } });
    // Un seul retour, EN RETARD (returnedAt après l'échéance).
    await makeLoan({
      ownerId: ctx.userId,
      borrowerId: borrower.id,
      objectId: obj.id,
      status: "RETURNED",
      returnDueDate: new Date("2026-06-01"),
      returnedAt: new Date("2026-06-10"),
    });
    const awarded = await syncUserBadges(prisma, ctx.userId);
    // Avant le fix, on_time comptait tous les retours → aurait débloqué à tort.
    expect(awarded).not.toContain("ontime-1");
  });

  it("on_time_returns_count awards a punctual return", async () => {
    await seedDef("ontime-2", { type: "on_time_returns_count", threshold: 1 });
    const ctx = await createTestContext();
    const borrower = await createTestUser({ email: `b2-${Date.now()}@ex.com` });
    const coll = await makeCollection(ctx.userId);
    const obj = await prisma.object.create({ data: { collectionId: coll.id, name: "O" } });
    await makeLoan({
      ownerId: ctx.userId,
      borrowerId: borrower.id,
      objectId: obj.id,
      status: "RETURNED",
      returnDueDate: new Date("2026-06-10"),
      returnedAt: new Date("2026-06-05"),
    });
    const awarded = await syncUserBadges(prisma, ctx.userId);
    expect(awarded).toContain("ontime-2");
  });

  it("loan_as_owner_count filters by objectType", async () => {
    await seedDef("lent-tool-2", { type: "loan_as_owner_count", threshold: 2, params: { objectType: "TOOL" } });
    const ctx = await createTestContext();
    const borrower = await createTestUser({ email: `b3-${Date.now()}@ex.com` });
    const toolColl = await makeCollection(ctx.userId, "TOOL");
    const bookColl = await makeCollection(ctx.userId, "BOOK");
    const tool1 = await prisma.object.create({ data: { collectionId: toolColl.id, name: "T1", objectType: "TOOL" } });
    const book1 = await prisma.object.create({ data: { collectionId: bookColl.id, name: "B1", objectType: "BOOK" } });
    // 1 prêt d'outil + 1 prêt de livre → seulement 1 outil prêté < 2.
    await makeLoan({ ownerId: ctx.userId, borrowerId: borrower.id, objectId: tool1.id });
    await makeLoan({ ownerId: ctx.userId, borrowerId: borrower.id, objectId: book1.id });
    const awarded1 = await syncUserBadges(prisma, ctx.userId);
    expect(awarded1).not.toContain("lent-tool-2");

    // Ajout d'un 2e prêt d'outil → seuil atteint. Invalide le cache stats (60s).
    const tool2 = await prisma.object.create({ data: { collectionId: toolColl.id, name: "T2", objectType: "TOOL" } });
    await makeLoan({ ownerId: ctx.userId, borrowerId: borrower.id, objectId: tool2.id });
    invalidateStatsCache(ctx.userId);
    const awarded2 = await syncUserBadges(prisma, ctx.userId);
    expect(awarded2).toContain("lent-tool-2");
  });
});
