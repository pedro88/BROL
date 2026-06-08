/**
 * Router Collections - CRUD complet + publiques.
 * @package @brol/api
 */

import { z } from "zod";
import { Prisma } from "@prisma/client";
import { router, publicProcedure, protectedProcedure, TRPCError } from "../trpc";
import {
  paginationSchema,
  translate,
} from "@brol/shared";
import { cursorOf } from "../lib/pagination";
import { enforceQuota } from "../lib/quota";
import { logAudit } from "../lib/audit";

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
  description: z.string().max(500).optional().nullable(),
  coverImage: z.string().url().optional().nullable(),
  isPublic: z.boolean().optional(),
  type: z.enum(OBJECT_TYPES).optional(),
  customField1Label: z.string().max(50).optional().nullable(),
  customField2Label: z.string().max(50).optional().nullable(),
  selfServiceMode: z.enum(["OFF", "CONTACTS", "RADIUS", "PUBLIC"]).optional(),
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
      await enforceQuota(ctx, "collections");

      // Force type from input (do not default here — let the DB default handle it)
      const data: Record<string, unknown> = {
        name: input.name,
        description: input.description,
        coverImage: input.coverImage,
        isPublic: input.isPublic ?? false,
        customField1Label: input.customField1Label,
        customField2Label: input.customField2Label,
        userId: ctx.userId,
        selfServiceMode: input.selfServiceMode ?? "OFF",
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
        throw new TRPCError({ code: "NOT_FOUND", message: translate(ctx.locale, "errors.collectionNotFound") });
      }

      // Cascade selfServiceMode to child objects that still have OFF
      if (input.data.selfServiceMode !== undefined) {
        await ctx.prisma.object.updateMany({
          where: {
            collectionId: input.id,
            selfServiceMode: "OFF",
          },
          data: {
            selfServiceMode: input.data.selfServiceMode,
          },
        });
      }

      return ctx.prisma.collection.update({
        where: { id: input.id },
        data: input.data as Prisma.CollectionUpdateInput,
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
        throw new TRPCError({ code: "NOT_FOUND", message: translate(ctx.locale, "errors.collectionNotFound") });
      }

      await ctx.prisma.collection.delete({
        where: { id: input.id },
      });

      await logAudit(ctx.prisma, {
        userId: ctx.userId,
        action: "collection_delete",
        metadata: { collectionId: input.id, collectionName: collection.name },
      });

      return { success: true };
    }),
});

export type CollectionsRouter = typeof collectionsRouter;
