/**
 * Tests de la logique d'abonnement (lib/billing.ts).
 *  - `resolveEffectiveTier` / `computeTierExpiry` : pur, sans DB.
 *  - `processMolliePayment` : intégration (DB de test + fetch Mollie mocké) —
 *    crédit du tier, création de subscription, idempotence, récurrent.
 * @package @brol/api
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  resolveEffectiveTier,
  computeTierExpiry,
  processMolliePayment,
} from "../billing";
import { prisma, createTestContext } from "../../test/setup";

describe("resolveEffectiveTier", () => {
  const now = new Date("2026-06-13T12:00:00Z");

  it("FREE stays FREE", () => {
    expect(resolveEffectiveTier("FREE", null, now)).toBe("FREE");
  });

  it("paid tier with no expiry stays paid", () => {
    expect(resolveEffectiveTier("TIER_2", null, now)).toBe("TIER_2");
  });

  it("paid tier with a future expiry stays paid", () => {
    const future = new Date("2026-07-13T12:00:00Z");
    expect(resolveEffectiveTier("TIER_3", future, now)).toBe("TIER_3");
  });

  it("paid tier whose expiry has passed falls back to FREE", () => {
    const past = new Date("2026-06-01T12:00:00Z");
    expect(resolveEffectiveTier("TIER_2", past, now)).toBe("FREE");
  });
});

describe("computeTierExpiry", () => {
  it("adds one month + 3 days of grace", () => {
    const paidAt = new Date("2026-06-13T00:00:00Z");
    const expiry = computeTierExpiry(paidAt);
    // ~34 jours plus tard (1 mois calendaire + 3 jours).
    expect(expiry.getTime()).toBeGreaterThan(paidAt.getTime());
    const days = (expiry.getTime() - paidAt.getTime()) / (1000 * 60 * 60 * 24);
    expect(days).toBeGreaterThanOrEqual(31);
    expect(days).toBeLessThanOrEqual(35);
  });
});

describe("processMolliePayment", () => {
  const fetchMock = vi.fn();
  const ORIGINAL_KEY = process.env.MOLLIE_API_KEY;

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
    process.env.MOLLIE_API_KEY = "test_abc";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    if (ORIGINAL_KEY === undefined) delete process.env.MOLLIE_API_KEY;
    else process.env.MOLLIE_API_KEY = ORIGINAL_KEY;
  });

  function reply(obj: unknown) {
    return { ok: true, status: 200, text: async () => JSON.stringify(obj) };
  }

  /** Route le fetch mocké selon (méthode, url). */
  function routeMollie(opts: {
    payment: Record<string, unknown>;
    subscriptionId?: string;
  }) {
    fetchMock.mockImplementation(async (url: string, init?: { method?: string }) => {
      const method = init?.method ?? "GET";
      if (method === "GET" && /\/payments\//.test(url)) {
        return reply(opts.payment);
      }
      if (method === "POST" && /\/subscriptions$/.test(url)) {
        return reply({ id: opts.subscriptionId ?? "sub_1", status: "active" });
      }
      throw new Error(`unexpected ${method} ${url}`);
    });
  }

  it("first payment paid → creates subscription + credits the tier", async () => {
    const { userId } = await createTestContext();
    routeMollie({
      payment: {
        id: "tr_first",
        status: "paid",
        amount: { currency: "EUR", value: "3.00" },
        sequenceType: "first",
        customerId: "cus_1",
        paidAt: "2026-06-13T10:00:00Z",
        metadata: { userId, tier: "TIER_2" },
      },
      subscriptionId: "sub_42",
    });

    await processMolliePayment(prisma, "tr_first");

    const profile = await prisma.profile.findUnique({ where: { userId } });
    expect(profile?.tier).toBe("TIER_2");
    expect(profile?.mollieSubscriptionId).toBe("sub_42");
    expect(profile?.mollieCustomerId).toBe("cus_1");
    expect(profile?.tierExpiresAt).toBeInstanceOf(Date);

    const payment = await prisma.payment.findUnique({
      where: { molliePaymentId: "tr_first" },
    });
    expect(payment?.status).toBe("PAID");
    expect(payment?.kind).toBe("SUBSCRIPTION_FIRST");

    // Une seule création de subscription.
    const subCalls = fetchMock.mock.calls.filter(
      ([, init]) => init?.method === "POST",
    );
    expect(subCalls).toHaveLength(1);
  });

  it("is idempotent — replaying the same paid webhook never re-credits", async () => {
    const { userId } = await createTestContext();
    routeMollie({
      payment: {
        id: "tr_idem",
        status: "paid",
        amount: { currency: "EUR", value: "3.00" },
        sequenceType: "first",
        customerId: "cus_2",
        paidAt: "2026-06-13T10:00:00Z",
        metadata: { userId, tier: "TIER_2" },
      },
      subscriptionId: "sub_idem",
    });

    await processMolliePayment(prisma, "tr_idem");
    await processMolliePayment(prisma, "tr_idem");

    // La subscription n'est créée qu'une fois malgré le double webhook.
    const subCalls = fetchMock.mock.calls.filter(
      ([, init]) => init?.method === "POST",
    );
    expect(subCalls).toHaveLength(1);

    const payments = await prisma.payment.findMany({ where: { userId } });
    expect(payments).toHaveLength(1);
  });

  it("recurring payment extends the tier without creating a new subscription", async () => {
    const { userId } = await createTestContext();
    // Profil déjà abonné (subscription existante).
    await prisma.profile.create({
      data: {
        userId,
        tier: "TIER_2",
        mollieCustomerId: "cus_3",
        mollieSubscriptionId: "sub_existing",
        tierExpiresAt: new Date("2026-06-20T00:00:00Z"),
      },
    });
    routeMollie({
      payment: {
        id: "tr_recur",
        status: "paid",
        amount: { currency: "EUR", value: "3.00" },
        sequenceType: "recurring",
        customerId: "cus_3",
        subscriptionId: "sub_existing",
        paidAt: "2026-07-13T10:00:00Z",
        metadata: { userId, tier: "TIER_2" },
      },
    });

    await processMolliePayment(prisma, "tr_recur");

    const profile = await prisma.profile.findUnique({ where: { userId } });
    expect(profile?.mollieSubscriptionId).toBe("sub_existing");
    // tierExpiresAt repoussé au-delà de l'ancienne échéance.
    expect(profile!.tierExpiresAt!.getTime()).toBeGreaterThan(
      new Date("2026-07-13T00:00:00Z").getTime(),
    );

    const payment = await prisma.payment.findUnique({
      where: { molliePaymentId: "tr_recur" },
    });
    expect(payment?.kind).toBe("SUBSCRIPTION_RECURRING");
    expect(payment?.status).toBe("PAID");

    // Aucune nouvelle subscription créée.
    const subCalls = fetchMock.mock.calls.filter(
      ([, init]) => init?.method === "POST",
    );
    expect(subCalls).toHaveLength(0);
  });

  it("non-paid payment (open) records the row but credits nothing", async () => {
    const { userId } = await createTestContext();
    routeMollie({
      payment: {
        id: "tr_open",
        status: "open",
        amount: { currency: "EUR", value: "3.00" },
        sequenceType: "first",
        customerId: "cus_4",
        metadata: { userId, tier: "TIER_2" },
      },
    });

    await processMolliePayment(prisma, "tr_open");

    const profile = await prisma.profile.findUnique({ where: { userId } });
    // Pas de profil crédité (ou profil sans tier payant).
    expect(profile?.tier ?? "FREE").toBe("FREE");
    const payment = await prisma.payment.findUnique({
      where: { molliePaymentId: "tr_open" },
    });
    expect(payment?.status).toBe("OPEN");
  });

  it("ignores payments without usable metadata", async () => {
    routeMollie({
      payment: {
        id: "tr_nometa",
        status: "paid",
        amount: { currency: "EUR", value: "3.00" },
        sequenceType: "first",
        metadata: null,
      },
    });

    await processMolliePayment(prisma, "tr_nometa");
    const payment = await prisma.payment.findUnique({
      where: { molliePaymentId: "tr_nometa" },
    });
    expect(payment).toBeNull();
  });
});
