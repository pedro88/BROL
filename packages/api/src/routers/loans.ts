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
  translate,
  type Locale,
} from "@brol/shared";
import { sendReminderEmail } from "../emails";
import { syncUserBadges } from "../lib/badge-service";
import { logger } from "../lib/logger";
import { withComputedStatuses } from "../lib/loan-status";
import { assertObjectOwned } from "../lib/owned-objects";
import { cursorOf } from "../lib/pagination";

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

      // Dériver computedStatus (overdue à la volée) + borrowerName
      // (priorité User > Contact).
      const items = withComputedStatuses(loans).map((loan) => ({
        ...loan,
        borrowerName:
          loan.borrower?.name ?? loan.borrowerContact?.name ?? "Inconnu",
      }));

      return cursorOf(items, input?.limit ?? 20);
    }),

  /**
   * Liste les objets empruntés par l'utilisateur.
   * Ne concerne que les prêts où le borrowerId correspond à l'utilisateur connecté.
   * (Les prêts via borrowerContactId ne sont pas inclus ici — ces contacts n'ont pas de compte.)
   */
  borrowed: protectedProcedure
    .input(paginationSchema.optional())
    .query(async ({ ctx, input }) => {
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

      const items = withComputedStatuses(loans).map((loan) => ({
        ...loan,
        ownerName: loan.owner.name ?? "Inconnu",
      }));

      return cursorOf(items, input?.limit ?? 20);
    }),

  /**
   * Historique complet des prêts (tous statuts).
   */
  history: protectedProcedure
    .input(paginationSchema.optional())
    .query(async ({ ctx, input }) => {
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

      // Mélange les prêts où le caller est owner ET ceux où il est
      // borrower. On expose `viewAs` pour que le frontend rende le bon
      // libellé / actions.
      const items = withComputedStatuses(loans).map((loan) => ({
        ...loan,
        borrowerName:
          loan.borrower?.name ?? loan.borrowerContact?.name ?? "Inconnu",
        viewAs: (loan.ownerId === ctx.userId ? "owner" : "borrower") as
          | "owner"
          | "borrower",
      }));

      return cursorOf(items, input?.limit ?? 20);
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
      await assertObjectOwned(ctx.prisma, ctx.userId, input.objectId);

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
          message: translate(ctx.locale, "errors.objectAlreadyLent"),
        });
      }

      let borrowerId: string | null = null;
      let borrowerContactId: string | null = null;

      if (input.userId) {
        // Emprunt direct à un utilisateur Brol (via ID/QR)
        const user = await ctx.prisma.user.findUnique({ where: { id: input.userId } });
        if (!user) {
          throw new TRPCError({ code: "NOT_FOUND", message: translate(ctx.locale, "errors.userNotFoundPeriod") });
        }
        if (user.id === ctx.userId) {
          throw new TRPCError({ code: "BAD_REQUEST", message: translate(ctx.locale, "errors.cannotLendToYourself") });
        }
        borrowerId = user.id;

        // Auto-ajout en contact : si le caller n'a pas encore ce user
        // dans ses contacts, en créer un automatiquement (best-effort,
        // ne fait pas planter la création du prêt en cas d'erreur).
        try {
          const existingContact = await ctx.prisma.contact.findFirst({
            where: { userId: ctx.userId, borrowerId: user.id },
            select: { id: true },
          });
          if (!existingContact) {
            await ctx.prisma.contact.create({
              data: {
                userId: ctx.userId,
                borrowerId: user.id,
                name: user.name ?? user.email,
                email: user.email,
              },
            });
          }
        } catch {
          // Silencieux : l'auto-ajout n'est pas critique.
        }
      } else if (input.contactId) {
        // Emprunt via un contact de la liste
        const contact = await ctx.prisma.contact.findFirst({
          where: { id: input.contactId, userId: ctx.userId },
        });

        if (!contact) {
          throw new TRPCError({ code: "NOT_FOUND", message: translate(ctx.locale, "errors.contactNotFoundPeriod") });
        }

        borrowerId = contact.borrowerId ?? null;
        borrowerContactId = borrowerId ? null : contact.id;

        if (!borrowerId && !borrowerContactId) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: translate(ctx.locale, "errors.cannotDetermineBorrower"),
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
            title: translate(ctx.locale, "notifications.newLoanTitle"),
            message: translate(ctx.locale, "notifications.newLoanMessage", {
              objectName: loan.object.name,
              returnDueDate: input.returnDueDate
                ? new Date(input.returnDueDate).toLocaleDateString("fr-BE")
                : "non défini",
            }),
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
          message: translate(ctx.locale, "errors.loanNotFoundOrReturned"),
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
            select: { email: true, name: true, locale: true },
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
          message: translate(ctx.locale, "errors.loanNotFoundOrBorrowerHasNoEmail"),
        });
      }

      if (!loan.borrower) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: translate(ctx.locale, "errors.loanNotFoundOrBorrowerHasNoEmail"),
        });
      }
      const emailResult = await sendReminderEmail({
        to: loan.borrower.email ?? "",
        borrowerName: loan.borrower.name ?? "",
        objectName: loan.object.name,
        ownerName: loan.owner.name ?? "Le propriétaire",
        lentAt: loan.lentAt,
        returnDueDate: loan.returnDueDate,
        locale: (loan.borrower.locale ?? "fr") as Locale,
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
          message: translate(ctx.locale, "errors.loanNotFound"),
        });
      }

      return ctx.prisma.loan.update({
        where: { id: input.loanId },
        data: { status: "CANCELLED" },
      });
    }),
});

export type LoansRouter = typeof loansRouter;
