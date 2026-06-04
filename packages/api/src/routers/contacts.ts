/**
 * Router Contacts - Gestion des contacts.
 * @package @brol/api
 */

import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import {
  createContactSchema,
  updateContactSchema,
  paginationSchema,
  translate,
} from "@brol/shared";
import { withComputedStatuses } from "../lib/loan-status";
import { cursorOf } from "../lib/pagination";

/**
 * Router pour les contacts.
 * Gère le CRUD des contacts et l'ajout depuis scan profil.
 */
export const contactsRouter = router({
  /**
   * Liste les contacts de l'utilisateur.
   */
  list: protectedProcedure
    .input(
      z.object({
        ...paginationSchema.shape,
        search: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const search = input?.search?.trim();
      const contacts = await ctx.prisma.contact.findMany({
        where: {
          userId: ctx.userId,
          ...(search
            ? {
                OR: [
                  { name: { contains: search, mode: "insensitive" } },
                  { email: { contains: search, mode: "insensitive" } },
                ],
              }
            : {}),
        },
        orderBy: { name: "asc" },
        take: input?.limit ?? 50,
        cursor: input?.cursor ? { id: input.cursor } : undefined,
      });

      return {
        items: contacts,
        nextCursor: cursorOf(contacts, input?.limit ?? 50).nextCursor,
      };
    }),

  /**
   * Récupère un contact par son ID.
   */
  get: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const contact = await ctx.prisma.contact.findFirst({
        where: {
          id: input.id,
          userId: ctx.userId,
        },
      });

      if (!contact) {
        throw new TRPCError({ code: "NOT_FOUND", message: translate(ctx.locale, "errors.contactNotFound") });
      }

      // Récupérer l'historique des prêts pour ce contact (via borrowerContactId, borrowerId ou email)
      const loans = await ctx.prisma.loan.findMany({
        where: {
          OR: [
            { borrowerContactId: contact.id },
            { borrowerId: contact.borrowerId ?? "__none__" },
            contact.email
              ? { borrower: { email: contact.email } }
              : {},
          ],
        },
        include: {
          object: {
            select: {
              id: true,
              name: true,
              coverImage: true,
            },
          },
          owner: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      // Calculer le statut OVERDUE à la volée
      const loansWithComputedStatus = withComputedStatuses(loans);

      return {
        ...contact,
        loans: loansWithComputedStatus,
      };
    }),

  /**
   * Récupère l'historique des prêts pour un contact.
   */
  loansForContact: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const contact = await ctx.prisma.contact.findFirst({
        where: {
          id: input.id,
          userId: ctx.userId,
        },
      });

      if (!contact) {
        throw new TRPCError({ code: "NOT_FOUND", message: translate(ctx.locale, "errors.contactNotFound") });
      }

      const loans = await ctx.prisma.loan.findMany({
        where: {
          OR: [
            { borrowerContactId: contact.id },
            { borrowerId: contact.borrowerId ?? "__none__" },
            contact.email
              ? { borrower: { email: contact.email } }
              : {},
          ],
        },
        include: {
          object: {
            select: {
              id: true,
              name: true,
              coverImage: true,
              collection: {
                select: { name: true },
              },
            },
          },
          owner: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return {
        contact,
        loans: withComputedStatuses(loans),
      };
    }),

  /**
   * Crée un nouveau contact.
   */
  create: protectedProcedure
    .input(createContactSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.contact.create({
        data: {
          ...input,
          userId: ctx.userId,
        },
      });
    }),

  /**
   * Met à jour un contact existant.
   */
  update: protectedProcedure
    .input(z.object({ id: z.string().cuid(), data: updateContactSchema }))
    .mutation(async ({ ctx, input }) => {
      const contact = await ctx.prisma.contact.findFirst({
        where: { id: input.id, userId: ctx.userId },
      });

      if (!contact) {
        throw new TRPCError({ code: "NOT_FOUND", message: translate(ctx.locale, "errors.contactNotFound") });
      }

      return ctx.prisma.contact.update({
        where: { id: input.id },
        data: input.data,
      });
    }),

  /**
   * Supprime un contact.
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const contact = await ctx.prisma.contact.findFirst({
        where: { id: input.id, userId: ctx.userId },
      });

      if (!contact) {
        throw new TRPCError({ code: "NOT_FOUND", message: translate(ctx.locale, "errors.contactNotFound") });
      }

      await ctx.prisma.contact.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /**
   * Ajoute un contact depuis un scan de profil.
   * Le code peut être un userId direct ou un code de scan.
   */
  addFromScan: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Vérifier que l'utilisateur scanné existe
      const scannedUser = await ctx.prisma.user.findUnique({
        where: { id: input.userId },
      });

      if (!scannedUser) {
        throw new TRPCError({ code: "NOT_FOUND", message: translate(ctx.locale, "errors.userNotFound") });
      }

      // Ne pas s'ajouter soi-même
      if (scannedUser.id === ctx.userId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: translate(ctx.locale, "errors.cannotAddYourself") });
      }

      // Vérifier si le contact existe déjà
      const existingContact = await ctx.prisma.contact.findFirst({
        where: {
          userId: ctx.userId,
          email: scannedUser.email,
        },
      });

      if (existingContact) {
        return existingContact;
      }

      // Créer le contact
      return ctx.prisma.contact.create({
        data: {
          userId: ctx.userId,
          name: scannedUser.name || scannedUser.email,
          email: scannedUser.email,
        },
      });
    }),

  /**
   * Invite un contact par email (créé un contact + envoi d'invitation).
   */
  invite: protectedProcedure
    .input(z.object({ email: z.string().email(), name: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      // Vérifier si l'email n'est pas déjà un utilisateur
      const existingUser = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      });

      if (existingUser) {
        throw new TRPCError({ code: "CONFLICT", message: translate(ctx.locale, "errors.emailAlreadyInUse") });
      }

      // Vérifier si le contact existe déjà
      const existingContact = await ctx.prisma.contact.findFirst({
        where: {
          userId: ctx.userId,
          email: input.email,
        },
      });

      if (existingContact) {
        // TODO: Ré-envoyer l'invitation
        return existingContact;
      }

      // Créer le contact
      const contact = await ctx.prisma.contact.create({
        data: {
          userId: ctx.userId,
          name: input.name || input.email,
          email: input.email,
          note: "Invitation en attente",
        },
      });

      // TODO: Envoyer l'email d'invitation
      // await sendInviteEmail(input.email, ctx.userId);

      return contact;
    }),
});

export type ContactsRouter = typeof contactsRouter;
