/**
 * Router Loans - Gestion des prêts.
 * @package @brol/api
 */

import { z } from "zod";
import {
  router,
  publicProcedure,
  protectedProcedure,
  TRPCError,
} from "../trpc";
import {
  createLoanSchema,
  returnLoanSchema,
  paginationSchema,
} from "@brol/shared";
import { sendReminderEmail } from "../emails";
import { syncUserBadges } from "../lib/badge-service";
import { logger } from "../lib/logger";

const log = logger.child("loans.remind");

/**
 * Router pour les prêts.
 * Gère la création, le suivi et le retour des prêts.
 *
 * borrowerId / borrowerContactId:
 * - Si le contact a un compte Brol (contact.borrowerId) → borrowerId = contact.borrowerId
 * - Sinon → borrowerId = null, borrowerContactId = contact.id
 */
export const loansRouter = router({
  /**
   * Liste les objets prêtés par l'utilisateur (pool "objets sortis").
   */
  lentOut: protectedProcedure
    .input(paginationSchema.optional())
    .query(async ({ ctx, input }) => {
      const now = new Date();
      const loans = await ctx.prisma.loan.findMany({
        where: {
          ownerId: ctx.userId,
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
              image: true,
            },
          },
          borrowerContact: {
            select: {
              id: true,
              name: true,
              email: true,
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

      // Calculer le statut OVERDUE à la volée et dériver le nom de l'emprunteur
      const loansWithComputedStatus = loans.map((loan) => ({
        ...loan,
        computedStatus:
          loan.status === "ACTIVE" &&
          loan.returnDueDate &&
          loan.returnDueDate < now
            ? "OVERDUE"
            : loan.status,
        // borrowerName: priorise User > Contact (si contact a un compte)
        borrowerName:
          loan.borrower?.name ?? loan.borrowerContact?.name ?? "Inconnu",
      }));

      return {
        items: loansWithComputedStatus,
        nextCursor:
          loans.length === (input?.limit ?? 20)
            ? (loans[loans.length - 1]?.id ?? null)
            : null,
      };
    }),

  /**
   * Liste les objets empruntés par l'utilisateur.
   * Ne concerne que les prêts où le borrowerId correspond à l'utilisateur connecté.
   * (Les prêts via borrowerContactId ne sont pas inclus ici — ces contacts n'ont pas de compte.)
   */
  borrowed: protectedProcedure
    .input(paginationSchema.optional())
    .query(async ({ ctx, input }) => {
      const now = new Date();
      const loans = await ctx.prisma.loan.findMany({
        where: {
          borrowerId: ctx.userId,
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
              image: true,
            },
          },
          borrowerContact: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { returnDueDate: "asc" },
        take: input?.limit ?? 20,
        cursor: input?.cursor ? { id: input.cursor } : undefined,
      });

      // Calculer le statut OVERDUE à la volée
      const loansWithComputedStatus = loans.map((loan) => ({
        ...loan,
        computedStatus:
          loan.status === "ACTIVE" &&
          loan.returnDueDate &&
          loan.returnDueDate < now
            ? "OVERDUE"
            : loan.status,
        ownerName: loan.owner.name ?? "Inconnu",
      }));

      return {
        items: loansWithComputedStatus,
        nextCursor:
          loans.length === (input?.limit ?? 20)
            ? (loans[loans.length - 1]?.id ?? null)
            : null,
      };
    }),

  /**
   * Historique complet des prêts (tous statuts).
   */
  history: protectedProcedure
    .input(paginationSchema.optional())
    .query(async ({ ctx, input }) => {
      const now = new Date();
      const loans = await ctx.prisma.loan.findMany({
        where: {
          OR: [{ ownerId: ctx.userId }, { borrowerId: ctx.userId }],
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
              image: true,
            },
          },
          borrowerContact: {
            select: {
              id: true,
              name: true,
              email: true,
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
        take: input?.limit ?? 20,
        cursor: input?.cursor ? { id: input.cursor } : undefined,
      });

      // Calculer le statut OVERDUE à la volée
      const loansWithComputedStatus = loans.map((loan) => ({
        ...loan,
        computedStatus:
          loan.status === "ACTIVE" &&
          loan.returnDueDate &&
          loan.returnDueDate < now
            ? "OVERDUE"
            : loan.status,
        borrowerName:
          loan.borrower?.name ?? loan.borrowerContact?.name ?? "Inconnu",
      }));

      return {
        items: loansWithComputedStatus,
        nextCursor:
          loans.length === (input?.limit ?? 20)
            ? (loans[loans.length - 1]?.id ?? null)
            : null,
      };
    }),

  /**
   * Crée un nouveau prêt.
   * Résout contactId → borrowerId (si compte) ou borrowerContactId (si pas de compte).
   * userId (optionnel) → emprunt direct à un utilisateur Brol via ID/QR.
   */
  create: protectedProcedure
    .input(createLoanSchema)
    .mutation(async ({ ctx, input }) => {
      // Vérifier que l'objet appartient à l'utilisateur
      const object = await ctx.prisma.object.findFirst({
        where: {
          id: input.objectId,
          collection: {
            userId: ctx.userId,
          },
        },
      });

      if (!object) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Objet non trouvé.",
        });
      }

      // Vérifier qu'il n'y a pas déjà un prêt actif
      const existingLoan = await ctx.prisma.loan.findFirst({
        where: {
          objectId: input.objectId,
          status: { in: ["ACTIVE", "OVERDUE"] },
        },
      });

      if (existingLoan) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Cet objet est déjà prêté.",
        });
      }

      let borrowerId: string | null = null;
      let borrowerContactId: string | null = null;

      if (input.userId) {
        // Emprunt direct à un utilisateur Brol (via ID/QR)
        const user = await ctx.prisma.user.findUnique({ where: { id: input.userId } });
        if (!user) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Utilisateur non trouvé." });
        }
        if (user.id === ctx.userId) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Vous ne pouvez pas vous prêter à vous-même." });
        }
        borrowerId = user.id;
      } else if (input.contactId) {
        // Emprunt via un contact de la liste
        const contact = await ctx.prisma.contact.findFirst({
          where: { id: input.contactId, userId: ctx.userId },
        });

        if (!contact) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Contact non trouvé." });
        }

        borrowerId = contact.borrowerId ?? null;
        borrowerContactId = borrowerId ? null : contact.id;

        if (!borrowerId && !borrowerContactId) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Impossible de déterminer l'emprunteur pour ce contact.",
          });
        }
      }

      const loan = await ctx.prisma.loan.create({
        data: {
          objectId: input.objectId,
          ownerId: ctx.userId,
          borrowerId,
          borrowerContactId,
          returnDueDate: input.returnDueDate,
          notes: input.notes,
          status: "ACTIVE",
        },
        include: {
          object: {
            select: { id: true, name: true, coverImage: true },
          },
          borrower: {
            select: { id: true, name: true, image: true },
          },
          borrowerContact: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      // Notification à l'emprunteur
      if (borrowerId) {
        await ctx.prisma.notification.create({
          data: {
            userId: borrowerId,
            type: "RETURN_REMINDER",
            title: "Nouvel emprunt",
            message: `${loan.object.name} vous a été prêté. Retour prévu: ${input.returnDueDate ? new Date(input.returnDueDate).toLocaleDateString("fr-BE") : "non défini"}.`,
            relatedId: loan.id,
            relatedType: "loan",
          },
        });
      }

      // Sync badges pour le prêteur
      syncUserBadges(ctx.prisma, ctx.userId).catch(() => {});

      return loan;
    }),

  /**
   * Marque un prêt comme retourné.
   */
  return: protectedProcedure
    .input(returnLoanSchema)
    .mutation(async ({ ctx, input }) => {
      const loan = await ctx.prisma.loan.findFirst({
        where: {
          id: input.loanId,
          ownerId: ctx.userId,
          status: { in: ["ACTIVE", "OVERDUE"] },
        },
      });

      if (!loan) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Prêt non trouvé ou déjà retourné.",
        });
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
   * Uniquement si le borrowerId est rempli (email disponible).
   */
  remind: protectedProcedure
    .input(z.object({ loanId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const loan = await ctx.prisma.loan.findFirst({
        where: {
          id: input.loanId,
          ownerId: ctx.userId,
          status: { in: ["ACTIVE", "OVERDUE"] },
          borrowerId: { not: null }, // Uniquement si compte utilisateur
        },
        include: {
          borrower: {
            select: { email: true, name: true },
          },
          object: {
            select: { name: true },
          },
          owner: {
            select: { name: true },
          },
        },
      });

      if (!loan) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message:
            "Prêt non trouvé ou emprunteur sans compte (email non disponible).",
        });
      }

      if (!loan.borrower) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Prêt non trouvé ou emprunteur sans compte (email non disponible).",
        });
      }
      const emailResult = await sendReminderEmail({
        to: loan.borrower.email ?? "",
        borrowerName: loan.borrower.name ?? "",
        objectName: loan.object.name,
        ownerName: loan.owner.name ?? "Le propriétaire",
        lentAt: loan.lentAt,
        returnDueDate: loan.returnDueDate,
      });

      if (!emailResult.success) {
        log.error("Reminder email failed", { reason: emailResult.message });
      }

      await ctx.prisma.loan.update({
        where: { id: input.loanId },
        data: { reminderSentAt: new Date() },
      });

      return {
        success: true,
        message: emailResult.success
          ? emailResult.message
          : "Rappel marqué comme envoyé (email désactivé)",
      };
    }),

  /**
   * Annule un prêt.
   */
  cancel: protectedProcedure
    .input(z.object({ loanId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const loan = await ctx.prisma.loan.findFirst({
        where: {
          id: input.loanId,
          ownerId: ctx.userId,
          status: "ACTIVE",
        },
      });

      if (!loan) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Prêt non trouvé.",
        });
      }

      return ctx.prisma.loan.update({
        where: { id: input.loanId },
        data: { status: "CANCELLED" },
      });
    }),
});

export type LoansRouter = typeof loansRouter;
