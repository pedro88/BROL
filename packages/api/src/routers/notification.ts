/**
 * Notification router — système de notification.
 * @package @brol/api
 */

import { router, protectedProcedure, publicProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const notificationRouter = router({
  /**
   * Liste les notifications de l'utilisateur.
   */
  list: protectedProcedure
    .input(
      z.object({
        unreadOnly: z.boolean().optional(),
        limit: z.number().min(1).max(50).default(20),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const notifications = await ctx.prisma.notification.findMany({
        where: {
          userId,
          ...(input.unreadOnly ? { isRead: false } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
      });

      const hasMore = notifications.length > input.limit;
      const items = hasMore ? notifications.slice(0, -1) : notifications;
      const nextCursor = hasMore ? items[items.length - 1]?.id : null;

      return {
        items,
        nextCursor: nextCursor ?? undefined,
      };
    }),

  /**
   * Nombre de notifications non lues.
   */
  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    const count = await ctx.prisma.notification.count({
      where: { userId: ctx.session.user.id, isRead: false },
    });
    return { count };
  }),

  /**
   * Marque une notification comme lue.
   */
  markRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const notification = await ctx.prisma.notification.findUnique({
        where: { id: input.id },
      });

      if (!notification) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (notification.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return ctx.prisma.notification.update({
        where: { id: input.id },
        data: { isRead: true },
      });
    }),

  /**
   * Marque toutes les notifications comme lues.
   */
  markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.prisma.notification.updateMany({
      where: { userId: ctx.session.user.id, isRead: false },
      data: { isRead: true },
    });
    return { success: true };
  }),

  /**
   * Crée une notification (usage interne).
   */
  create: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        type: z.enum([
          "RETURN_REMINDER",
          "OVERDUE",
          "COMMUNITY_REQUEST",
          "REVIEW_RECEIVED",
          "REQUEST_FULFILLED",
        ]),
        title: z.string().min(1).max(200),
        message: z.string().max(500).optional(),
        relatedId: z.string().optional(),
        relatedType: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.notification.create({
        data: {
          userId: input.userId,
          type: input.type,
          title: input.title,
          message: input.message,
          relatedId: input.relatedId,
          relatedType: input.relatedType,
        },
      });
    }),
});
