/**
 * Router Objects - CRUD complet + gestion des prêts.
 * @package @brol/api
 */

import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { syncUserBadges } from "../lib/badge-service";
import { logger } from "../lib/logger";
import { assertObjectOwned, getOwnedObject } from "../lib/owned-objects";
import { cursorOf } from "../lib/pagination";
import {
  createObjectSchema,
  updateObjectSchema,
  paginationSchema,
  translate,
} from "@brol/shared";

const log = logger.child("objects.lookupIsbn");

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
        condition: z.enum(["NEW", "LIKE_NEW", "GOOD", "FAIR", "POOR"]).optional(),
        search: z.string().optional(),
        ...paginationSchema.shape,
      })
    )
    .query(async ({ ctx, input }) => {
      const now = new Date();

      // Branche borrowed : objets en possession via Loan actif où l'utilisateur
      // est borrowerId (et non ownerId). Sortie alignée sur le shape "owned".
      if (input.status === "borrowed") {
        const loans = await ctx.prisma.loan.findMany({
          where: {
            borrowerId: ctx.userId,
            status: { in: ["ACTIVE", "OVERDUE"] },
            ...(input.collectionId ? { object: { collectionId: input.collectionId } } : {}),
            ...(input.condition ? { object: { condition: input.condition } } : {}),
            ...(input.search
              ? {
                  object: {
                    OR: [
                      { name: { contains: input.search, mode: "insensitive" as const } },
                      { author: { contains: input.search, mode: "insensitive" as const } },
                    ],
                  },
                }
              : {}),
          },
          include: {
            object: {
              include: {
                collection: { select: { id: true, name: true, type: true } },
              },
            },
            owner: { select: { id: true, name: true, image: true, handle: true } },
          },
          orderBy: { returnDueDate: "asc" },
          take: input.limit ?? 100,
          cursor: input.cursor ? { id: input.cursor } : undefined,
        });

        const items = loans.map((loan) => {
          const obj = loan.object;
          return {
            id: obj.id,
            name: obj.name,
            author: obj.author,
            condition: obj.condition,
            coverImage: obj.coverImage,
            collection: obj.collection,
            objectType: obj.objectType,
            clothingSize: obj.clothingSize,
            clothingGender: obj.clothingGender,
            clothingColor: obj.clothingColor,
            clothingMaterial: obj.clothingMaterial,
            toolManual: obj.toolManual,
            toolSector: obj.toolSector,
            toolBattery: obj.toolBattery,
            toolPowerSource: obj.toolPowerSource,
            brand: obj.brand,
            cautionAmount: obj.cautionAmount ? Number(obj.cautionAmount) : null,
            rentalPriceDay: obj.rentalPriceDay ? Number(obj.rentalPriceDay) : null,
            rentalPriceHour: obj.rentalPriceHour ? Number(obj.rentalPriceHour) : null,
            rentalPriceWeek: obj.rentalPriceWeek ? Number(obj.rentalPriceWeek) : null,
            rentalPriceKm: obj.rentalPriceKm ? Number(obj.rentalPriceKm) : null,
            currentLoan: {
              id: loan.id,
              status: loan.status,
              borrower: null as { id: string; name: string | null } | null,
              returnDueDate: loan.returnDueDate,
              isOverdue:
                loan.status === "ACTIVE" &&
                loan.returnDueDate != null &&
                loan.returnDueDate < now,
            },
            owner: loan.owner,
          };
        });
        const { nextCursor } = cursorOf(loans, input.limit ?? 100);
        return { items, nextCursor };
      }

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
          ...(input.condition ? { condition: input.condition } : {}),
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

      const filtered = objects.filter((obj) => {
        if (input.status === "available") return obj.loans.length === 0;
        if (input.status === "lent") return obj.loans.length > 0;
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
          clothingSize: obj.clothingSize,
          clothingGender: obj.clothingGender,
          clothingColor: obj.clothingColor,
          clothingMaterial: obj.clothingMaterial,
          toolManual: obj.toolManual,
          toolSector: obj.toolSector,
          toolBattery: obj.toolBattery,
          toolPowerSource: obj.toolPowerSource,
          brand: obj.brand,
          cautionAmount: obj.cautionAmount ? Number(obj.cautionAmount) : null,
          rentalPriceDay: obj.rentalPriceDay ? Number(obj.rentalPriceDay) : null,
          rentalPriceHour: obj.rentalPriceHour ? Number(obj.rentalPriceHour) : null,
          rentalPriceWeek: obj.rentalPriceWeek ? Number(obj.rentalPriceWeek) : null,
          rentalPriceKm: obj.rentalPriceKm ? Number(obj.rentalPriceKm) : null,
          currentLoan: obj.loans[0]
            ? {
                id: obj.loans[0].id,
                status: obj.loans[0].status,
                borrower: obj.loans[0].borrower as { id: string; name: string | null } | null,
                returnDueDate: obj.loans[0].returnDueDate,
                isOverdue: obj.loans[0].status === "ACTIVE" && obj.loans[0].returnDueDate != null && obj.loans[0].returnDueDate < now,
              }
            : null,
          owner: null as { id: string; name: string | null; image: string | null; handle: string | null } | null,
        })),
        nextCursor: cursorOf(objects, input.limit ?? 100).nextCursor,
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
        throw new TRPCError({ code: "UNAUTHORIZED", message: translate(ctx.locale, "errors.collectionNotFoundUnauthorized") });
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
        nextCursor: cursorOf(objects, input.limit ?? 20).nextCursor,
      };
    }),

  /**
   * Récupère un objet par son ID.
   * Renvoie `null` si l'objet existe mais n'appartient pas au caller — le
   * frontend peut alors basculer sur `getPublic` pour la vue publique /
   * enrichie-via-contact (cf. `apps/web/src/app/objects/[id]/page.tsx`).
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

      return object;
    }),

  /**
   * Récupère un objet avec une vue adaptée au niveau d'accès :
   * - **owner** : toutes les infos (équivalent `get`).
   * - **viaContact** : enrichi (caution, prix, photos, fields type-spécifiques)
   *   mais pas d'historique de prêt ni de qrStock — réservés au propriétaire.
   * - **anonyme** : infos publiques de base (nom, auteur, condition, photos,
   *   collection name + owner name/handle).
   *
   * Toujours accessible (publicProcedure) — `null` si l'objet n'existe pas.
   * Les flags `isOwner` + `viaContact` permettent au frontend d'adapter l'UI.
   */
  getPublic: publicProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const object = await ctx.prisma.object.findUnique({
        where: { id: input.id },
        include: {
          collection: {
            include: {
              user: {
                select: { id: true, name: true, handle: true, image: true },
              },
            },
          },
          photos: {
            orderBy: { position: "asc" as const },
            select: { id: true, url: true, position: true, createdAt: true },
          },
          loans: {
            include: {
              borrower: {
                select: { id: true, name: true, image: true },
              },
            },
            orderBy: { lentAt: "desc" },
          },
          qrStock: true,
        },
      });

      if (!object) return null;

      const ownerId = object.collection.userId;
      const isOwner = ctx.userId === ownerId;

      let viaContact = false;
      if (!isOwner && ctx.userId) {
        const contact = await ctx.prisma.contact.findFirst({
          where: { userId: ctx.userId, borrowerId: ownerId },
          select: { id: true },
        });
        viaContact = !!contact;
      }

      // Détection borrower : caller a-t-il un Loan ACTIVE/OVERDUE sur
      // cet objet ? Si oui, on traite la vue comme enrichie (équivalent
      // viaContact) — l'emprunteur a au moins le droit aux infos
      // détaillées de l'objet qu'il détient physiquement.
      let myActiveLoan: {
        id: string;
        lentAt: Date;
        returnDueDate: Date | null;
      } | null = null;
      if (!isOwner && ctx.userId) {
        const loan = await ctx.prisma.loan.findFirst({
          where: {
            objectId: input.id,
            borrowerId: ctx.userId,
            status: { in: ["ACTIVE", "OVERDUE"] },
          },
          select: { id: true, lentAt: true, returnDueDate: true },
        });
        if (loan) myActiveLoan = loan;
      }
      const isBorrower = !!myActiveLoan;

      const owner = {
        id: object.collection.user.id,
        name: object.collection.user.name,
        handle: object.collection.user.handle,
        image: object.collection.user.image,
      };

      // Base publique — toujours visible
      const basePublic = {
        id: object.id,
        name: object.name,
        author: object.author,
        edition: object.edition,
        isbn: object.isbn,
        coverImage: object.coverImage,
        condition: object.condition,
        objectType: object.objectType,
        photos: object.photos,
        collection: {
          id: object.collection.id,
          name: object.collection.name,
          type: object.collection.type,
          isPublic: object.collection.isPublic,
        },
        owner,
        isOwner,
        viaContact,
        isBorrower,
        myActiveLoan,
      };

      if (!isOwner && !viaContact && !isBorrower) {
        // Vue anonyme — pas de notes, pas de fields type-spécifiques, pas de pricing
        return basePublic;
      }

      // Vue enrichie (owner ou viaContact)
      const enriched = {
        ...basePublic,
        barcode: object.barcode,
        notes: object.notes,
        // BOARD_GAME
        playersMin: object.playersMin,
        playersMax: object.playersMax,
        playingTimeMinutes: object.playingTimeMinutes,
        ageMin: object.ageMin,
        // ELECTRIC
        powerWatts: object.powerWatts,
        // CLOTHING
        clothingSize: object.clothingSize,
        clothingGender: object.clothingGender,
        clothingColor: object.clothingColor,
        clothingMaterial: object.clothingMaterial,
        // TOOL
        toolManual: object.toolManual,
        toolSector: object.toolSector,
        toolBattery: object.toolBattery,
        toolPowerSource: object.toolPowerSource,
        brand: object.brand,
        // CUSTOM
        customField1: object.customField1,
        customField2: object.customField2,
        // Caution + tarification
        cautionAmount: object.cautionAmount ? Number(object.cautionAmount) : null,
        rentalPriceDay: object.rentalPriceDay ? Number(object.rentalPriceDay) : null,
        rentalPriceHour: object.rentalPriceHour ? Number(object.rentalPriceHour) : null,
        rentalPriceWeek: object.rentalPriceWeek ? Number(object.rentalPriceWeek) : null,
        rentalPriceKm: object.rentalPriceKm ? Number(object.rentalPriceKm) : null,
      };

      if (!isOwner) {
        // viaContact : pas d'historique de prêt ni de qrStock
        return enriched;
      }

      // Owner : toutes les infos
      return {
        ...enriched,
        loans: object.loans,
        qrStock: object.qrStock,
      };
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
        throw new TRPCError({ code: "NOT_FOUND", message: "Collection non trouvée" });
      }

      // objectType defaults to BOOK via Zod schema, override from collection type if not set by client
      const objectType = input.objectType ?? collection.type ?? "BOOK";

      // Si un QR stock est fourni, vérifier qu'il appartient à l'utilisateur
      if (input.qrStockId) {
        const qrStock = await ctx.prisma.qrStock.findFirst({
          where: { id: input.qrStockId, userId: ctx.userId, used: false },
        });

        if (!qrStock) {
          throw new TRPCError({ code: "NOT_FOUND", message: translate(ctx.locale, "errors.qrCodeNotAvailable") });
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
      }).then((obj) => {
        // Sync badges pour le propriétaire de la collection
        syncUserBadges(ctx.prisma, ctx.userId).catch(() => {});
        return obj;
      });
    }),

  /**
   * Met à jour un objet existant.
   */
  update: protectedProcedure
    .input(z.object({ id: z.string().cuid(), data: updateObjectSchema }))
    .mutation(async ({ ctx, input }) => {
      await assertObjectOwned(ctx.prisma, ctx.userId, input.id);

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
      await assertObjectOwned(ctx.prisma, ctx.userId, input.id);

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
        log.warn("ISBN lookup failed", { isbn, err });
        return null;
      }
    }),
});

export type ObjectsRouter = typeof objectsRouter;
