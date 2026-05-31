/**
 * Request Messages router — thread in-app entre owner et requester
 * sur une CommunityRequest. Pas d'inbox globale en v1.
 *
 * @package @brol/api
 */

import { router, protectedProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const requestMessagesRouter = router({
  /**
   * Liste les messages d'un thread. Accessible à l'auteur de la demande
   * ainsi qu'à tout user qui a déjà envoyé ou reçu un message dans le
   * thread. Marque automatiquement les messages reçus comme lus.
   */
  list: protectedProcedure
    .input(z.object({ requestId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const request = await ctx.prisma.communityRequest.findUnique({
        where: { id: input.requestId },
        select: { id: true, authorId: true },
      });
      if (!request) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Demande introuvable" });
      }

      const messages = await ctx.prisma.requestMessage.findMany({
        where: { requestId: input.requestId },
        orderBy: { createdAt: "asc" },
        include: {
          fromUser: { select: { id: true, name: true, handle: true, image: true } },
          toUser: { select: { id: true, name: true, handle: true, image: true } },
        },
      });

      const isAuthor = request.authorId === userId;
      const isParticipant = messages.some(
        (m) => m.fromUserId === userId || m.toUserId === userId,
      );
      if (!isAuthor && !isParticipant) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Vous n'avez pas accès à ce thread.",
        });
      }

      const visible = isAuthor
        ? messages
        : messages.filter((m) => m.fromUserId === userId || m.toUserId === userId);

      // Marque comme lus les messages reçus par le caller dans la fenêtre visible.
      const toMarkRead = visible
        .filter((m) => m.toUserId === userId && !m.isRead)
        .map((m) => m.id);
      if (toMarkRead.length > 0) {
        await ctx.prisma.requestMessage.updateMany({
          where: { id: { in: toMarkRead } },
          data: { isRead: true },
        });
      }

      return { messages: visible, isAuthor };
    }),

  /**
   * Envoie un message dans le thread d'une demande. Crée une Notification
   * de type COMMUNITY_REQUEST chez le destinataire.
   *
   * Règles de routage :
   *  - Si caller = author : message envoyé au dernier sender côté owner
   *    qui a écrit dans ce thread (sinon BAD_REQUEST — l'author ne peut
   *    pas amorcer le thread, il répond à un owner qui s'est manifesté).
   *  - Sinon : message envoyé à l'author. Sert d'amorçage côté owner.
   */
  send: protectedProcedure
    .input(
      z.object({
        requestId: z.string(),
        content: z.string().trim().min(1).max(500),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const request = await ctx.prisma.communityRequest.findUnique({
        where: { id: input.requestId },
        select: { id: true, authorId: true, title: true },
      });
      if (!request) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Demande introuvable" });
      }

      let toUserId: string;
      if (request.authorId === userId) {
        // Reply de l'author → dernier owner qui a écrit dans ce thread.
        const lastOwnerMessage = await ctx.prisma.requestMessage.findFirst({
          where: { requestId: input.requestId, fromUserId: { not: userId } },
          orderBy: { createdAt: "desc" },
          select: { fromUserId: true },
        });
        if (!lastOwnerMessage) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "Aucun voisin n'a encore proposé son aide — vous ne pouvez pas écrire en premier.",
          });
        }
        toUserId = lastOwnerMessage.fromUserId;
      } else {
        // Amorçage owner → author.
        toUserId = request.authorId;
      }

      const sender = await ctx.prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, handle: true },
      });

      const message = await ctx.prisma.requestMessage.create({
        data: {
          requestId: input.requestId,
          fromUserId: userId,
          toUserId,
          content: input.content,
        },
      });

      await ctx.prisma.notification.create({
        data: {
          userId: toUserId,
          type: "COMMUNITY_REQUEST",
          title: `Nouveau message pour "${request.title}"`,
          message: `${sender?.name ?? "Un voisin"} : ${input.content.slice(0, 120)}${input.content.length > 120 ? "…" : ""}`,
          relatedId: input.requestId,
          relatedType: "request",
        },
      });

      return message;
    }),
});
