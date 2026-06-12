/**
 * Router Messages - Envoi de messages aux propriétaires depuis scan QR public.
 * @package @brol/api
 */

import { z } from "zod";
import { translate, type Locale } from "@brol/shared";
import { router, publicProcedure, protectedProcedure, TRPCError } from "../trpc";
import { logger } from "../lib/logger";
import { getResendClient, getResendFromAddress } from "../lib/resend";
import { syncUserBadges } from "../lib/badge-service";

const log = logger.child("messages.sendOwnerContactEmail");

/**
 * Schema for sending a message to an object owner.
 */
export const sendMessageSchema = z.object({
  objectId: z.string(),
  ownerId: z.string(),
  fromName: z.string().min(1).max(255),
  fromEmail: z.string().email(),
  content: z.string().min(1).max(500),
});

export const messagesRouter = router({
  /**
   * Envoie un message au propriétaire d'un objet (depuis scan QR public).
   * - Sauvegarde le message en base
   * - Envoie un email au propriétaire
   */
  create: publicProcedure
    .input(sendMessageSchema)
    .mutation(async ({ ctx, input }) => {
      const { objectId, ownerId, fromName, fromEmail, content } = input;

      // Vérifier que l'objet existe et appartient bien à ownerId
      const object = await ctx.prisma.object.findFirst({
        where: { id: objectId },
        include: { collection: { select: { name: true } } },
      });

      if (!object) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: translate(ctx.locale, "errors.objectNotFound"),
        });
      }

      // Vérifier que l'owner existe et a un email
      const owner = await ctx.prisma.user.findUnique({
        where: { id: ownerId },
        select: { name: true, email: true, locale: true },
      });

      if (!owner || !owner.email) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: translate(ctx.locale, "errors.ownerNotFound"),
        });
      }

      // Sauvegarder le message
      const message = await ctx.prisma.message.create({
        data: {
          objectId,
          ownerId,
          fromName,
          fromEmail,
          content,
        },
      });

      await syncUserBadges(ctx.prisma, ownerId);

      // Envoyer l'email au propriétaire (dans SA locale, pas celle du visiteur)
      const locale = (owner.locale ?? "fr") as Locale;
      await sendOwnerContactEmail({
        to: owner.email,
        ownerName: owner.name ?? "Propriétaire",
        fromName,
        fromEmail,
        objectName: object.name,
        collectionName: object.collection.name,
        content,
        objectUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://brol.app"}/qr/${object.id}`,
        locale,
      });

      return { success: true, messageId: message.id };
    }),

  /**
   * Inbox unifiée du caller : conversations de demandes (`RequestMessage`)
   * + messages de contact QR anonymes (`Message`, lecture seule).
   */
  inbox: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.userId;

    // Tous les messages de thread où le caller participe, du + récent au + ancien.
    const myMessages = await ctx.prisma.requestMessage.findMany({
      where: { OR: [{ fromUserId: userId }, { toUserId: userId }] },
      orderBy: { createdAt: "desc" },
      include: {
        fromUser: { select: { id: true, name: true, handle: true, image: true } },
        toUser: { select: { id: true, name: true, handle: true, image: true } },
        request: { select: { id: true, title: true } },
      },
    });

    // Agrège par demande. Comme `myMessages` est trié desc, le premier message
    // rencontré pour une demande est le plus récent → pilote l'aperçu et l'autre
    // partie de la conversation.
    const threadMap = new Map<
      string,
      {
        requestId: string;
        requestTitle: string;
        otherParty: { id: string; name: string | null; handle: string | null; image: string | null };
        lastMessage: { content: string; createdAt: Date };
        unreadCount: number;
      }
    >();
    for (const m of myMessages) {
      const existing = threadMap.get(m.requestId);
      const isUnreadForMe = m.toUserId === userId && !m.isRead;
      if (existing) {
        if (isUnreadForMe) existing.unreadCount += 1;
        continue;
      }
      threadMap.set(m.requestId, {
        requestId: m.requestId,
        requestTitle: m.request.title,
        otherParty: m.fromUserId === userId ? m.toUser : m.fromUser,
        lastMessage: { content: m.content, createdAt: m.createdAt },
        unreadCount: isUnreadForMe ? 1 : 0,
      });
    }
    const threads = Array.from(threadMap.values());

    // Messages de contact QR reçus par le caller (expéditeur anonyme, sans compte).
    const qr = await ctx.prisma.message.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "desc" },
      include: { object: { select: { id: true, name: true } } },
    });
    const qrMessages = qr.map((m) => ({
      id: m.id,
      objectId: m.objectId,
      objectName: m.object.name,
      fromName: m.fromName,
      fromEmail: m.fromEmail,
      content: m.content,
      createdAt: m.createdAt,
      read: m.read,
    }));

    return { threads, qrMessages };
  }),

  /**
   * Compteur global non-lus pour le badge Mail (séparé du badge cloche).
   * = messages de thread non lus reçus + messages QR non lus.
   */
  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.userId;
    const [reqUnread, qrUnread] = await Promise.all([
      ctx.prisma.requestMessage.count({ where: { toUserId: userId, isRead: false } }),
      ctx.prisma.message.count({ where: { ownerId: userId, read: false } }),
    ]);
    return { count: reqUnread + qrUnread };
  }),

  /**
   * Marque un message de contact QR comme lu (scopé au propriétaire).
   * Les threads sont déjà marqués lus à l'ouverture par `requestMessages.list`.
   */
  markQrRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.message.updateMany({
        where: { id: input.id, ownerId: ctx.userId },
        data: { read: true },
      });
      return { success: true };
    }),
});

async function sendOwnerContactEmail(params: {
  to: string;
  ownerName: string;
  fromName: string;
  fromEmail: string;
  objectName: string;
  collectionName: string;
  content: string;
  objectUrl: string;
  locale: Locale;
}) {
  const resend = getResendClient();
  if (!resend) return;

  const { locale } = params;

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">${translate(locale, "emails.ownerContactSubject", { objectName: params.objectName })}</h2>
      <p><strong>${translate(locale, "emails.ownerContactFromLabel")}</strong> ${params.fromName} (${params.fromEmail})</p>
      <p><strong>${translate(locale, "emails.ownerContactCollectionLabel")}</strong> ${params.collectionName}</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <div style="background: #f9f9f9; padding: 16px; border-radius: 8px;">
        <p style="margin: 0; white-space: pre-wrap;">${params.content}</p>
      </div>
      <p style="margin-top: 20px;">
        <a href="${params.objectUrl}" style="background: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
          ${translate(locale, "emails.ownerContactViewObjectButton")}
        </a>
      </p>
      <p style="color: #666; font-size: 12px; margin-top: 20px;">
        ${translate(locale, "emails.ownerContactFooter", { fromEmail: params.fromEmail })}
      </p>
    </div>
  `;

  const text = `
${translate(locale, "emails.ownerContactSubject", { objectName: params.objectName })}

${translate(locale, "emails.ownerContactFromLabel")} ${params.fromName} (${params.fromEmail})
${translate(locale, "emails.ownerContactCollectionLabel")} ${params.collectionName}

Message:
${params.content}

---
Voir l'objet: ${params.objectUrl}
  `;

  try {
    await resend.emails.send({
      from: getResendFromAddress(),
      to: params.to,
      subject: translate(locale, "emails.ownerContactEmailSubject", { objectName: params.objectName }),
      html,
      text,
    });
    log.info("Email sent", { to: params.to, objectName: params.objectName });
  } catch (error) {
    log.error("Failed to send email", { err: error });
  }
}

export type MessagesRouter = typeof messagesRouter;