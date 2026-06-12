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
      // Accept cuid OR handle (with optional "#" prefix)
      const raw = input.userId.trim();
      const handleCandidate = raw.replace(/^#/, "").toLowerCase();

      const user = await ctx.prisma.user.findFirst({
        where: { OR: [{ id: raw }, { handle: handleCandidate }] },
        select: {
          id: true,
          handle: true,
          name: true,
          email: true,
          image: true,
          createdAt: true,
          city: true,
          profile: {
            select: {
              bio: true,
              avatarUrl: true,
              birthYear: true,
              gender: true,
              phone: true,
              publicEmail: true,
              publicPhone: true,
              publicBirthYear: true,
              publicGender: true,
              publicCity: true,
            },
          },
        },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      // Caller — pour exposer les champs privés à soi-même.
      const callerId = ctx.session?.user?.id ?? null;
      const isSelf = callerId === user.id;

      const p = user.profile;
      const visibility = {
        publicEmail: p?.publicEmail ?? false,
        publicPhone: p?.publicPhone ?? false,
        publicBirthYear: p?.publicBirthYear ?? false,
        publicGender: p?.publicGender ?? false,
        publicCity: p?.publicCity ?? true,
      };

      // Calculer la note moyenne
      const reviews = await ctx.prisma.review.aggregate({
        where: { targetId: user.id },
        _avg: { rating: true },
        _count: { id: true },
      });

      // Récupérer les badges
      const badges = await ctx.prisma.userBadge.findMany({
        where: { userId: user.id },
        include: {
          badge: {
            select: {
              slug: true,
              name: true,
              description: true,
              icon: true,
              rarity: true,
              category: true,
              unlockHint: true,
              svgAsset: true,
            },
          },
        },
        orderBy: { awardedAt: "desc" },
      });

      return {
        id: user.id,
        handle: user.handle,
        name: user.name,
        // Champs sensibles : retournés uniquement si flag public OR self.
        email: isSelf || visibility.publicEmail ? user.email : null,
        phone: isSelf || visibility.publicPhone ? (p?.phone ?? null) : null,
        birthYear: isSelf || visibility.publicBirthYear ? (p?.birthYear ?? null) : null,
        gender: isSelf || visibility.publicGender ? (p?.gender ?? null) : null,
        city: isSelf || visibility.publicCity ? user.city : null,
        image: user.image,
        createdAt: user.createdAt,
        bio: p?.bio ?? null,
        avatarUrl: p?.avatarUrl ?? null,
        // Self récupère aussi ses flags de visibilité pour piloter le UI settings.
        visibility: isSelf ? visibility : null,
        averageRating: reviews._avg.rating ?? 0,
        reviewCount: reviews._count.id,
        badges: badges.map((ub) => ({
          slug: ub.badge.slug,
          name: ub.badge.name,
          description: ub.badge.description,
          icon: ub.badge.icon,
          rarity: ub.badge.rarity,
          category: ub.badge.category,
          unlockHint: ub.badge.unlockHint,
          svgAsset: ub.badge.svgAsset,
          awardedAt: ub.awardedAt,
        })),
      };
    }),

  /**
   * Met à jour le profil du current user.
   * Accepte les champs personnels (bio/avatar/birthYear/gender/phone) et
   * les toggles de visibilité publique.
   */
  update: protectedProcedure
    .input(
      z.object({
        bio: z.string().max(500).optional(),
        avatarUrl: z.string().url().optional(),
        birthYear: z
          .number()
          .int()
          .min(1900)
          .max(new Date().getFullYear())
          .nullable()
          .optional(),
        gender: z.string().trim().max(32).nullable().optional(),
        phone: z.string().trim().max(40).nullable().optional(),
        publicEmail: z.boolean().optional(),
        publicPhone: z.boolean().optional(),
        publicBirthYear: z.boolean().optional(),
        publicGender: z.boolean().optional(),
        publicCity: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const profile = await ctx.prisma.profile.upsert({
        where: { userId },
        update: input,
        create: {
          userId,
          ...input,
        },
      });

      return profile;
    }),
});