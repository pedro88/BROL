/**
 * Router QR - Gestion des QR codes de stock.
 * @package @brol/api
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure, publicProcedure } from "../trpc";
import {
  generateQrStockSchema,
  assignQrStockSchema,
  paginationSchema,
} from "@brol/shared";
import { generateScanCode } from "@brol/shared";
import { cursorOf } from "../lib/pagination";
import type { Prisma } from "@prisma/client";

/**
 * Shared body for `assign` and `assignToObject` — both procedures end up
 * doing the exact same DB work (find QR → check object → transaction)
 * once the QR has been resolved. Centralizing it removes ~80 lines of
 * duplication and guarantees the two procedures stay in lock-step on
 * authorization + invariants.
 */
async function assignQrToObject(
  prisma: import("@brol/db").PrismaClient,
  userId: string,
  objectId: string,
  qrWhere: Prisma.QrStockWhereInput,
  qrNotFoundMessage: string,
) {
  const qrStock = await prisma.qrStock.findFirst({ where: qrWhere });
  if (!qrStock) {
    throw new TRPCError({ code: "NOT_FOUND", message: qrNotFoundMessage });
  }

  const object = await prisma.object.findFirst({
    where: { id: objectId, collection: { userId } },
  });
  if (!object) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Objet non trouvé" });
  }

  if (object.qrStockId) {
    throw new TRPCError({ code: "CONFLICT", message: "Cet objet a déjà un QR code assigné" });
  }

  const [updatedObject] = await prisma.$transaction([
    prisma.object.update({
      where: { id: objectId },
      data: { qrStockId: qrStock.id },
    }),
    prisma.qrStock.update({
      where: { id: qrStock.id },
      data: { used: true, usedAt: new Date() },
    }),
  ]);

  return updatedObject;
}

/**
 * Router pour les QR codes.
 * Gère la génération de QR codes vierges et l'assignation aux objets.
 */
export const qrRouter = router({
  /**
   * Liste les QR codes de stock disponibles.
   */
  listStock: protectedProcedure
    .input(
      z.object({
        used: z.boolean().optional(),
        ...paginationSchema.shape,
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const where = {
        userId: ctx.userId,
        ...(input?.used !== undefined && { used: input.used }),
      };

      const qrCodes = await ctx.prisma.qrStock.findMany({
        where,
        include: {
          // 1 QR ↔ 1 Object max (Object.qrStockId est `@unique`)
          objects: {
            select: {
              id: true,
              name: true,
              coverImage: true,
              collection: { select: { id: true, name: true, type: true } },
            },
          },
        },
        orderBy: [{ used: "asc" }, { createdAt: "desc" }],
        take: input?.limit ?? 50,
        cursor: input?.cursor ? { id: input.cursor } : undefined,
      });

      return {
        items: qrCodes.map((qr) => ({
          ...qr,
          // Aplatir la relation 1-1 pour simplifier le frontend.
          object: qr.objects[0] ?? null,
          objects: undefined,
        })),
        nextCursor: cursorOf(qrCodes, input?.limit ?? 50).nextCursor,
      };
    }),

  /**
   * Génère de nouveaux QR codes vierges.
   */
  generateStock: protectedProcedure
    .input(generateQrStockSchema)
    .mutation(async ({ ctx, input }) => {
      const codes = Array.from({ length: input.count }, () => ({
        userId: ctx.userId,
        code: generateScanCode(),
        used: false,
      }));

      await ctx.prisma.qrStock.createMany({
        data: codes,
      });

      // Récupérer les codes générés
      const generated = await ctx.prisma.qrStock.findMany({
        where: {
          userId: ctx.userId,
          code: { in: codes.map((c) => c.code) },
        },
        orderBy: { createdAt: "desc" },
        take: input.count,
      });

      return {
        count: generated.length,
        codes: generated,
      };
    }),

  /**
   * Assigne un QR code de stock à un objet via scan (par code, pas par ID).
   */
  assign: protectedProcedure
    .input(z.object({ objectId: z.string().cuid(), qrCode: z.string() }))
    .mutation(({ ctx, input }) =>
      assignQrToObject(ctx.prisma, ctx.userId, input.objectId, {
        code: input.qrCode,
        userId: ctx.userId,
        used: false,
      }, "QR code non disponible ou déjà utilisé")
    ),

  /**
   * Assigne un QR code de stock à un objet (par ID interne).
   */
  assignToObject: protectedProcedure
    .input(assignQrStockSchema)
    .mutation(({ ctx, input }) =>
      assignQrToObject(ctx.prisma, ctx.userId, input.objectId, {
        id: input.qrStockId,
        userId: ctx.userId,
        used: false,
      }, "QR code non disponible")
    ),

  /**
   * Récupère un QR code par son code (pour scan).
   * Public — accessible sans auth pour permettre à quiconque de scanner un objet.
   */
  getByCode: publicProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ ctx, input }) => {
      // Recherche globale (pas de filtre userId) car le scanneur ne connaît pas le propriétaire
      const qrStock = await ctx.prisma.qrStock.findFirst({
        where: {
          code: input.code,
        },
        include: {
          objects: {
            select: {
              id: true,
              name: true,
              author: true,
              condition: true,
              coverImage: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              profile: {
                select: {
                  bio: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      });

      if (!qrStock) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "QR code non trouvé",
        });
      }

      return qrStock;
    }),

  /**
   * Supprime un QR code de stock (s'il n'est pas utilisé).
   */
  deleteStock: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const qrStock = await ctx.prisma.qrStock.findFirst({
        where: {
          id: input.id,
          userId: ctx.userId,
          used: false,
        },
      });

      if (!qrStock) {
        throw new TRPCError({ code: "NOT_FOUND", message: "QR code non trouvé ou déjà utilisé" });
      }

      await ctx.prisma.qrStock.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});

export type QrRouter = typeof qrRouter;
