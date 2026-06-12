/**
 * Badge router — badges utilisateurs et attribution automatique.
 * @package @brol/api
 */

import { router, protectedProcedure, publicProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { syncUserBadges } from "../lib/badge-service";

export const badgeRouter = router({
  /**
   * Récupère les définitions de tous les badges disponibles.
   */
  definitions: publicProcedure.query(async ({ ctx }) => {
    const badges = await ctx.prisma.badgeDefinition.findMany({
      orderBy: { name: "asc" },
    });
    return badges;
  }),

  /**
   * Liste les badges d'un utilisateur.
   */
  list: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userBadges = await ctx.prisma.userBadge.findMany({
        where: { userId: input.userId },
        include: { badge: true },
        orderBy: { awardedAt: "desc" },
      });

      return userBadges.map((ub) => ({
        slug: ub.badge.slug,
        name: ub.badge.name,
        description: ub.badge.description,
        icon: ub.badge.icon,
        rarity: ub.badge.rarity,
        category: ub.badge.category,
        awardedAt: ub.awardedAt,
      }));
    }),

  /**
   * Award un badge à un utilisateur.
   */
  award: protectedProcedure
    .input(z.object({ userId: z.string(), badgeSlug: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const badge = await ctx.prisma.badgeDefinition.findUnique({
        where: { slug: input.badgeSlug },
      });

      if (!badge) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Badge not found" });
      }

      const existing = await ctx.prisma.userBadge.findUnique({
        where: { userId_badgeId: { userId: input.userId, badgeId: badge.id } },
      });

      if (existing) {
        return { awarded: false, alreadyHas: true };
      }

      const userBadge = await ctx.prisma.userBadge.create({
        data: { userId: input.userId, badgeId: badge.id },
        include: { badge: true },
      });

      return { awarded: true, badge: userBadge.badge };
    }),

  /**
   * Calcule et met à jour les badges d'un utilisateur.
   * Appelé après chaque prêt, ajout d'objet ou review.
   */
  syncUser: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const awarded = await syncUserBadges(ctx.prisma, input.userId);
      return { awarded };
    }),
});