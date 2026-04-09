/**
 * Router Loans - Gestion des prêts.
 * @package @brol/api
 */

import { z } from "zod";
import { router, dbProcedure } from "../trpc";
import {
  createLoanSchema,
  returnLoanSchema,
  paginationSchema,
} from "@brol/shared";

/**
 * Router pour les prêts.
 * Gère la création, le suivi et le retour des prêts.
 */
export const loansRouter = router({
  /**
   * Liste les objets prêtés par l'utilisateur (pool "objets sortis").
   */
  lentOut: dbProcedure
    .input(paginationSchema.optional())
    .query(async ({ ctx, input }) => {
      // TODO: Filtrer par ownerId quand auth sera implémenté
      const loans = await ctx.prisma.loan.findMany({
        where: {
          status: { in: ["ACTIVE", "OVERDUE"] },
        },
        include: {
          object: {
            select: {
              id: true,
              name: true,
              coverImage: true,
            },
          },
          borrower: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: [
          { status: "asc" }, // OVERDUE d'abord
          { returnDueDate: "asc" }, // Plus urgent d'abord
        ],
        take: input?.limit ?? 20,
        cursor: input?.cursor ? { id: input.cursor } : undefined,
      });

      return {
        items: loans,
        nextCursor: loans.length === (input?.limit ?? 20)
          ? loans[loans.length - 1]?.id ?? null
          : null,
      };
    }),

  /**
   * Liste les objets empruntés par l'utilisateur.
   */
  borrowed: dbProcedure
    .input(paginationSchema.optional())
    .query(async ({ ctx, input }) => {
      // TODO: Filtrer par borrowerId quand auth sera implémenté
      const loans = await ctx.prisma.loan.findMany({
        where: {
          status: { in: ["ACTIVE", "OVERDUE"] },
        },
        include: {
          object: {
            select: {
              id: true,
              name: true,
              coverImage: true,
              collection: {
                select: {
                  name: true,
                },
              },
            },
          },
          owner: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { returnDueDate: "asc" },
        take: input?.limit ?? 20,
        cursor: input?.cursor ? { id: input.cursor } : undefined,
      });

      return {
        items: loans,
        nextCursor: loans.length === (input?.limit ?? 20)
          ? loans[loans.length - 1]?.id ?? null
          : null,
      };
    }),

  /**
   * Historique complet des prêts (tous statuts).
   */
  history: dbProcedure
    .input(paginationSchema.optional())
    .query(async ({ ctx, input }) => {
      // TODO: Filtrer par userId quand auth sera implémenté
      const loans = await ctx.prisma.loan.findMany({
        include: {
          object: {
            select: {
              id: true,
              name: true,
              coverImage: true,
            },
          },
          borrower: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
          owner: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: input?.limit ?? 20,
        cursor: input?.cursor ? { id: input.cursor } : undefined,
      });

      return {
        items: loans,
        nextCursor: loans.length === (input?.limit ?? 20)
          ? loans[loans.length - 1]?.id ?? null
          : null,
      };
    }),

  /**
   * Crée un nouveau prêt.
   */
  create: dbProcedure
    .input(createLoanSchema)
    .mutation(async ({ ctx, input }) => {
      // TODO: Vérifier que l'objet appartient à l'utilisateur quand auth sera implémenté

      // Vérifier que l'objet existe
      const object = await ctx.prisma.object.findFirst({
        where: {
          id: input.objectId,
        },
      });

      if (!object) {
        throw new Error("Objet non trouvé");
      }

      // Vérifier qu'il n'y a pas déjà un prêt actif
      const existingLoan = await ctx.prisma.loan.findFirst({
        where: {
          objectId: input.objectId,
          status: { in: ["ACTIVE", "OVERDUE"] },
        },
      });

      if (existingLoan) {
        throw new Error("Cet objet est déjà prêté");
      }

      // Vérifier que l'emprunteur existe
      const borrower = await ctx.prisma.user.findUnique({
        where: { id: input.borrowerId },
      });

      if (!borrower) {
        throw new Error("Emprunteur non trouvé");
      }

      // TODO: Utiliser le vrai ownerId quand auth sera implémenté
      return ctx.prisma.loan.create({
        data: {
          objectId: input.objectId,
          ownerId: "demo-owner", // Placeholder
          borrowerId: input.borrowerId,
          returnDueDate: input.returnDueDate,
          notes: input.notes,
          status: "ACTIVE",
        },
        include: {
          object: true,
          borrower: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
      });
    }),

  /**
   * Marque un prêt comme retourné.
   */
  return: dbProcedure
    .input(returnLoanSchema)
    .mutation(async ({ ctx, input }) => {
      // TODO: Vérifier que l'utilisateur est le owner quand auth sera implémenté
      const loan = await ctx.prisma.loan.findFirst({
        where: {
          id: input.loanId,
          status: { in: ["ACTIVE", "OVERDUE"] },
        },
      });

      if (!loan) {
        throw new Error("Prêt non trouvé ou déjà retourné");
      }

      return ctx.prisma.loan.update({
        where: { id: input.loanId },
        data: {
          status: "RETURNED",
          returnedAt: new Date(),
        },
      });
    }),

  /**
   * Envoie un rappel pour un prêt.
   * @note Pour l'instant, génère juste un log. Intégrer emailing plus tard.
   */
  remind: dbProcedure
    .input(z.object({ loanId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      // TODO: Vérifier que l'utilisateur est le owner quand auth sera implémenté
      const loan = await ctx.prisma.loan.findFirst({
        where: {
          id: input.loanId,
          status: "ACTIVE",
        },
        include: {
          borrower: {
            select: { email: true, name: true },
          },
          object: {
            select: { name: true },
          },
        },
      });

      if (!loan) {
        throw new Error("Prêt non trouvé");
      }

      // TODO: Envoyer un email de rappel
      // await sendReminderEmail(loan.borrower.email, loan);

      // Marquer le rappel comme envoyé
      await ctx.prisma.loan.update({
        where: { id: input.loanId },
        data: { reminderSentAt: new Date() },
      });

      return {
        success: true,
        message: `Rappel envoyé à ${loan.borrower.name || loan.borrower.email}`,
      };
    }),

  /**
   * Annule un prêt.
   */
  cancel: dbProcedure
    .input(z.object({ loanId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      // TODO: Vérifier que l'utilisateur est le owner quand auth sera implémenté
      const loan = await ctx.prisma.loan.findFirst({
        where: {
          id: input.loanId,
          status: "ACTIVE",
        },
      });

      if (!loan) {
        throw new Error("Prêt non trouvé");
      }

      return ctx.prisma.loan.update({
        where: { id: input.loanId },
        data: { status: "CANCELLED" },
      });
    }),
});

export type LoansRouter = typeof loansRouter;
