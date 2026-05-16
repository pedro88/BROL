/**
 * Badge router — badges utilisateurs et attribution automatique.
 * @package @brol/api
 */

import { router, protectedProcedure, publicProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

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
      const userId = input.userId;

      const [loanCount, objectCount, reviewCount, avgRating] = await Promise.all([
        ctx.prisma.loan.count({
          where: { OR: [{ ownerId: userId }, { borrowerId: userId }] },
        }),
        ctx.prisma.object.count({ where: { collection: { userId } } }),
        ctx.prisma.review.count({ where: { authorId: userId } }),
        ctx.prisma.review.aggregate({
          where: { targetId: userId },
          _avg: { rating: true },
        }),
      ]);

      const stats = {
        loanCount,
        objectCount,
        reviewCount,
        avgRating: avgRating._avg.rating ?? 0,
      };

      const definitions = await ctx.prisma.badgeDefinition.findMany();
      const awarded: string[] = [];

      for (const def of definitions) {
        const criteria = def.criteria as { type: string; threshold: number };
        let earned = false;

        switch (criteria.type) {
          case "loan_count":
            earned = stats.loanCount >= criteria.threshold;
            break;
          case "object_count":
            earned = stats.objectCount >= criteria.threshold;
            break;
          case "review_count":
            earned = stats.reviewCount >= criteria.threshold;
            break;
          case "avg_rating":
            earned = stats.avgRating >= criteria.threshold;
            break;
        }

        if (earned) {
          try {
            await ctx.prisma.userBadge.create({
              data: { userId, badgeId: def.id },
            });
            awarded.push(def.slug);
          } catch {
            // Déjà présent — ignore
          }
        }
      }

      return { stats, awarded };
    }),
});
