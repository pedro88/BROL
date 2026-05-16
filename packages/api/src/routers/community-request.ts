/**
 * Community Request router — demandes à la communauté pour emprunter.
 * @package @brol/api
 */

import { router, protectedProcedure, publicProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const communityRequestRouter = router({
  /**
   * Crée une demande à la communauté.
   */
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(3).max(100),
        description: z.string().max(500).optional(),
        zone: z.string().max(100).optional(),
        expiresAt: z.string().datetime().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.session.user.id;

      const request = await ctx.prisma.communityRequest.create({
        data: {
          authorId,
          title: input.title,
          description: input.description,
          zone: input.zone,
          expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
        },
        include: {
          author: { select: { id: true, name: true, image: true } },
        },
      });

      return request;
    }),

  /**
   * Liste les demandes (filtres optionnels).
   */
  list: publicProcedure
    .input(
      z.object({
        status: z.enum(["OPEN", "FULFILLED", "CANCELLED", "EXPIRED"]).optional(),
        zone: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(50).default(20),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: {
        status?: "OPEN" | "FULFILLED" | "CANCELLED" | "EXPIRED";
        zone?: { contains: string; mode: "insensitive" };
        OR?: Array<{ title?: { contains: string; mode: "insensitive" }; description?: { contains: string; mode: "insensitive" } }>;
      } = {};

      if (input.status) {
        where.status = input.status;
      } else {
        where.status = "OPEN";
      }

      if (input.zone) {
        where.zone = { contains: input.zone, mode: "insensitive" };
      }

      if (input.search) {
        where.OR = [
          { title: { contains: input.search, mode: "insensitive" } },
          { description: { contains: input.search, mode: "insensitive" } },
        ];
      }

      const requests = await ctx.prisma.communityRequest.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
      });

      const hasMore = requests.length > input.limit;
      const items = hasMore ? requests.slice(0, -1) : requests;
      const nextCursor = hasMore ? items[items.length - 1]?.id : null;

      return {
        items,
        nextCursor: nextCursor ?? undefined,
      };
    }),

  /**
   * Récupère une demande par ID.
   */
  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const request = await ctx.prisma.communityRequest.findUnique({
        where: { id: input.id },
        include: {
          author: { select: { id: true, name: true, image: true } },
          fulfillBy: { select: { id: true, title: true } },
        },
      });

      if (!request) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Demande introuvable" });
      }

      return request;
    }),

  /**
   * Annule une demande (auteur uniquement).
   */
  cancel: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.session.user.id;

      const request = await ctx.prisma.communityRequest.findUnique({
        where: { id: input.id },
      });

      if (!request) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Demande introuvable" });
      }

      if (request.authorId !== authorId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Vous ne pouvez annuler que vos propres demandes.",
        });
      }

      if (request.status !== "OPEN") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Seules les demandes ouvertes peuvent être annulées.",
        });
      }

      const updated = await ctx.prisma.communityRequest.update({
        where: { id: input.id },
        data: { status: "CANCELLED" },
      });

      return updated;
    }),

  /**
   * Marque une demande comme fulfill (répondue par un owner).
   */
  fulfill: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        fulfillByRequestId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const request = await ctx.prisma.communityRequest.findUnique({
        where: { id: input.id },
      });

      if (!request) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Demande introuvable" });
      }

      if (request.status !== "OPEN") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Seules les demandes ouvertes peuvent être fulfill.",
        });
      }

      const updated = await ctx.prisma.communityRequest.update({
        where: { id: input.id },
        data: {
          status: "FULFILLED",
          fulfillByRequestId: input.fulfillByRequestId,
        },
      });

      // Notification à l'auteur de la demande
      if (request.authorId !== ctx.session.user.id) {
        await ctx.prisma.notification.create({
          data: {
            userId: request.authorId,
            type: "REQUEST_FULFILLED",
            title: "Votre demande a été traitée",
            message: `Quelqu'un a répondu à votre demande: "${request.title}"`,
            relatedId: request.id,
            relatedType: "request",
          },
        });
      }

      return updated;
    }),

  /**
   * Liste les demandes de l'utilisateur courant.
   */
  myRequests: protectedProcedure.query(async ({ ctx }) => {
    const authorId = ctx.session.user.id;

    const requests = await ctx.prisma.communityRequest.findMany({
      where: { authorId },
      orderBy: { createdAt: "desc" },
    });

    return requests;
  }),
});
