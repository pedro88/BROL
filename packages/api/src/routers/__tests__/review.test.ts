/**
 * Review router tests — list / canReview / create.
 *
 * @package @brol/api
 */

import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "../../router";
import {
  prisma,
  createTestUser,
  createTestCollection,
  createTestObject,
} from "../../test/setup";

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

async function createReturnedLoan(ownerId: string, borrowerId: string) {
  const col = await createTestCollection(ownerId);
  const obj = await createTestObject(col.id);
  return prisma.loan.create({
    data: {
      objectId: obj.id,
      ownerId,
      borrowerId,
      status: "RETURNED",
      returnedAt: new Date(),
    },
  });
}

describe("reviewRouter", () => {
  let alice: Awaited<ReturnType<typeof createTestUser>>;
  let bob: Awaited<ReturnType<typeof createTestUser>>;
  let charlie: Awaited<ReturnType<typeof createTestUser>>;

  beforeEach(async () => {
    await prisma.notification.deleteMany();
    await prisma.review.deleteMany();
    await prisma.loan.deleteMany();
    await prisma.object.deleteMany();
    await prisma.collection.deleteMany();
    await prisma.userBadge.deleteMany();
    await prisma.user.deleteMany();

    alice = await createTestUser({ email: "alice@example.com", name: "Alice" });
    bob = await createTestUser({ email: "bob@example.com", name: "Bob" });
    charlie = await createTestUser({ email: "charlie@example.com", name: "Charlie" });
  });

  // -------------------------------------------------------------------------
  // canReview
  // -------------------------------------------------------------------------

  describe("canReview", () => {
    it("refuses self-review", async () => {
      const res = await callerFor(alice.id).review.canReview({ targetId: alice.id });
      expect(res).toEqual({ canReview: false, reason: "cannot_review_self" });
    });

    it("refuses when no exchange exists between users", async () => {
      const res = await callerFor(alice.id).review.canReview({ targetId: bob.id });
      expect(res).toEqual({ canReview: false, reason: "no_exchange" });
    });

    it("allows when a RETURNED loan exists between users", async () => {
      await createReturnedLoan(alice.id, bob.id);
      const res = await callerFor(alice.id).review.canReview({ targetId: bob.id });
      expect(res.canReview).toBe(true);
      expect(res.loanId).toBeDefined();
    });

    it("works in both directions (owner reviews borrower AND borrower reviews owner)", async () => {
      await createReturnedLoan(alice.id, bob.id);
      const bobView = await callerFor(bob.id).review.canReview({ targetId: alice.id });
      expect(bobView.canReview).toBe(true);
    });

    it("refuses when author already reviewed the same loan", async () => {
      const loan = await createReturnedLoan(alice.id, bob.id);
      await prisma.review.create({
        data: {
          authorId: alice.id,
          targetId: bob.id,
          loanId: loan.id,
          rating: 5,
        },
      });
      const res = await callerFor(alice.id).review.canReview({ targetId: bob.id });
      expect(res).toEqual({ canReview: false, reason: "already_reviewed" });
    });
  });

  // -------------------------------------------------------------------------
  // create
  // -------------------------------------------------------------------------

  describe("create", () => {
    it("creates a review tied to the returned loan", async () => {
      await createReturnedLoan(alice.id, bob.id);
      const res = await callerFor(alice.id).review.create({
        targetId: bob.id,
        rating: 5,
        comment: "great",
      });
      expect(res.rating).toBe(5);
      expect(res.comment).toBe("great");
      expect(res.targetId).toBe(bob.id);
    });

    it("emits a notification to the target user", async () => {
      await createReturnedLoan(alice.id, bob.id);
      await callerFor(alice.id).review.create({
        targetId: bob.id,
        rating: 4,
        comment: "ok",
      });
      const notifs = await prisma.notification.findMany({ where: { userId: bob.id } });
      expect(notifs).toHaveLength(1);
      expect(notifs[0].type).toBe("REVIEW_RECEIVED");
    });

    it("rejects a self-review", async () => {
      await expect(
        callerFor(alice.id).review.create({ targetId: alice.id, rating: 5 }),
      ).rejects.toThrow(/vous-même|yourself/i);
    });

    it("rejects when no RETURNED loan exists", async () => {
      await expect(
        callerFor(alice.id).review.create({ targetId: bob.id, rating: 5 }),
      ).rejects.toThrow(/aucun échange|no exchange/i);
    });

    it("rejects a duplicate (same author + same loan)", async () => {
      await createReturnedLoan(alice.id, bob.id);
      await callerFor(alice.id).review.create({ targetId: bob.id, rating: 5 });
      await expect(
        callerFor(alice.id).review.create({ targetId: bob.id, rating: 3 }),
      ).rejects.toThrow(/déjà|already/i);
    });
  });

  // -------------------------------------------------------------------------
  // list (public)
  // -------------------------------------------------------------------------

  describe("list", () => {
    it("returns empty when no reviews on target", async () => {
      const res = await publicCaller().review.list({ targetId: charlie.id });
      expect(res.items).toHaveLength(0);
    });

    it("returns reviews ordered newest first with author info", async () => {
      const loan1 = await createReturnedLoan(alice.id, charlie.id);
      const loan2 = await createReturnedLoan(bob.id, charlie.id);

      await prisma.review.create({
        data: {
          authorId: alice.id,
          targetId: charlie.id,
          loanId: loan1.id,
          rating: 4,
          comment: "good",
          createdAt: new Date(2026, 0, 1),
        },
      });
      await prisma.review.create({
        data: {
          authorId: bob.id,
          targetId: charlie.id,
          loanId: loan2.id,
          rating: 5,
          comment: "great",
          createdAt: new Date(2026, 1, 1),
        },
      });

      const res = await publicCaller().review.list({ targetId: charlie.id });
      expect(res.items).toHaveLength(2);
      expect(res.items[0].rating).toBe(5);
      expect(res.items[0].author.name).toBe("Bob");
      expect(res.items[1].rating).toBe(4);
    });
  });
});
