/**
 * Logique métier des abonnements (tiers payants via Mollie).
 *
 * Sépare la « comptabilité tier » du transport HTTP : le router billing et le
 * webhook serveur appellent ces helpers, qui orchestrent Mollie + Prisma.
 *
 * @package @brol/api
 */

import type { PrismaClient } from "@brol/db";
import type { UserTier } from "@prisma/client";
import { logger } from "./logger";
import {
  getPayment,
  createSubscription,
  type MolliePayment,
} from "./mollie";

const log = logger.child("billing");

/** Tier payant → prix mensuel EUR (string Mollie). Source de vérité unique. */
export const TIER_PRICES: Record<"TIER_2" | "TIER_3", string> = {
  TIER_2: "3.00",
  TIER_3: "20.00",
};

/** Intervalle de prélèvement Mollie. */
export const SUBSCRIPTION_INTERVAL = "1 month";

/** Tiers payants vendables (FREE n'est pas achetable). */
export type PaidTier = keyof typeof TIER_PRICES;

/**
 * Tier réellement applicable maintenant. Un tier payant dont `tierExpiresAt`
 * est dépassé retombe en FREE — pas besoin de cron : chaque lecture de quota
 * recalcule l'effectif. Le webhook récurrent repousse `tierExpiresAt` tant que
 * l'abonnement est payé.
 */
export function resolveEffectiveTier(
  tier: UserTier,
  tierExpiresAt: Date | null,
  now: Date = new Date(),
): UserTier {
  if (tier === "FREE") return "FREE";
  if (tierExpiresAt && tierExpiresAt.getTime() < now.getTime()) return "FREE";
  return tier;
}

/**
 * Échéance d'un tier après un paiement réussi : 1 mois calendaire + 3 jours de
 * grâce (couvre un prélèvement Mollie légèrement en retard / une retry sans
 * downgrader l'utilisateur entre-temps).
 */
export function computeTierExpiry(paidAt: Date): Date {
  const d = new Date(paidAt.getTime());
  d.setMonth(d.getMonth() + 1);
  d.setDate(d.getDate() + 3);
  return d;
}

/** Mappe le statut Mollie vers notre enum PaymentStatus. */
function mapStatus(s: MolliePayment["status"]) {
  switch (s) {
    case "paid":
      return "PAID" as const;
    case "pending":
    case "authorized":
      return "PENDING" as const;
    case "canceled":
      return "CANCELED" as const;
    case "expired":
      return "EXPIRED" as const;
    case "failed":
      return "FAILED" as const;
    case "open":
    default:
      return "OPEN" as const;
  }
}

/**
 * Traite un paiement Mollie référencé par son id (appelé par le webhook).
 *
 * Idempotent : le crédit du tier n'est appliqué qu'à la *transition* vers PAID
 * (ligne Payment locale pas encore PAID), et la création de la subscription est
 * gardée par `profile.mollieSubscriptionId == null`. Les pings répétés de
 * Mollie ne re-créditent donc jamais.
 *
 * Gère deux cas :
 *  - `SUBSCRIPTION_FIRST` payé → crée la subscription Mollie + crédite le tier.
 *  - `SUBSCRIPTION_RECURRING` payé (déclenché par Mollie, pas de ligne locale
 *    préalable) → upsert la ligne + repousse `tierExpiresAt`.
 */
export async function processMolliePayment(
  prisma: PrismaClient,
  molliePaymentId: string,
): Promise<void> {
  const payment = await getPayment(molliePaymentId);

  const isRecurring =
    payment.sequenceType === "recurring" || !!payment.subscriptionId;
  const kind = isRecurring ? "SUBSCRIPTION_RECURRING" : "SUBSCRIPTION_FIRST";
  const status = mapStatus(payment.status);

  const userId = payment.metadata?.userId ?? null;
  const tier = (payment.metadata?.tier ?? null) as PaidTier | null;
  if (!userId || !tier || !(tier in TIER_PRICES)) {
    log.warn("Mollie payment without usable metadata — ignored", {
      molliePaymentId,
      userId,
      tier,
    });
    return;
  }

  const existing = await prisma.payment.findUnique({
    where: { molliePaymentId },
  });
  const alreadyCredited = existing?.status === "PAID";
  const paidAt = payment.paidAt ? new Date(payment.paidAt) : new Date();

  // Upsert de la ligne d'audit (création pour les paiements récurrents générés
  // par Mollie, qui n'ont pas de ligne préalable).
  await prisma.payment.upsert({
    where: { molliePaymentId },
    update: {
      status,
      paidAt: status === "PAID" ? paidAt : existing?.paidAt ?? null,
    },
    create: {
      molliePaymentId,
      userId,
      kind,
      status,
      tier,
      amount: payment.amount.value,
      currency: payment.amount.currency,
      paidAt: status === "PAID" ? paidAt : null,
    },
  });

  if (status !== "PAID" || alreadyCredited) {
    log.info("Mollie payment processed (no credit)", {
      molliePaymentId,
      status,
      alreadyCredited,
    });
    return;
  }

  const profile = await prisma.profile.findUnique({ where: { userId } });
  const expiry = computeTierExpiry(paidAt);

  // 1er paiement payé → établir l'abonnement récurrent (si pas déjà fait).
  if (kind === "SUBSCRIPTION_FIRST" && !profile?.mollieSubscriptionId) {
    const customerId = profile?.mollieCustomerId ?? payment.customerId ?? null;
    if (customerId) {
      try {
        const sub = await createSubscription({
          customerId,
          amount: TIER_PRICES[tier],
          interval: SUBSCRIPTION_INTERVAL,
          description: `Brol ${tier} — abonnement mensuel`,
          metadata: { userId, tier },
        });
        await prisma.profile.upsert({
          where: { userId },
          update: {
            tier,
            tierExpiresAt: expiry,
            mollieCustomerId: customerId,
            mollieSubscriptionId: sub.id,
          },
          create: {
            userId,
            tier,
            tierExpiresAt: expiry,
            mollieCustomerId: customerId,
            mollieSubscriptionId: sub.id,
          },
        });
        log.info("subscription established", {
          userId,
          tier,
          subscriptionId: sub.id,
        });
        return;
      } catch (err) {
        // L'abonnement n'a pas pu être créé, mais le 1er paiement est encaissé.
        // On crédite quand même le mois payé ; le user pourra relancer.
        log.error("createSubscription failed after first payment", {
          userId,
          error: String(err),
        });
      }
    }
  }

  // Crédit du tier (1er paiement sans subscription, ou prélèvement récurrent).
  await prisma.profile.upsert({
    where: { userId },
    update: { tier, tierExpiresAt: expiry },
    create: { userId, tier, tierExpiresAt: expiry },
  });
  log.info("tier credited", { userId, tier, kind, tierExpiresAt: expiry });
}
