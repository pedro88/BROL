/**
 * Tests de loans.selfBorrow — éligibilité par mode, limites, anti-abus.
 * Le mode self-service n'avait AUCUN test alors que c'est une surface
 * d'attaque directe (emprunt sans validation de l'owner).
 * @package @brol/api
 */

import { describe, it, expect } from "vitest";
import { appRouter } from "../../router";
import { prisma, createTestContext } from "../../test/setup";

function callerFor(userId: string) {
  return appRouter.createCaller({
    prisma,
    userId,
    headers: {},
    session: { user: { id: userId } },
  });
}

async function seedSelfServiceObject(
  ownerId: string,
  objectMode: "OFF" | "CONTACTS" | "RADIUS" | "PUBLIC",
  collectionMode: "OFF" | "CONTACTS" | "RADIUS" | "PUBLIC" = "OFF"
) {
  const coll = await prisma.collection.create({
    data: {
      userId: ownerId,
      name: "C",
      type: "BOOK",
      selfServiceMode: collectionMode,
    },
  });
  return prisma.object.create({
    data: { collectionId: coll.id, name: "Obj", selfServiceMode: objectMode },
  });
}

describe("loans.selfBorrow", () => {
  it("FORBIDDEN when self-service is OFF (objet ET collection)", async () => {
    const owner = await createTestContext();
    const borrower = await createTestContext();
    const obj = await seedSelfServiceObject(owner.userId, "OFF", "OFF");

    await expect(
      callerFor(borrower.userId).loans.selfBorrow({ objectId: obj.id })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("FORBIDDEN in CONTACTS mode when caller is not a contact of the owner", async () => {
    const owner = await createTestContext();
    const stranger = await createTestContext();
    const obj = await seedSelfServiceObject(owner.userId, "CONTACTS");

    await expect(
      callerFor(stranger.userId).loans.selfBorrow({ objectId: obj.id })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("a contact of ANOTHER user does not qualify (le lien doit être owner→caller)", async () => {
    const owner = await createTestContext();
    const third = await createTestContext();
    const borrower = await createTestContext();
    const obj = await seedSelfServiceObject(owner.userId, "CONTACTS");

    // borrower est contact de `third`, pas de `owner`
    await prisma.contact.create({
      data: { userId: third.userId, name: "B", borrowerId: borrower.userId },
    });

    await expect(
      callerFor(borrower.userId).loans.selfBorrow({ objectId: obj.id })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("succeeds in CONTACTS mode for a real contact + notifies the owner with the borrower's name", async () => {
    const owner = await createTestContext();
    const borrower = await createTestContext();
    await prisma.user.update({
      where: { id: borrower.userId },
      data: { name: "Alice Borrower" },
    });
    const obj = await seedSelfServiceObject(owner.userId, "CONTACTS");
    await prisma.contact.create({
      data: { userId: owner.userId, name: "Alice", borrowerId: borrower.userId },
    });

    const loan = await callerFor(borrower.userId).loans.selfBorrow({ objectId: obj.id });

    expect(loan.status).toBe("ACTIVE");
    expect(loan.borrowerId).toBe(borrower.userId);
    expect(loan.ownerId).toBe(owner.userId);

    const notif = await prisma.notification.findFirst({
      where: { userId: owner.userId, type: "SELF_BORROW" },
    });
    expect(notif).not.toBeNull();
    // Régression 2026-06-12 : include borrower manquant → "Un utilisateur"
    expect(notif!.message).toContain("Alice Borrower");
  });

  it("inherits the collection mode when the object is OFF (cascade)", async () => {
    const owner = await createTestContext();
    const borrower = await createTestContext();
    const obj = await seedSelfServiceObject(owner.userId, "OFF", "PUBLIC");

    const loan = await callerFor(borrower.userId).loans.selfBorrow({ objectId: obj.id });
    expect(loan.status).toBe("ACTIVE");
  });

  it("PUBLIC mode allows any authenticated user", async () => {
    const owner = await createTestContext();
    const stranger = await createTestContext();
    const obj = await seedSelfServiceObject(owner.userId, "PUBLIC");

    const loan = await callerFor(stranger.userId).loans.selfBorrow({ objectId: obj.id });
    expect(loan.status).toBe("ACTIVE");
  });

  it("FORBIDDEN on own object (pas d'auto-emprunt de soi-même)", async () => {
    const owner = await createTestContext();
    const obj = await seedSelfServiceObject(owner.userId, "PUBLIC");

    await expect(
      callerFor(owner.userId).loans.selfBorrow({ objectId: obj.id })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("CONFLICT when the object is already on loan", async () => {
    const owner = await createTestContext();
    const b1 = await createTestContext();
    const b2 = await createTestContext();
    const obj = await seedSelfServiceObject(owner.userId, "PUBLIC");

    await callerFor(b1.userId).loans.selfBorrow({ objectId: obj.id });

    await expect(
      callerFor(b2.userId).loans.selfBorrow({ objectId: obj.id })
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });

  it("enforces the weekly self-borrow limit", async () => {
    const owner = await createTestContext();
    const borrower = await createTestContext();
    // maxSelfBorrowPerWeek défaut = 3 → 3 prêts récents bloquent le 4e
    const coll = await prisma.collection.create({
      data: { userId: owner.userId, name: "C", type: "BOOK", selfServiceMode: "PUBLIC" },
    });
    const objs = await Promise.all(
      Array.from({ length: 4 }, (_, i) =>
        prisma.object.create({
          data: { collectionId: coll.id, name: `Obj ${i}`, selfServiceMode: "PUBLIC" },
        })
      )
    );

    const caller = callerFor(borrower.userId);
    await caller.loans.selfBorrow({ objectId: objs[0].id });
    await caller.loans.selfBorrow({ objectId: objs[1].id });
    await caller.loans.selfBorrow({ objectId: objs[2].id });

    await expect(caller.loans.selfBorrow({ objectId: objs[3].id })).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("RADIUS mode: FORBIDDEN without location, ok inside radius, FORBIDDEN outside", async () => {
    const owner = await createTestContext();
    const borrower = await createTestContext();
    const obj = await seedSelfServiceObject(owner.userId, "RADIUS");

    // Owner localisé à Bruxelles, rayon 25 km
    await prisma.user.update({
      where: { id: owner.userId },
      data: { lat: 50.8503, lng: 4.3517, selfServiceRadiusKm: 25 },
    });

    // 1. Caller sans localisation → FORBIDDEN
    await expect(
      callerFor(borrower.userId).loans.selfBorrow({ objectId: obj.id })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });

    // 2. Caller à Anvers (~45 km) → hors rayon
    await prisma.user.update({
      where: { id: borrower.userId },
      data: { lat: 51.2194, lng: 4.4025 },
    });
    await expect(
      callerFor(borrower.userId).loans.selfBorrow({ objectId: obj.id })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });

    // 3. Caller à Ixelles (~3 km) → dans le rayon
    await prisma.user.update({
      where: { id: borrower.userId },
      data: { lat: 50.8333, lng: 4.3667 },
    });
    const loan = await callerFor(borrower.userId).loans.selfBorrow({ objectId: obj.id });
    expect(loan.status).toBe("ACTIVE");
  });
});

describe("loans — authz retour/annulation", () => {
  async function seedActiveLoan() {
    const owner = await createTestContext();
    const borrower = await createTestContext();
    const coll = await prisma.collection.create({
      data: { userId: owner.userId, name: "C", type: "BOOK" },
    });
    const obj = await prisma.object.create({
      data: { collectionId: coll.id, name: "Obj" },
    });
    const loan = await prisma.loan.create({
      data: {
        objectId: obj.id,
        ownerId: owner.userId,
        borrowerId: borrower.userId,
        status: "ACTIVE",
      },
    });
    return { owner, borrower, loan };
  }

  it("return: the borrower cannot mark the loan returned (owner only)", async () => {
    const { borrower, loan } = await seedActiveLoan();

    await expect(
      callerFor(borrower.userId).loans.return({ loanId: loan.id })
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("return: a third party cannot mark the loan returned", async () => {
    const { loan } = await seedActiveLoan();
    const attacker = await createTestContext();

    await expect(
      callerFor(attacker.userId).loans.return({ loanId: loan.id })
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("cancel: the borrower cannot cancel the loan (owner only)", async () => {
    const { borrower, loan } = await seedActiveLoan();

    await expect(
      callerFor(borrower.userId).loans.cancel({ loanId: loan.id })
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
