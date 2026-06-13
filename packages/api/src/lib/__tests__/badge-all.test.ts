/**
 * Test exhaustif : CHAQUE badge du seed doit être débloquable.
 *
 * Pour chaque définition, on crée un utilisateur frais + les fixtures minimales
 * qui satisfont son critère, puis on vérifie que `syncUserBadges` l'attribue.
 * Un badge non débloqué ici = critère impossible à satisfaire (badge mort).
 *
 * @package @brol/api
 */

import { describe, it, expect, beforeAll } from "vitest";
import { ALL_BADGE_DEFINITIONS, svgAssetFor, type BadgeDef } from "@brol/db";
import { syncUserBadges, invalidateStatsCache } from "../badge-service";
import { prisma, createTestUser } from "../../test/setup";

interface Criteria {
  type: string;
  threshold?: number;
  operator?: string;
  params?: Record<string, unknown>;
}

let counter = 0;
const uid = () => `c${Date.now().toString(36)}${(counter++).toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`;

async function makeUser() {
  return createTestUser({ email: `all-${uid()}@ex.com` });
}

async function makeCollection(userId: string, type: string) {
  return prisma.collection.create({ data: { userId, name: `C-${type}-${uid()}`, type: type as never } });
}

/** Crée `n` objets d'un type dans une collection, avec champs additionnels. */
async function makeObjects(userId: string, type: string, n: number, extra: Record<string, unknown> = {}) {
  const coll = await makeCollection(userId, type);
  await prisma.object.createMany({
    data: Array.from({ length: n }, (_, i) => ({
      collectionId: coll.id,
      name: `${type}-${i}-${uid()}`,
      objectType: type as never,
      ...extra,
    })),
  });
  return coll;
}

/** Crée `n` prêts. owner/borrower selon les rôles ; objets du type donné. */
async function makeLoans(opts: {
  ownerId: string;
  borrowerId: string;
  type?: string;
  n: number;
  status?: string;
  createdAt?: Date;
  returnDueDate?: Date | null;
  returnedAt?: Date | null;
  collectionOwnerId?: string;
}) {
  const type = opts.type ?? "BOOK";
  const collOwner = opts.collectionOwnerId ?? opts.ownerId;
  const coll = await makeCollection(collOwner, type);
  const obj = await prisma.object.create({
    data: { collectionId: coll.id, name: `obj-${uid()}`, objectType: type as never },
  });
  await prisma.loan.createMany({
    data: Array.from({ length: opts.n }, () => ({
      objectId: obj.id,
      ownerId: opts.ownerId,
      borrowerId: opts.borrowerId,
      status: (opts.status ?? "ACTIVE") as never,
      createdAt: opts.createdAt ?? new Date(),
      returnDueDate: opts.returnDueDate ?? null,
      returnedAt: opts.returnedAt ?? null,
    })),
  });
}

/**
 * Construit les données minimales pour satisfaire un critère.
 * Retourne false si le type de critère n'est pas géré (→ échec explicite).
 */
async function buildFixture(userId: string, c: Criteria): Promise<boolean> {
  const n = c.threshold ?? 1;
  const p = c.params ?? {};
  const type = (p.objectType as string) ?? "BOOK";
  const other = await makeUser();

  switch (c.type) {
    case "object_by_type":
      await makeObjects(userId, type, n);
      return true;
    case "object_count":
      await makeObjects(userId, "BOOK", n);
      return true;
    case "object_max_by_field": {
      const field = (p.field as string) ?? "genre";
      await makeObjects(userId, type, n, { [field]: "même-valeur" });
      return true;
    }
    case "object_by_genre_value":
      await makeObjects(userId, type, n, { genre: p.value as string });
      return true;
    case "object_by_edition_match":
      await makeObjects(userId, type, n, { edition: p.contains as string });
      return true;
    case "object_with_isbn_count":
      // ISBN unique par objet pour rester réaliste.
      {
        const coll = await makeCollection(userId, type);
        await prisma.object.createMany({
          data: Array.from({ length: n }, (_, i) => ({
            collectionId: coll.id,
            name: `isbn-${i}-${uid()}`,
            objectType: type as never,
            isbn: `978${String(i).padStart(10, "0")}`,
          })),
        });
      }
      return true;
    case "object_with_photos_count": {
      const coll = await makeCollection(userId, type);
      for (let i = 0; i < n; i++) {
        const o = await prisma.object.create({
          data: { collectionId: coll.id, name: `ph-${i}-${uid()}`, objectType: type as never },
        });
        await prisma.photo.create({ data: { objectId: o.id, url: `https://x/${uid()}.jpg`, position: 0 } });
      }
      return true;
    }
    case "loan_as_owner_count":
      await makeLoans({ ownerId: userId, borrowerId: other.id, type: p.objectType as string, n });
      return true;
    case "loan_as_borrower_count":
      await makeLoans({ ownerId: other.id, borrowerId: userId, type: p.objectType as string, n, collectionOwnerId: other.id });
      return true;
    case "loan_count":
      await makeLoans({ ownerId: userId, borrowerId: other.id, n });
      return true;
    case "loans_this_month":
      await makeLoans({ ownerId: userId, borrowerId: other.id, n });
      return true;
    case "loans_within_days":
      await makeLoans({ ownerId: other.id, borrowerId: userId, type: p.objectType as string, n, collectionOwnerId: other.id, createdAt: new Date() });
      return true;
    case "on_time_returns_count":
      await makeLoans({
        ownerId: userId,
        borrowerId: other.id,
        n,
        status: "RETURNED",
        returnDueDate: new Date(Date.now() + 5 * 86400000),
        returnedAt: new Date(),
      });
      return true;
    case "loan_streak": {
      // `n` mois consécutifs avec un prêt (borrower).
      const coll = await makeCollection(other.id, "BOOK");
      const obj = await prisma.object.create({ data: { collectionId: coll.id, name: `s-${uid()}` } });
      const now = new Date();
      for (let i = 0; i < n; i++) {
        await prisma.loan.create({
          data: {
            objectId: obj.id, ownerId: other.id, borrowerId: userId, status: "ACTIVE",
            createdAt: new Date(now.getFullYear(), now.getMonth() - i, 15),
          },
        });
      }
      return true;
    }
    case "review_count": {
      // `n` avis écrits par l'utilisateur (loanId unique par avis).
      const coll = await makeCollection(userId, "BOOK");
      const obj = await prisma.object.create({ data: { collectionId: coll.id, name: `r-${uid()}` } });
      for (let i = 0; i < n; i++) {
        const loan = await prisma.loan.create({
          data: { objectId: obj.id, ownerId: userId, borrowerId: other.id, status: "RETURNED" },
        });
        await prisma.review.create({
          data: { authorId: userId, targetId: other.id, loanId: loan.id, rating: 5 },
        });
      }
      return true;
    }
    case "avg_rating": {
      // Avis REÇUS avec note = seuil (avg = seuil).
      const coll = await makeCollection(other.id, "BOOK");
      const obj = await prisma.object.create({ data: { collectionId: coll.id, name: `ar-${uid()}` } });
      const loan = await prisma.loan.create({
        data: { objectId: obj.id, ownerId: other.id, borrowerId: userId, status: "RETURNED" },
      });
      await prisma.review.create({
        data: { authorId: other.id, targetId: userId, loanId: loan.id, rating: Math.max(1, Math.min(5, n)) },
      });
      return true;
    }
    case "member_since_days": {
      if (c.operator === ">=") {
        await prisma.user.update({
          where: { id: userId },
          data: { createdAt: new Date(Date.now() - (n + 30) * 86400000) },
        });
      }
      // operator "<=" ou défaut : un user fraîchement créé (≈0 jour) satisfait.
      return true;
    }
    case "categories_represented": {
      const types = ["BOOK", "FILM", "VIDEOGAME", "TOOL", "BOARD_GAME", "ELECTRONIC", "ELECTRIC", "MUSIC", "CLOTHING", "CUSTOM"];
      for (let i = 0; i < n; i++) await makeObjects(userId, types[i % types.length], 1);
      return true;
    }
    case "contact_count":
      await prisma.contact.createMany({
        data: Array.from({ length: n }, (_, i) => ({ userId, name: `ct-${i}-${uid()}` })),
      });
      return true;
    case "qr_generated_count":
      await prisma.qrStock.createMany({
        data: Array.from({ length: n }, () => ({ userId, code: uid() })),
      });
      return true;
    case "messages_sent_count": {
      const req = await prisma.communityRequest.create({
        data: { authorId: other.id, title: `req-${uid()}` },
      });
      await prisma.requestMessage.createMany({
        data: Array.from({ length: n }, () => ({
          requestId: req.id, fromUserId: userId, toUserId: other.id, content: "hi",
        })),
      });
      return true;
    }
    case "requests_fulfilled_by_count": {
      // `n` demandes (par `other`) satisfaites par une demande de l'utilisateur.
      const mine = await prisma.communityRequest.create({
        data: { authorId: userId, title: `mine-${uid()}` },
      });
      for (let i = 0; i < n; i++) {
        await prisma.communityRequest.create({
          data: { authorId: other.id, title: `theirs-${i}-${uid()}`, fulfillByRequestId: mine.id },
        });
      }
      return true;
    }
    default:
      return false;
  }
}

describe("tous les badges sont débloquables", () => {
  beforeAll(async () => {
    // Seed des définitions réelles dans la DB de test.
    for (const badge of ALL_BADGE_DEFINITIONS) {
      const data = { ...badge, svgAsset: svgAssetFor(badge) } as never;
      await prisma.badgeDefinition.upsert({ where: { slug: badge.slug }, update: data, create: data });
    }
  }, 60000);

  it("couvre les 107 définitions du seed", () => {
    expect(ALL_BADGE_DEFINITIONS.length).toBeGreaterThanOrEqual(100);
  });

  // Un test par badge : fixtures → sync → doit être attribué.
  for (const badge of ALL_BADGE_DEFINITIONS as BadgeDef[]) {
    it(`débloque "${badge.slug}" (${(badge.criteria as Criteria).type})`, async () => {
      const user = await makeUser();
      const handled = await buildFixture(user.id, badge.criteria as Criteria);
      expect(handled, `type de critère non géré: ${(badge.criteria as Criteria).type}`).toBe(true);

      invalidateStatsCache(user.id);
      const awarded = await syncUserBadges(prisma, user.id);
      expect(awarded).toContain(badge.slug);
    }, 20000);
  }
});
