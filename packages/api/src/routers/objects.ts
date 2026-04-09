/**
 * Router Objects - CRUD complet + gestion des prêts.
 * @package @brol/api
 */

import { z } from "zod";
import { router, dbProcedure } from "../trpc";
import {
  createObjectSchema,
  updateObjectSchema,
  paginationSchema,
} from "@brol/shared";

/**
 * Router pour les objets.
 * Gère le CRUD complet des objets dans les collections.
 */
export const objectsRouter = router({
  /**
   * Liste les objets d'une collection.
   */
  list: dbProcedure
    .input(
      z.object({
        collectionId: z.string().cuid(),
        ...paginationSchema.shape,
      })
    )
    .query(async ({ ctx, input }) => {
      const objects = await ctx.prisma.object.findMany({
        where: {
          collectionId: input.collectionId,
        },
        include: {
          loans: {
            where: { status: "ACTIVE" },
            include: {
              borrower: {
                select: { id: true, name: true, avatarUrl: true },
              },
            },
          },
          qrStock: {
            select: { code: true, used: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: input.limit ?? 20,
        cursor: input.cursor ? { id: input.cursor } : undefined,
      });

      return {
        items: objects.map((obj: typeof objects[number]) => ({
          ...obj,
          currentLoan: obj.loans[0]
            ? {
                id: obj.loans[0].id,
                status: obj.loans[0].status,
                borrower: obj.loans[0].borrower,
                returnDueDate: obj.loans[0].returnDueDate,
              }
            : null,
          loans: undefined,
        })),
        nextCursor: objects.length === (input.limit ?? 20)
          ? objects[objects.length - 1]?.id ?? null
          : null,
      };
    }),

  /**
   * Récupère un objet par son ID.
   */
  get: dbProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const object = await ctx.prisma.object.findFirst({
        where: {
          id: input.id,
        },
        include: {
          collection: true,
          loans: {
            include: {
              borrower: {
                select: { id: true, name: true, avatarUrl: true },
              },
            },
            orderBy: { lentAt: "desc" },
          },
          qrStock: true,
        },
      });

      if (!object) {
        throw new Error("Objet non trouvé");
      }

      return object;
    }),

  /**
   * Crée un nouvel objet.
   */
  create: dbProcedure
    .input(createObjectSchema)
    .mutation(async ({ ctx, input }) => {
      // TODO: Vérifier que la collection appartient à l'utilisateur quand auth sera implémenté

      // Si un QR stock est fourni, vérifier qu'il n'est pas déjà utilisé
      if (input.qrStockId) {
        const qrStock = await ctx.prisma.qrStock.findFirst({
          where: { id: input.qrStockId, used: false },
        });

        if (!qrStock) {
          throw new Error("QR code non disponible");
        }

        // Marquer le QR comme utilisé
        await ctx.prisma.qrStock.update({
          where: { id: input.qrStockId },
          data: { used: true, usedAt: new Date() },
        });
      }

      return ctx.prisma.object.create({
        data: {
          ...input,
          qrStockId: input.qrStockId ?? null,
        },
        include: {
          qrStock: true,
        },
      });
    }),

  /**
   * Met à jour un objet existant.
   */
  update: dbProcedure
    .input(z.object({ id: z.string().cuid(), data: updateObjectSchema }))
    .mutation(async ({ ctx, input }) => {
      const object = await ctx.prisma.object.findFirst({
        where: {
          id: input.id,
        },
      });

      if (!object) {
        throw new Error("Objet non trouvé");
      }

      return ctx.prisma.object.update({
        where: { id: input.id },
        data: input.data,
      });
    }),

  /**
   * Supprime un objet.
   */
  delete: dbProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const object = await ctx.prisma.object.findFirst({
        where: {
          id: input.id,
        },
      });

      if (!object) {
        throw new Error("Objet non trouvé");
      }

      await ctx.prisma.object.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /**
   * Scan un ISBN pour récupérer les métadonnées.
   * @note Pour l'instant, retourne un résultat vide. Intégrer une API ISBN plus tard.
   */
  lookupIsbn: dbProcedure
    .input(z.object({ isbn: z.string() }))
    .query(async ({ input }) => {
      // TODO: Intégrer une API ISBN (Google Books, Open Library, etc.)
      // Pour l'instant, on retourne null
      return null;
    }),
});

export type ObjectsRouter = typeof objectsRouter;
