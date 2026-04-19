/**
 * Router Collections - CRUD complet + publiques.
 * @package @brol/api
 */

import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
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
  list: protectedProcedure
    .input(paginationSchema.optional())
    .query(async ({ ctx, input }) => {
      const collections = await ctx.prisma.collection.findMany({
        where: { userId: ctx.userId },
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
  get: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const collection = await ctx.prisma.collection.findFirst({
        where: {
          id: input.id,
          userId: ctx.userId,
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
   * Liste les collections publiques (sans auth requise).
   * Retourne uniquement les collections où isPublic = true.
   */
  listPublic: publicProcedure
    .input(paginationSchema.optional())
    .query(async ({ ctx, input }) => {
      const collections = await ctx.prisma.collection.findMany({
        where: { isPublic: true },
        include: {
          user: {
            select: { id: true, name: true },
          },
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
          id: c.id,
          name: c.name,
          description: c.description,
          coverImage: c.coverImage,
          ownerName: c.user.name,
          objectCount: c._count.objects,
        })),
        nextCursor: collections.length === (input?.limit ?? 20)
          ? collections[collections.length - 1]?.id ?? null
          : null,
      };
    }),

  /**
   * Récupère une collection publique par son ID (sans auth requise).
   * Ne retourne que les infos publiques — pas de détails sur le propriétaire.
   */
  getPublic: publicProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const collection = await ctx.prisma.collection.findFirst({
        where: {
          id: input.id,
          isPublic: true,
        },
        include: {
          user: {
            select: { id: true, name: true },
          },
          objects: {
            include: {
              loans: {
                where: { status: "ACTIVE" },
              },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!collection) {
        throw new Error("Collection non trouvée");
      }

      return {
        id: collection.id,
        name: collection.name,
        description: collection.description,
        coverImage: collection.coverImage,
        ownerName: collection.user.name,
        createdAt: collection.createdAt,
        objects: collection.objects.map((o) => ({
          id: o.id,
          name: o.name,
          author: o.author,
          edition: o.edition,
          coverImage: o.coverImage,
          condition: o.condition,
        })),
      };
    }),

  /**
   * Crée une nouvelle collection.
   */
  create: protectedProcedure
    .input(createCollectionSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.collection.create({
        data: {
          name: input.name,
          description: input.description,
          coverImage: input.coverImage,
          isPublic: input.isPublic ?? false,
          userId: ctx.userId,
        },
      });
    }),

  /**
   * Met à jour une collection existante.
   */
  update: protectedProcedure
    .input(z.object({ id: z.string().cuid(), data: updateCollectionSchema }))
    .mutation(async ({ ctx, input }) => {
      const collection = await ctx.prisma.collection.findFirst({
        where: { id: input.id, userId: ctx.userId },
      });

      if (!collection) {
        throw new Error("Collection non trouvée");
      }

      // Build update data, excluding undefined fields
      const updateData: Record<string, unknown> = {};
      if (input.data.name !== undefined) updateData.name = input.data.name;
      if (input.data.description !== undefined) updateData.description = input.data.description;
      if (input.data.coverImage !== undefined) updateData.coverImage = input.data.coverImage;
      if (input.data.isPublic !== undefined) updateData.isPublic = input.data.isPublic;

      return ctx.prisma.collection.update({
        where: { id: input.id },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: updateData as any,
      });
    }),

  /**
   * Supprime une collection.
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const collection = await ctx.prisma.collection.findFirst({
        where: { id: input.id, userId: ctx.userId },
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
