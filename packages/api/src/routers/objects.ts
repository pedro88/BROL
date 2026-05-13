/**
 * Router Objects - CRUD complet + gestion des prêts.
 * @package @brol/api
 */

import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
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
   * Liste TOUS les objets de l'utilisateur (toutes collections confondues).
   * Pour la page /objects avec filtres.
   */
  all: protectedProcedure
    .input(
      z.object({
        collectionId: z.string().cuid().optional(),
        status: z.enum(["all", "available", "lent", "borrowed"]).default("all"),
        condition: z.string().optional(),
        search: z.string().optional(),
        ...paginationSchema.shape,
      })
    )
    .query(async ({ ctx, input }) => {
      const now = new Date();

      const objects = await ctx.prisma.object.findMany({
        where: {
          collection: {
            userId: ctx.userId,
            ...(input.collectionId ? { id: input.collectionId } : {}),
          },
          ...(input.search
            ? {
                OR: [
                  { name: { contains: input.search, mode: "insensitive" as const } },
                  { author: { contains: input.search, mode: "insensitive" as const } },
                ],
              }
            : {}),
          ...(input.condition ? { condition: input.condition as any } : {}),
        },
        include: {
          collection: {
            select: { id: true, name: true, type: true },
          },
          loans: {
            where: { status: { in: ["ACTIVE", "OVERDUE"] } },
            include: {
              borrower: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: input.limit ?? 100,
        cursor: input.cursor ? { id: input.cursor } : undefined,
      });

      // Filtrer par status借贷 après le fetch (plus simple que plusieurs requêtes)
      const filtered = objects.filter((obj) => {
        if (input.status === "available") return obj.loans.length === 0;
        if (input.status === "lent") return obj.loans.length > 0;
        // "all" et "borrowed" passent (borrowed = pas applicable ici, on filtre côté loans.borrowedId)
        return true;
      });

      return {
        items: filtered.map((obj) => ({
          id: obj.id,
          name: obj.name,
          author: obj.author,
          condition: obj.condition,
          coverImage: obj.coverImage,
          collection: obj.collection,
          objectType: obj.objectType,
          // CLOTHING
          clothingSize: obj.clothingSize,
          clothingGender: obj.clothingGender,
          clothingColor: obj.clothingColor,
          clothingMaterial: obj.clothingMaterial,
          // TOOL
          toolManual: obj.toolManual,
          toolSector: obj.toolSector,
          toolBattery: obj.toolBattery,
          // Caution et tarification
          cautionAmount: obj.cautionAmount ? Number(obj.cautionAmount) : null,
          rentalPriceDay: obj.rentalPriceDay ? Number(obj.rentalPriceDay) : null,
          rentalPriceHour: obj.rentalPriceHour ? Number(obj.rentalPriceHour) : null,
          rentalPriceWeek: obj.rentalPriceWeek ? Number(obj.rentalPriceWeek) : null,
          rentalPriceKm: obj.rentalPriceKm ? Number(obj.rentalPriceKm) : null,
          currentLoan: obj.loans[0]
            ? {
                id: obj.loans[0].id,
                status: obj.loans[0].status,
                borrower: obj.loans[0].borrower,
                returnDueDate: obj.loans[0].returnDueDate,
                isOverdue: obj.loans[0].status === "ACTIVE" && obj.loans[0].returnDueDate != null && obj.loans[0].returnDueDate < now,
              }
            : null,
        })),
        nextCursor:
          objects.length === (input.limit ?? 100)
            ? (objects[objects.length - 1]?.id ?? null)
            : null,
      };
    }),

  /**
   * Liste les objets d'une collection.
   * Throws UNAUTHORIZED if the collection doesn't belong to the user.
   */
  list: protectedProcedure
    .input(
      z.object({
        collectionId: z.string().cuid(),
        ...paginationSchema.shape,
      })
    )
    .query(async ({ ctx, input }) => {
      // First verify ownership — fail fast with a clear error rather than silent empty list
      const collection = await ctx.prisma.collection.findFirst({
        where: { id: input.collectionId, userId: ctx.userId },
        select: { id: true },
      });

      if (!collection) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Collection non trouvée" });
      }

      const objects = await ctx.prisma.object.findMany({
        where: {
          collectionId: input.collectionId,
          collection: {
            userId: ctx.userId,
          },
        },
        include: {
          loans: {
            where: { status: "ACTIVE" },
            include: {
              borrower: {
                select: { id: true, name: true, image: true },
              },
            },
          },
          qrStock: {
            select: { code: true, used: true },
          },
          photos: {
            orderBy: { position: "asc" as const },
            select: { id: true, url: true, position: true, createdAt: true },
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
  get: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const object = await ctx.prisma.object.findFirst({
        where: {
          id: input.id,
          collection: {
            userId: ctx.userId,
          },
        },
        include: {
          collection: true,
          loans: {
            include: {
              borrower: {
                select: { id: true, name: true, image: true },
              },
            },
            orderBy: { lentAt: "desc" },
          },
          qrStock: true,
          photos: {
            orderBy: { position: "asc" as const },
          },
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
  create: protectedProcedure
    .input(createObjectSchema)
    .mutation(async ({ ctx, input }) => {
      // Vérifier que la collection appartient à l'utilisateur
      const collection = await ctx.prisma.collection.findFirst({
        where: { id: input.collectionId, userId: ctx.userId },
      });

      if (!collection) {
        throw new Error("Collection non trouvée");
      }

      // objectType defaults to BOOK via Zod schema, override from collection type if not set by client
      const objectType = input.objectType ?? collection.type ?? "BOOK";

      // Si un QR stock est fourni, vérifier qu'il appartient à l'utilisateur
      if (input.qrStockId) {
        const qrStock = await ctx.prisma.qrStock.findFirst({
          where: { id: input.qrStockId, userId: ctx.userId, used: false },
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
          objectType,
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
  update: protectedProcedure
    .input(z.object({ id: z.string().cuid(), data: updateObjectSchema }))
    .mutation(async ({ ctx, input }) => {
      const object = await ctx.prisma.object.findFirst({
        where: {
          id: input.id,
          collection: {
            userId: ctx.userId,
          },
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
  delete: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const object = await ctx.prisma.object.findFirst({
        where: {
          id: input.id,
          collection: {
            userId: ctx.userId,
          },
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
   * Lookup ISBN via Open Library API.
   * Retourne les métadonnées d'un livre (titre, auteur, couverture).
   * API gratuite: https://openlibrary.org/dev/docs/api/books
   */
  lookupIsbn: protectedProcedure
    .input(z.object({ isbn: z.string().min(10).max(17) }))
    .query(async ({ input }) => {
      const { isbn } = input;

      try {
        const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;
        const response = await fetch(url, {
          signal: AbortSignal.timeout(8000),
        });

        if (!response.ok) {
          throw new Error(`Open Library returned ${response.status}`);
        }

        const data = await response.json() as Record<string, unknown>;
        const bookKey = `ISBN:${isbn}`;
        const book = data[bookKey] as {
          title?: string;
          authors?: Array<{ name: string }>;
          publishers?: Array<{ name: string }>;
          publish_date?: string;
          number_of_pages?: number;
          cover?: { small?: string; medium?: string; large?: string };
          subjects?: Array<{ name: string }>;
        } | undefined;

        if (!book) {
          return null;
        }

        return {
          title: book.title ?? null,
          author: book.authors?.map((a) => a.name).join(", ") ?? null,
          publisher: book.publishers?.[0]?.name ?? null,
          publishDate: book.publish_date ?? null,
          pageCount: book.number_of_pages ?? null,
          coverUrl: book.cover?.medium ?? book.cover?.small ?? book.cover?.large ?? null,
          subjects: book.subjects?.slice(0, 5).map((s) => s.name) ?? [],
        };
      } catch (err) {
        // ISBN non trouvé ou erreur réseau — retourne null silencieusement
        console.warn(`[lookupIsbn] Failed for ISBN ${isbn}:`, err);
        return null;
      }
    }),
});

export type ObjectsRouter = typeof objectsRouter;
