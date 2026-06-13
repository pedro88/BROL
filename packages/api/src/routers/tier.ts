/**
 * Tier router — gestion des plans et limites d'utilisation.
 * @package @brol/api
 */

import { router, protectedProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { resolveEffectiveTier } from "../lib/billing";

/** Limites par tier */
export const TIER_LIMITS = {
  FREE: { collections: 5, objects: 50, activeLoans: 10 },
  TIER_2: { collections: 10, objects: 500, activeLoans: 50 },
  TIER_3: { collections: null, objects: null, activeLoans: null }, // illimité
} as const;

type Tier = keyof typeof TIER_LIMITS;

export const tierRouter = router({
  /**
   * Récupère le tier et les stats d'usage de l'utilisateur.
   */
  getLimits: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const profile = await ctx.prisma.profile.findUnique({
      where: { userId },
    });

    const tier = resolveEffectiveTier(
      profile?.tier ?? "FREE",
      profile?.tierExpiresAt ?? null,
    );
    const limits = TIER_LIMITS[tier as Tier] ?? TIER_LIMITS.FREE;

    const [collectionCount, objectCount, activeLoanCount] = await Promise.all([
      ctx.prisma.collection.count({ where: { userId } }),
      ctx.prisma.object.count({ where: { collection: { userId } } }),
      ctx.prisma.loan.count({
        where: { ownerId: userId, status: { in: ["ACTIVE", "OVERDUE"] } },
      }),
    ]);

    return {
      tier,
      tierExpiresAt: profile?.tierExpiresAt ?? null,
      limits: {
        collections: { current: collectionCount, max: limits.collections },
        objects: { current: objectCount, max: limits.objects },
        activeLoans: { current: activeLoanCount, max: limits.activeLoans },
      },
    };
  }),

  /**
   * Vérifie si l'utilisateur peut créer une ressource d'un type donné.
   */
  checkLimit: protectedProcedure
    .input(z.object({ type: z.enum(["collection", "object", "activeLoan"]) }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const profile = await ctx.prisma.profile.findUnique({ where: { userId } });
      const tier = resolveEffectiveTier(
        profile?.tier ?? "FREE",
        profile?.tierExpiresAt ?? null,
      );
      const limits = TIER_LIMITS[tier as Tier] ?? TIER_LIMITS.FREE;

      const key = input.type === "collection" ? "collections"
        : input.type === "object" ? "objects"
        : "activeLoans";
      const max = limits[key as keyof typeof limits] as number | null;

      if (max === null) return { allowed: true, reason: "unlimited" };

      let current = 0;
      if (input.type === "collection") {
        current = await ctx.prisma.collection.count({ where: { userId } });
      } else if (input.type === "object") {
        current = await ctx.prisma.object.count({ where: { collection: { userId } } });
      } else {
        current = await ctx.prisma.loan.count({
          where: { ownerId: userId, status: { in: ["ACTIVE", "OVERDUE"] } },
        });
      }

      if (current >= max) {
        return {
          allowed: false,
          reason: "limit_reached",
          current,
          max,
          upgradeTo: tier === "FREE" ? "TIER_2" : null,
        };
      }

      return { allowed: true, reason: "ok", current, max };
    }),

  /**
   * Change le tier d'un utilisateur (sans intégration Stripe pour l'instant).
   */
  upgrade: protectedProcedure
    .input(z.object({ tier: z.enum(["TIER_2", "TIER_3"]) }))
    .mutation(async ({ ctx, input }) => {
      // Bascule de tier SANS paiement — réservée au dev/tests. En prod, le
      // seul chemin d'upgrade est `billing.createCheckout` (Mollie). Sinon
      // n'importe quel utilisateur connecté pourrait se hisser en TIER_3.
      if (process.env.NODE_ENV === "production") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Utilisez le paiement pour changer de plan.",
        });
      }

      const userId = ctx.session.user.id;

      await ctx.prisma.profile.upsert({
        where: { userId },
        update: { tier: input.tier },
        create: { userId, tier: input.tier },
      });

      return { success: true, tier: input.tier };
    }),
});
