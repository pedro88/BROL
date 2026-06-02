/**
 * Router Collections - CRUD complet + publiques.
 * @package @brol/api
 */

import { z } from "zod";
import { Prisma } from "@prisma/client";
import { router, publicProcedure, protectedProcedure, TRPCError } from "../trpc";
import {
  paginationSchema,
} from "@brol/shared";
import { cursorOf } from "../lib/pagination";

const OBJECT_TYPES = [
  "BOOK",
  "BOARD_GAME",
  "TOOL",
  "FILM",
  "MUSIC",
  "ELECTRONIC",
  "ELECTRIC",
  "CLOTHING",
  "CUSTOM",
] as const;

// Inline schemas to avoid tsx watch workspace dep caching issue
const createCollectionSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  coverImage: z.string().url().optional(),
  isPublic: z.boolean().default(false),
  type: z.enum(OBJECT_TYPES), // required, no default
  customField1Label: z.string().max(50).optional(),
  customField2Label: z.string().max(50).optional(),
});

const updateCollectionSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  coverImage: z.string().url().optional(),
  isPublic: z.boolean().optional(),
  type: z.enum(OBJECT_TYPES).optional(),
  customField1Label: z.string().max(50).optional(),
  customField2Label: z.string().max(50).optional(),
});

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
        nextCursor: cursorOf(collections, input?.limit ?? 20).nextCursor,
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
                    select: { id: true, name: true, image: true },
                  },
                },
              },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!collection) {
        return null;
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
        nextCursor: cursorOf(collections, input?.limit ?? 20).nextCursor,
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
        return null;
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
      // Vérifier les limites de tier avant création
      const profile = await ctx.prisma.profile.findUnique({
        where: { userId: ctx.userId },
      });
      const tier = profile?.tier ?? "FREE";
      const tierLimits = { FREE: { collections: 5 }, TIER_2: { collections: 10 }, TIER_3: { collections: null } };
      const limits = tierLimits[tier as keyof typeof tierLimits] ?? tierLimits.FREE;
      const maxCollections = limits.collections;

      if (maxCollections !== null) {
        const count = await ctx.prisma.collection.count({ where: { userId: ctx.userId } });
        if (count >= maxCollections) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: `Limite de ${maxCollections} collections atteinte. Upgradez vers un plan supérieur pour continuer.`,
          });
        }
      }

      // Force type from input (do not default here — let the DB default handle it)
      const data: Record<string, unknown> = {
        name: input.name,
        description: input.description,
        coverImage: input.coverImage,
        isPublic: input.isPublic ?? false,
        customField1Label: input.customField1Label,
        customField2Label: input.customField2Label,
        userId: ctx.userId,
      };
      if (input.type !== undefined) {
        data.type = input.type;
      }
      return ctx.prisma.collection.create({ data: data as Parameters<typeof ctx.prisma.collection.create>[0]["data"] });
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
        throw new TRPCError({ code: "NOT_FOUND", message: "Collection non trouvée" });
      }

      // Build update data, excluding undefined fields. Typed via Prisma's
      // own update-input shape so we don't need an `as any` escape hatch.
      const updateData: Prisma.CollectionUpdateInput = {};
      if (input.data.name !== undefined) updateData.name = input.data.name;
      if (input.data.description !== undefined) updateData.description = input.data.description;
      if (input.data.coverImage !== undefined) updateData.coverImage = input.data.coverImage;
      if (input.data.isPublic !== undefined) updateData.isPublic = input.data.isPublic;
      if (input.data.type !== undefined) updateData.type = input.data.type;
      if (input.data.customField1Label !== undefined) updateData.customField1Label = input.data.customField1Label;
      if (input.data.customField2Label !== undefined) updateData.customField2Label = input.data.customField2Label;

      return ctx.prisma.collection.update({
        where: { id: input.id },
        data: updateData,
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
        throw new TRPCError({ code: "NOT_FOUND", message: "Collection non trouvée" });
      }

      // Cascade delete des objets et prêts associés
      await ctx.prisma.collection.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});

export type CollectionsRouter = typeof collectionsRouter;
