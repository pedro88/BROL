/**
 * Router QR - Gestion des QR codes de stock.
 * @package @brol/api
 */

import { z } from "zod";
import { router, dbProcedure } from "../trpc";
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
  listStock: dbProcedure
    .input(
      z.object({
        used: z.boolean().optional(),
        ...paginationSchema.shape,
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      // TODO: Filtrer par userId quand auth sera implémenté
      const where = {
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
  generateStock: dbProcedure
    .input(generateQrStockSchema)
    .mutation(async ({ ctx, input }) => {
      // TODO: Utiliser ctx.userId quand auth sera implémenté
      const userId = "demo-user";
      
      const codes = Array.from({ length: input.count }, () => ({
        userId,
        code: generateScanCode(),
        used: false,
      }));

      await ctx.prisma.qrStock.createMany({
        data: codes,
      });

      // Récupérer les codes générés
      const generated = await ctx.prisma.qrStock.findMany({
        where: {
          userId,
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
  assignToObject: dbProcedure
    .input(assignQrStockSchema)
    .mutation(async ({ ctx, input }) => {
      // TODO: Vérifier ownership quand auth sera implémenté
      
      // Vérifier que le QR existe et n'est pas utilisé
      const qrStock = await ctx.prisma.qrStock.findFirst({
        where: {
          id: input.qrStockId,
          used: false,
        },
      });

      if (!qrStock) {
        throw new Error("QR code non disponible");
      }

      // Vérifier que l'objet existe
      const object = await ctx.prisma.object.findFirst({
        where: {
          id: input.objectId,
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
  getByCode: dbProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ ctx, input }) => {
      // TODO: Filtrer par userId quand auth sera implémenté
      const qrStock = await ctx.prisma.qrStock.findFirst({
        where: {
          code: input.code,
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
  deleteStock: dbProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      // TODO: Vérifier ownership quand auth sera implémenté
      const qrStock = await ctx.prisma.qrStock.findFirst({
        where: {
          id: input.id,
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
