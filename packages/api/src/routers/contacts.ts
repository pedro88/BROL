/**
 * Router Contacts - Gestion des contacts.
 * @package @brol/api
 */

import { z } from "zod";
import { router, dbProcedure } from "../trpc";
import {
  createContactSchema,
  updateContactSchema,
  paginationSchema,
} from "@brol/shared";

/**
 * Router pour les contacts.
 * Gère le CRUD des contacts et l'ajout depuis scan profil.
 */
export const contactsRouter = router({
  /**
   * Liste les contacts de l'utilisateur.
   */
  list: dbProcedure
    .input(paginationSchema.optional())
    .query(async ({ ctx, input }) => {
      // TODO: Filtrer par userId quand auth sera implémenté
      const contacts = await ctx.prisma.contact.findMany({
        orderBy: { name: "asc" },
        take: input?.limit ?? 50,
        cursor: input?.cursor ? { id: input.cursor } : undefined,
      });

      return {
        items: contacts,
        nextCursor: contacts.length === (input?.limit ?? 50)
          ? contacts[contacts.length - 1]?.id ?? null
          : null,
      };
    }),

  /**
   * Récupère un contact par son ID.
   */
  get: dbProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const contact = await ctx.prisma.contact.findFirst({
        where: {
          id: input.id,
        },
      });

      if (!contact) {
        throw new Error("Contact non trouvé");
      }

      return contact;
    }),

  /**
   * Crée un nouveau contact.
   */
  create: dbProcedure
    .input(createContactSchema)
    .mutation(async ({ ctx, input }) => {
      // TODO: Utiliser ctx.userId quand auth sera implémenté
      return ctx.prisma.contact.create({
        data: {
          ...input,
          userId: "demo-user", // Placeholder jusqu'à auth
        },
      });
    }),

  /**
   * Met à jour un contact existant.
   */
  update: dbProcedure
    .input(z.object({ id: z.string().cuid(), data: updateContactSchema }))
    .mutation(async ({ ctx, input }) => {
      const contact = await ctx.prisma.contact.findFirst({
        where: { id: input.id },
      });

      if (!contact) {
        throw new Error("Contact non trouvé");
      }

      return ctx.prisma.contact.update({
        where: { id: input.id },
        data: input.data,
      });
    }),

  /**
   * Supprime un contact.
   */
  delete: dbProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const contact = await ctx.prisma.contact.findFirst({
        where: { id: input.id },
      });

      if (!contact) {
        throw new Error("Contact non trouvé");
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
  addFromScan: dbProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Vérifier que l'utilisateur scanné existe
      const scannedUser = await ctx.prisma.user.findUnique({
        where: { id: input.userId },
      });

      if (!scannedUser) {
        throw new Error("Utilisateur non trouvé");
      }

      // TODO: Ne pas s'ajouter soi-même quand auth sera implémenté
      // if (scannedUser.id === ctx.userId) {
      //   throw new Error("Vous ne pouvez pas vous ajouter vous-même");
      // }

      // Vérifier si le contact existe déjà
      const existingContact = await ctx.prisma.contact.findFirst({
        where: {
          email: scannedUser.email,
        },
      });

      if (existingContact) {
        return existingContact;
      }

      // Créer le contact
      // TODO: Utiliser ctx.userId quand auth sera implémenté
      return ctx.prisma.contact.create({
        data: {
          userId: "demo-user",
          name: scannedUser.name || scannedUser.email,
          email: scannedUser.email,
        },
      });
    }),

  /**
   * Invite un contact par email (créé un contact + envoi d'invitation).
   */
  invite: dbProcedure
    .input(z.object({ email: z.string().email(), name: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      // Vérifier si l'email n'est pas déjà un utilisateur
      const existingUser = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      });

      if (existingUser) {
        throw new Error("Cet email est déjà utilisé par un compte Brol");
      }

      // Vérifier si le contact existe déjà
      const existingContact = await ctx.prisma.contact.findFirst({
        where: {
          email: input.email,
        },
      });

      if (existingContact) {
        // TODO: Ré-envoyer l'invitation
        return existingContact;
      }

      // Créer le contact
      // TODO: Utiliser ctx.userId quand auth sera implémenté
      const contact = await ctx.prisma.contact.create({
        data: {
          userId: "demo-user",
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
