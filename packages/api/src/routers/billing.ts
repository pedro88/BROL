/**
 * Billing router — abonnements aux tiers payants via Mollie (web).
 *
 * Flux : `createCheckout` crée un 1er paiement Mollie et renvoie l'URL de
 * checkout ; le webhook (`server.ts` → `lib/billing.processMolliePayment`)
 * crédite le tier et établit la subscription. `status` reflète le tier
 * effectif (avec downgrade auto si `tierExpiresAt` dépassé), `cancelSubscription`
 * stoppe les prélèvements futurs.
 *
 * @package @brol/api
 */

import { router, protectedProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  isMollieConfigured,
  createCustomer,
  createFirstPayment,
  cancelSubscription,
} from "../lib/mollie";
import { TIER_PRICES, resolveEffectiveTier } from "../lib/billing";

export const billingRouter = router({
  /**
   * État de facturation de l'utilisateur courant. `tier` est l'effectif
   * (FREE si l'abonnement a expiré) ; `rawTier` est ce qui est stocké.
   */
  status: protectedProcedure.query(async ({ ctx }) => {
    const profile = await ctx.prisma.profile.findUnique({
      where: { userId: ctx.userId },
      select: { tier: true, tierExpiresAt: true, mollieSubscriptionId: true },
    });
    const rawTier = profile?.tier ?? "FREE";
    const tierExpiresAt = profile?.tierExpiresAt ?? null;
    return {
      configured: isMollieConfigured(),
      tier: resolveEffectiveTier(rawTier, tierExpiresAt),
      rawTier,
      tierExpiresAt,
      subscriptionActive: !!profile?.mollieSubscriptionId,
    };
  }),

  /**
   * Démarre un abonnement : crée (au besoin) le customer Mollie, lance un 1er
   * paiement `sequenceType: "first"` et renvoie l'URL de checkout. Le front
   * redirige l'utilisateur dessus.
   */
  createCheckout: protectedProcedure
    .input(z.object({ tier: z.enum(["TIER_2", "TIER_3"]) }))
    .mutation(async ({ ctx, input }) => {
      if (!isMollieConfigured()) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Le paiement n'est pas configuré sur ce serveur.",
        });
      }

      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.userId },
        select: { email: true, name: true },
      });
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Utilisateur introuvable." });
      }

      const profile = await ctx.prisma.profile.findUnique({
        where: { userId: ctx.userId },
        select: { mollieCustomerId: true },
      });

      // Customer Mollie : créé une fois, réutilisé ensuite.
      let customerId = profile?.mollieCustomerId ?? null;
      if (!customerId) {
        const customer = await createCustomer({
          name: user.name ?? user.email,
          email: user.email,
        });
        customerId = customer.id;
        await ctx.prisma.profile.upsert({
          where: { userId: ctx.userId },
          update: { mollieCustomerId: customerId },
          create: { userId: ctx.userId, mollieCustomerId: customerId },
        });
      }

      const payment = await createFirstPayment({
        customerId,
        amount: TIER_PRICES[input.tier],
        description: `Brol ${input.tier} — abonnement mensuel`,
        metadata: { userId: ctx.userId, tier: input.tier },
      });

      // Ligne d'audit OPEN — le webhook la passera à PAID (idempotence).
      await ctx.prisma.payment.create({
        data: {
          molliePaymentId: payment.id,
          userId: ctx.userId,
          kind: "SUBSCRIPTION_FIRST",
          status: "OPEN",
          tier: input.tier,
          amount: payment.amount.value,
          currency: payment.amount.currency,
        },
      });

      const checkoutUrl = payment._links?.checkout?.href;
      if (!checkoutUrl) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Mollie n'a pas renvoyé d'URL de paiement.",
        });
      }
      return { checkoutUrl };
    }),

  /**
   * Annule l'abonnement Mollie (stoppe les prélèvements). Le tier reste actif
   * jusqu'à `tierExpiresAt`, puis `resolveEffectiveTier` le repasse en FREE.
   */
  cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    const profile = await ctx.prisma.profile.findUnique({
      where: { userId: ctx.userId },
      select: { mollieCustomerId: true, mollieSubscriptionId: true },
    });
    if (!profile?.mollieCustomerId || !profile.mollieSubscriptionId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Aucun abonnement actif à annuler.",
      });
    }

    await cancelSubscription({
      customerId: profile.mollieCustomerId,
      subscriptionId: profile.mollieSubscriptionId,
    });

    await ctx.prisma.profile.update({
      where: { userId: ctx.userId },
      data: { mollieSubscriptionId: null },
    });

    return { success: true };
  }),
});
