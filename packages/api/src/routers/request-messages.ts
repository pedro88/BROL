/**
 * Request Messages router — thread in-app entre owner et requester
 * sur une CommunityRequest. Pas d'inbox globale en v1.
 *
 * @package @brol/api
 */

import { router, protectedProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { logger } from "../lib/logger";
import { getResendClient, getResendFromAddress } from "../lib/resend";
import { translate, type Locale } from "@brol/shared";

const log = logger.child("requestMessages.email");

/**
 * Notification email envoyée au receiver d'un message in-app.
 * Pas de contact direct entre les 2 inboxes : l'email contient juste
 * un aperçu + un lien deeplink vers /requests/[id] dans l'app.
 * Fire-and-forget : log + swallow toute erreur.
 */
async function sendRequestMessageEmail(params: {
  to: string;
  toName: string | null;
  fromName: string;
  requestTitle: string;
  preview: string;
  requestUrl: string;
  locale: Locale;
}) {
  const resend = getResendClient();
  if (!resend) return;

  const { locale } = params;
  const toName = params.toName ?? "voisin";

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">${translate(locale, "emails.requestMessageSubject")}</h2>
      <p>${translate(locale, "emails.requestMessageGreeting", { toName })}</p>
      <p>
        ${translate(locale, "emails.requestMessageIntro", {
          fromName: `<strong>${params.fromName}</strong>`,
          requestTitle: `<strong>"${params.requestTitle}"</strong>`,
        })}
      </p>
      <div style="background: #f9f9f9; padding: 16px; border-radius: 8px;">
        <p style="margin: 0; white-space: pre-wrap;">${params.preview}</p>
      </div>
      <p style="margin-top: 20px;">
        <a href="${params.requestUrl}" style="background: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
          ${translate(locale, "emails.requestMessageOpenConversationButton")}
        </a>
      </p>
      <p style="color: #666; font-size: 12px; margin-top: 20px;">
        ${translate(locale, "emails.requestMessageFooter")}
      </p>
    </div>
  `;

  const text = `
${translate(locale, "emails.requestMessageSubject")}

${translate(locale, "emails.requestMessageIntro", {
    fromName: params.fromName,
    requestTitle: params.requestTitle,
  })}

${params.preview}

${translate(locale, "emails.requestMessageOpenConversationButton")}: ${params.requestUrl}
  `;

  try {
    await resend.emails.send({
      from: getResendFromAddress(),
      to: params.to,
      subject: translate(locale, "emails.requestMessageEmailSubject", {
        fromName: params.fromName,
        requestTitle: params.requestTitle,
      }),
      html,
      text,
    });
    log.info("Request-message email sent", { to: params.to });
  } catch (error) {
    log.error("Failed to send request-message email", { err: error });
  }
}

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
          message: translate(ctx.locale, "errors.threadAccessDenied"),
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
            message: translate(ctx.locale, "errors.cannotInitiateMessage"),
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

      const preview = input.content.slice(0, 120) + (input.content.length > 120 ? "…" : "");

      // Le destinataire (in-app notif + email) reçoit les contenus dans SA langue.
      const recipient = await ctx.prisma.user.findUnique({
        where: { id: toUserId },
        select: { email: true, name: true, locale: true },
      });
      const recipientLocale = (recipient?.locale ?? "fr") as Locale;
      const senderName = sender?.name ?? "Un voisin";

      // Pas de Notification ici : les messages de thread alimentent le badge
      // Mail (cf. messages.unreadCount), pas la cloche transactionnelle. Le
      // destinataire est prévenu par l'unread RequestMessage + l'email.

      // Email out-of-band : fire-and-forget. On `await` quand même pour que
      // les tests puissent stub Resend, mais toute erreur est swallow dans
      // sendRequestMessageEmail.
      if (recipient?.email) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://brol.app";
        await sendRequestMessageEmail({
          to: recipient.email,
          toName: recipient.name,
          fromName: senderName,
          requestTitle: request.title,
          preview,
          requestUrl: `${appUrl}/requests/${input.requestId}`,
          locale: recipientLocale,
        });
      }

      return message;
    }),
});
