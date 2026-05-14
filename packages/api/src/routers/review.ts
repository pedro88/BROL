/**
 * Review router — notes et commentaires entre utilisateurs.
 * @package @brol/api
 */

import { router, protectedProcedure, publicProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const reviewRouter = router({
  /**
   * Liste les reviews d'un utilisateur (pour son profil public).
   */
  list: publicProcedure
    .input(
      z.object({
        targetId: z.string(),
        limit: z.number().min(1).max(50).default(20),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const reviews = await ctx.prisma.review.findMany({
        where: { targetId: input.targetId },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
      });

      const hasMore = reviews.length > input.limit;
      const items = hasMore ? reviews.slice(0, -1) : reviews;
      const nextCursor = hasMore ? items[items.length - 1]?.id : null;

      return {
        items,
        nextCursor: nextCursor ?? undefined,
      };
    }),

  /**
   * Vérifie si l'utilisateur courant peut laisser une review
   * sur une cible (via un emprunt terminé entre eux).
   */
  canReview: protectedProcedure
    .input(z.object({ targetId: z.string() }))
    .query(async ({ ctx, input }) => {
      const authorId = ctx.session.user.id;

      // Ne peut pas se noter soi-même
      if (authorId === input.targetId) {
        return { canReview: false, reason: "cannot_review_self" };
      }

      // Vérifier qu'il existe un prêt terminé (RETURNED) entre les deux
      const loan = await ctx.prisma.loan.findFirst({
        where: {
          status: "RETURNED",
          OR: [
            { ownerId: authorId, borrowerId: input.targetId },
            { ownerId: input.targetId, borrowerId: authorId },
          ],
        },
        select: { id: true, objectId: true },
      });

      if (!loan) {
        return { canReview: false, reason: "no_exchange" };
      }

      // Vérifier qu'il n'y a pas déjà une review pour ce prêt par ce même auteur
      const existing = await ctx.prisma.review.findFirst({
        where: { authorId, loanId: loan.id },
      });

      if (existing) {
        return { canReview: false, reason: "already_reviewed" };
      }

      return { canReview: true, loanId: loan.id };
    }),

  /**
   * Crée une review (note + commentaire optionnel).
   */
  create: protectedProcedure
    .input(
      z.object({
        targetId: z.string(),
        rating: z.number().int().min(1).max(5),
        comment: z.string().max(1000).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.session.user.id;

      if (authorId === input.targetId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Vous ne pouvez pas vous noter vous-même.",
        });
      }

      // Même logique que canReview (double-check)
      const loan = await ctx.prisma.loan.findFirst({
        where: {
          status: "RETURNED",
          OR: [
            { ownerId: authorId, borrowerId: input.targetId },
            { ownerId: input.targetId, borrowerId: authorId },
          ],
        },
      });

      if (!loan) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Aucun échange trouvé avec cet utilisateur.",
        });
      }

      const existing = await ctx.prisma.review.findFirst({
        where: { authorId, loanId: loan.id },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Vous avez déjà laissé un avis pour cet échange.",
        });
      }

      const review = await ctx.prisma.review.create({
        data: {
          authorId,
          targetId: input.targetId,
          loanId: loan.id,
          rating: input.rating,
          comment: input.comment,
        },
        include: {
          author: {
            select: { id: true, name: true, image: true },
          },
        },
      });

      // Notification à la cible
      await ctx.prisma.notification.create({
        data: {
          userId: input.targetId,
          type: "REVIEW_RECEIVED",
          title: `Nouvel avis de ${review.author.name ?? "quelqu'un"}`,
          message: input.comment
            ? `"${input.comment.slice(0, 100)}${input.comment.length > 100 ? "..." : ""}"`
            : `${input.rating}/5 étoiles`,
          relatedId: review.id,
          relatedType: "review",
        },
      });

      return review;
    }),
});