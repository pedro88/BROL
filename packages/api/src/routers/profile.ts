/**
 * Profile router — gestion du profil utilisateur.
 * @package @brol/api
 */

import { router, protectedProcedure, publicProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const profileRouter = router({
  /**
   * Récupère le profil public d'un utilisateur.
   * Inclut les infos de base, bio, badges, note moyenne, nb commentaires.
   */
  get: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.userId },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          createdAt: true,
          profile: {
            select: {
              bio: true,
              avatarUrl: true,
            },
          },
        },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      // Calculer la note moyenne
      const reviews = await ctx.prisma.review.aggregate({
        where: { targetId: input.userId },
        _avg: { rating: true },
        _count: { id: true },
      });

      // Récupérer les badges
      const badges = await ctx.prisma.userBadge.findMany({
        where: { userId: input.userId },
        include: {
          badge: {
            select: {
              slug: true,
              name: true,
              description: true,
              icon: true,
            },
          },
        },
        orderBy: { awardedAt: "desc" },
      });

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        createdAt: user.createdAt,
        bio: user.profile?.bio ?? null,
        avatarUrl: user.profile?.avatarUrl ?? null,
        averageRating: reviews._avg.rating ?? 0,
        reviewCount: reviews._count.id,
        badges: badges.map((ub) => ({
          slug: ub.badge.slug,
          name: ub.badge.name,
          description: ub.badge.description,
          icon: ub.badge.icon,
          awardedAt: ub.awardedAt,
        })),
      };
    }),

  /**
   * Met à jour le profil du current user.
   */
  update: protectedProcedure
    .input(
      z.object({
        bio: z.string().max(500).optional(),
        avatarUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const profile = await ctx.prisma.profile.upsert({
        where: { userId },
        update: {
          bio: input.bio,
          avatarUrl: input.avatarUrl,
        },
        create: {
          userId,
          bio: input.bio,
          avatarUrl: input.avatarUrl,
        },
      });

      return profile;
    }),
});