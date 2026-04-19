/**
 * Router QR - Gestion des QR codes de stock.
 * @package @brol/api
 */

import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import {
  generateQrStockSchema,
  assignQrStockSchema,
  paginationSchema,
} from "@brol/shared";
import { generateScanCode } from "@brol/shared";

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
        orderBy: [{ used: "asc" }, { createdAt: "desc" }],
        take: input?.limit ?? 50,
        cursor: input?.cursor ? { id: input.cursor } : undefined,
      });

      return {
        items: qrCodes,
        nextCursor: qrCodes.length === (input?.limit ?? 50)
          ? qrCodes[qrCodes.length - 1].id
          : null,
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
   * Assigne un QR code de stock à un objet.
   */
  assignToObject: protectedProcedure
    .input(assignQrStockSchema)
    .mutation(async ({ ctx, input }) => {
      // Vérifier que le QR appartient à l'utilisateur et n'est pas utilisé
      const qrStock = await ctx.prisma.qrStock.findFirst({
        where: {
          id: input.qrStockId,
          userId: ctx.userId,
          used: false,
        },
      });

      if (!qrStock) {
        throw new Error("QR code non disponible");
      }

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
        throw new Error("Objet non trouvé");
      }

      // Vérifier que l'objet n'a pas déjà un QR assigné
      if (object.qrStockId) {
        throw new Error("Cet objet a déjà un QR code assigné");
      }

      // Assigner le QR à l'objet
      const [updatedObject] = await ctx.prisma.$transaction([
        ctx.prisma.object.update({
          where: { id: input.objectId },
          data: { qrStockId: input.qrStockId },
        }),
        ctx.prisma.qrStock.update({
          where: { id: input.qrStockId },
          data: { used: true, usedAt: new Date() },
        }),
      ]);

      return updatedObject;
    }),

  /**
   * Récupère un QR code par son code (pour scan).
   */
  getByCode: protectedProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ ctx, input }) => {
      const qrStock = await ctx.prisma.qrStock.findFirst({
        where: {
          code: input.code,
          userId: ctx.userId,
        },
        include: {
          objects: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!qrStock) {
        throw new Error("QR code non trouvé");
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
        throw new Error("QR code non trouvé ou déjà utilisé");
      }

      await ctx.prisma.qrStock.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});

export type QrRouter = typeof qrRouter;
