/**
 * Loans router tests.
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

/** Create a tRPC caller for a given userId */
function callerFor(userId: string) {
  return appRouter.createCaller({ prisma, userId, headers: {} });
}

describe("loansRouter", () => {
  let owner: Awaited<ReturnType<typeof createTestUser>>;
  let borrower: Awaited<ReturnType<typeof createTestUser>>;
  let collection: Awaited<ReturnType<typeof createTestCollection>>;
  let object: Awaited<ReturnType<typeof createTestObject>>;

  beforeEach(async () => {
    await prisma.loan.deleteMany();
    await prisma.object.deleteMany();
    await prisma.collection.deleteMany();
    await prisma.user.deleteMany();

    owner = await createTestUser({ email: "owner@example.com", name: "Owner" });
    borrower = await createTestUser({ email: "borrower@example.com", name: "Borrower" });
    collection = await createTestCollection(owner.id);
    object = await createTestObject(collection.id, { name: "Loanable Object" });
  });

  describe("lentOut", () => {
    it("returns empty list when no active loans", async () => {
      const result = await callerFor(owner.id).loans.lentOut();
      expect(result.items).toHaveLength(0);
    });

    it("returns active loans for owner", async () => {
      await prisma.loan.create({
        data: {
          objectId: object.id,
          ownerId: owner.id,
          borrowerId: borrower.id,
          status: "ACTIVE",
          returnDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      const result = await callerFor(owner.id).loans.lentOut();
      expect(result.items).toHaveLength(1);
      expect(result.items[0].object.name).toBe("Loanable Object");
      expect(result.items[0].borrower.name).toBe("Borrower");
    });
  });

  describe("borrowed", () => {
    it("returns empty list when nothing borrowed", async () => {
      const result = await callerFor(borrower.id).loans.borrowed();
      expect(result.items).toHaveLength(0);
    });

    it("returns borrowed items for borrower", async () => {
      await prisma.loan.create({
        data: {
          objectId: object.id,
          ownerId: owner.id,
          borrowerId: borrower.id,
          status: "ACTIVE",
          returnDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      const result = await callerFor(borrower.id).loans.borrowed();
      expect(result.items).toHaveLength(1);
      expect(result.items[0].object.name).toBe("Loanable Object");
    });
  });

  describe("create", () => {
    it("creates a loan for own object", async () => {
      const result = await callerFor(owner.id).loans.create({
        objectId: object.id,
        borrowerId: borrower.id,
        returnDueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      });
      expect(result.status).toBe("ACTIVE");
      expect(result.borrowerId).toBe(borrower.id);
    });

    it("throws for other user's object", async () => {
      const otherCollection = await createTestCollection(borrower.id);
      const otherObject = await createTestObject(otherCollection.id);
      await expect(
        callerFor(owner.id).loans.create({
          objectId: otherObject.id,
          borrowerId: borrower.id,
        })
      ).rejects.toThrow("Objet non trouvé");
    });

    it("throws when object already on loan", async () => {
      await prisma.loan.create({
        data: {
          objectId: object.id,
          ownerId: owner.id,
          borrowerId: borrower.id,
          status: "ACTIVE",
          returnDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      const anotherBorrower = await createTestUser({ email: "another@example.com" });
      await expect(
        callerFor(owner.id).loans.create({
          objectId: object.id,
          borrowerId: anotherBorrower.id,
        })
      ).rejects.toThrow("déjà prêté");
    });
  });

  describe("return", () => {
    it("marks loan as returned", async () => {
      const loan = await prisma.loan.create({
        data: {
          objectId: object.id,
          ownerId: owner.id,
          borrowerId: borrower.id,
          status: "ACTIVE",
          returnDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      const result = await callerFor(owner.id).loans.return({ loanId: loan.id });
      expect(result.status).toBe("RETURNED");
      expect(result.returnedAt).toBeTruthy();
    });

    it("throws when loan already returned", async () => {
      const loan = await prisma.loan.create({
        data: {
          objectId: object.id,
          ownerId: owner.id,
          borrowerId: borrower.id,
          status: "RETURNED",
          returnedAt: new Date(),
        },
      });

      await expect(
        callerFor(owner.id).loans.return({ loanId: loan.id })
      ).rejects.toThrow();
    });
  });

  describe("cancel", () => {
    it("cancels an active loan", async () => {
      const loan = await prisma.loan.create({
        data: {
          objectId: object.id,
          ownerId: owner.id,
          borrowerId: borrower.id,
          status: "ACTIVE",
        },
      });

      const result = await callerFor(owner.id).loans.cancel({ loanId: loan.id });
      expect(result.status).toBe("CANCELLED");
    });
  });

  describe("history", () => {
    it("returns all loans for owner", async () => {
      await prisma.loan.create({
        data: {
          objectId: object.id,
          ownerId: owner.id,
          borrowerId: borrower.id,
          status: "ACTIVE",
        },
      });

      const result = await callerFor(owner.id).loans.history();
      expect(result.items).toHaveLength(1);
    });
  });
});
