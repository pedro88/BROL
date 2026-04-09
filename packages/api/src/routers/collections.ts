/**
 * Router Collections - CRUD complet.
 * @package @brol/api
 */

import { z } from "zod";
import { router, publicProcedure, dbProcedure } from "../trpc";
import {
  createCollectionSchema,
  updateCollectionSchema,
  paginationSchema,
} from "@brol/shared";

/**
 * Router pour les collections.
 * Gère le CRUD complet des collections d'objets.
 */
export const collectionsRouter = router({
  /**
   * Liste les collections de l'utilisateur.
   */
  list: dbProcedure
    .input(paginationSchema.optional())
    .query(async ({ ctx, input }) => {
      // TODO: Filtrer par userId quand auth sera implémenté
      const collections = await ctx.prisma.collection.findMany({
        include: {
          _count: {
            select: { objects: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: input?.limit ?? 20,
        cursor: input?.cursor ? { id: input.cursor } : undefined,
      });

      return {
        items: collections.map((c: typeof collections[number]) => ({
          ...c,
          objectCount: c._count.objects,
          _count: undefined,
        })),
        nextCursor: collections.length === (input?.limit ?? 20)
          ? collections[collections.length - 1]?.id ?? null
          : null,
      };
    }),

  /**
   * Récupère une collection par son ID.
   */
  get: dbProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const collection = await ctx.prisma.collection.findFirst({
        where: {
          id: input.id,
        },
        include: {
          objects: {
            include: {
              loans: {
                where: { status: "ACTIVE" },
                include: {
                  borrower: {
                    select: { id: true, name: true, avatarUrl: true },
                  },
                },
              },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!collection) {
        throw new Error("Collection non trouvée");
      }

      return collection;
    }),

  /**
   * Crée une nouvelle collection.
   */
  create: dbProcedure
    .input(createCollectionSchema)
    .mutation(async ({ ctx, input }) => {
      // TODO: Utiliser ctx.userId quand auth sera implémenté
      return ctx.prisma.collection.create({
        data: {
          ...input,
          userId: "demo-user", // Placeholder jusqu'à auth
        },
      });
    }),

  /**
   * Met à jour une collection existante.
   */
  update: dbProcedure
    .input(z.object({ id: z.string().cuid(), data: updateCollectionSchema }))
    .mutation(async ({ ctx, input }) => {
      const collection = await ctx.prisma.collection.findFirst({
        where: { id: input.id },
      });

      if (!collection) {
        throw new Error("Collection non trouvée");
      }

      return ctx.prisma.collection.update({
        where: { id: input.id },
        data: input.data,
      });
    }),

  /**
   * Supprime une collection.
   */
  delete: dbProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const collection = await ctx.prisma.collection.findFirst({
        where: { id: input.id },
      });

      if (!collection) {
        throw new Error("Collection non trouvée");
      }

      // Cascade delete des objets et prêts associés
      await ctx.prisma.collection.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});

export type CollectionsRouter = typeof collectionsRouter;
