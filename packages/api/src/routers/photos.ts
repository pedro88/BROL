/**
 * Router Photos - Upload et gestion des photos d'objets.
 * @package @brol/api
 */

import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import {
  getPresignedUploadUrl,
  deleteS3Object,
  extractKeyFromUrl,
} from "../lib/s3";

// ===========================================
// SCHÉMAS
// ===========================================

const addPhotoSchema = z.object({
  objectId: z.string().cuid(),
  url: z.string().url(), // URL publique de la photo sur S3
  position: z.number().int().min(0).default(0),
});

const removePhotoSchema = z.object({
  objectId: z.string().cuid(),
  photoId: z.string().cuid(),
});

const getPresignedUrlSchema = z.object({
  objectId: z.string().cuid(),
  filename: z.string().min(1).max(255),
  contentType: z.string().min(1).max(100),
  fileSize: z.number().int().min(1),
});

const reorderPhotosSchema = z.object({
  objectId: z.string().cuid(),
  /** Map de photoId -> nouvelle position */
  positions: z.record(z.string().cuid(), z.number().int().min(0)),
});

// ===========================================
// ROUTER
// ===========================================

export const photosRouter = router({
  /**
   * Demande une presigned URL pour uploader une photo.
   * Le client upload ensuite directement vers S3 via PUT request,
   * puis appelle photo.add avec l'URL publique.
   */
  getPresignedUrl: protectedProcedure
    .input(getPresignedUrlSchema)
    .mutation(async ({ ctx, input }) => {
      // Vérifier ownership de l'objet
      const object = await ctx.prisma.object.findFirst({
        where: {
          id: input.objectId,
          collection: {
            userId: ctx.userId,
          },
        },
        select: { id: true },
      });

      if (!object) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Objet non trouvé",
        });
      }

      return getPresignedUploadUrl(
        input.objectId,
        input.filename,
        input.contentType,
        input.fileSize
      );
    }),

  /**
   * Ajoute une photo à un objet.
   * Appelé par le client après que l'upload S3 a réussi.
   */
  add: protectedProcedure
    .input(addPhotoSchema)
    .mutation(async ({ ctx, input }) => {
      // Vérifier ownership de l'objet
      const object = await ctx.prisma.object.findFirst({
        where: {
          id: input.objectId,
          collection: {
            userId: ctx.userId,
          },
        },
        select: { id: true },
      });

      if (!object) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Objet non trouvé",
        });
      }

      return ctx.prisma.photo.create({
        data: {
          objectId: input.objectId,
          url: input.url,
          position: input.position,
        },
      });
    }),

  /**
   * Supprime une photo.
   * Supprime également le fichier de S3.
   */
  remove: protectedProcedure
    .input(removePhotoSchema)
    .mutation(async ({ ctx, input }) => {
      // Vérifier ownership de l'objet ET de la photo
      const photo = await ctx.prisma.photo.findFirst({
        where: {
          id: input.photoId,
          objectId: input.objectId,
          object: {
            collection: {
              userId: ctx.userId,
            },
          },
        },
      });

      if (!photo) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Photo non trouvée",
        });
      }

      // Extraire la clé S3 de l'URL pour supprimer le fichier
      const key = extractKeyFromUrl(photo.url);
      if (key) {
        try {
          await deleteS3Object(key);
        } catch (err) {
          // Log l'erreur mais ne bloque pas la suppression en base
          console.error("[photo.remove] Failed to delete S3 object:", err);
        }
      }

      return ctx.prisma.photo.delete({
        where: { id: input.photoId },
      });
    }),

  /**
   * Liste les photos d'un objet.
   */
  list: protectedProcedure
    .input(z.object({ objectId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      // Vérifier ownership de l'objet
      const object = await ctx.prisma.object.findFirst({
        where: {
          id: input.objectId,
          collection: {
            userId: ctx.userId,
          },
        },
        select: { id: true },
      });

      if (!object) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Objet non trouvé",
        });
      }

      return ctx.prisma.photo.findMany({
        where: { objectId: input.objectId },
        orderBy: { position: "asc" },
      });
    }),

  /**
   * Réordonne les photos d'un objet.
   * Met à jour la position de chaque photo listée.
   */
  reorder: protectedProcedure
    .input(reorderPhotosSchema)
    .mutation(async ({ ctx, input }) => {
      // Vérifier ownership de l'objet
      const object = await ctx.prisma.object.findFirst({
        where: {
          id: input.objectId,
          collection: {
            userId: ctx.userId,
          },
        },
        select: { id: true },
      });

      if (!object) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Objet non trouvé",
        });
      }

      // Mettre à jour les positions en transaction
      await ctx.prisma.$transaction(
        Object.entries(input.positions).map(([photoId, position]) =>
          ctx.prisma.photo.update({
            where: { id: photoId },
            data: { position },
          })
        )
      );

      return ctx.prisma.photo.findMany({
        where: { objectId: input.objectId },
        orderBy: { position: "asc" },
      });
    }),
});

export type PhotosRouter = typeof photosRouter;
