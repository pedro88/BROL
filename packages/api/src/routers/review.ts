/**
 * Review router — notes et commentaires entre utilisateurs.
 * @package @brol/api
 */

import { router, protectedProcedure, publicProcedure } from "../trpc";
import { syncUserBadges } from "../lib/badge-service";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { pageOf } from "../lib/pagination";
import { translate } from "@brol/shared";

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

      return pageOf(reviews, input.limit);
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
          message: translate(ctx.locale, "errors.cannotReviewYourself"),
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
          message: translate(ctx.locale, "errors.noExchangeFound"),
        });
      }

      const existing = await ctx.prisma.review.findFirst({
        where: { authorId, loanId: loan.id },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: translate(ctx.locale, "errors.reviewAlreadyExists"),
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
          title: translate(ctx.locale, "notifications.reviewReceivedTitle", {
            reviewerName: review.author.name ?? "quelqu'un",
          }),
          message: input.comment
            ? translate(
                ctx.locale,
                "notifications.reviewReceivedMessageWithComment",
                {
                  comment: `${input.comment.slice(0, 100)}${input.comment.length > 100 ? "..." : ""}`,
                }
              )
            : translate(
                ctx.locale,
                "notifications.reviewReceivedMessageWithoutComment",
                { rating: input.rating }
              ),
          relatedId: review.id,
          relatedType: "review",
        },
      });

      // Sync badges pour l'auteur et la cible
      syncUserBadges(ctx.prisma, authorId).catch(() => {});
      syncUserBadges(ctx.prisma, input.targetId).catch(() => {});

      return review;
    }),
});