/**
 * Badge router — badges utilisateurs et attribution automatique.
 * @package @brol/api
 */

import { router, protectedProcedure, publicProcedure } from "../trpc";
import { z } from "zod";
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
   * Calcule et met à jour les badges d'un utilisateur.
   * Appelé après chaque prêt, ajout d'objet ou review.
   */
  syncUser: protectedProcedure.mutation(async ({ ctx }) => {
    const awarded = await syncUserBadges(ctx.prisma, ctx.userId);
    return { awarded };
  }),
});

export type BadgeRouter = typeof badgeRouter;
