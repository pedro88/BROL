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
import { logger } from "../lib/logger";
import { assertObjectOwned, getOwnedObject } from "../lib/owned-objects";
import { translate } from "@brol/shared";
import { syncUserBadges } from "../lib/badge-service";

const log = logger.child("photos");

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
      await assertObjectOwned(ctx.prisma, ctx.userId, input.objectId);

      return getPresignedUploadUrl(
        input.objectId,
        input.filename,
        input.contentType,
        input.fileSize,
        ctx.locale
      );
    }),

  /**
   * Ajoute une photo à un objet.
   * Appelé par le client après que l'upload S3 a réussi.
   */
  add: protectedProcedure
    .input(addPhotoSchema)
    .mutation(async ({ ctx, input }) => {
      await assertObjectOwned(ctx.prisma, ctx.userId, input.objectId);

      const photo = await ctx.prisma.photo.create({
        data: {
          objectId: input.objectId,
          url: input.url,
          position: input.position,
        },
      });

      // Sync `Object.coverImage` pour que les cards listant juste cette
      // colonne (collection, /objects, dashboard) affichent la photo
      // sans avoir à joindre la relation `photos`. On écrase quand la
      // nouvelle photo est position 0, ou quand l'objet n'a pas encore
      // de cover.
      const obj = await ctx.prisma.object.findUnique({
        where: { id: input.objectId },
        select: { coverImage: true },
      });
      if (input.position === 0 || !obj?.coverImage) {
        await ctx.prisma.object.update({
          where: { id: input.objectId },
          data: { coverImage: input.url },
        });
      }

      await syncUserBadges(ctx.prisma, ctx.userId);

      return photo;
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
          message: translate(ctx.locale, "errors.photoNotFound"),
        });
      }

      // Extraire la clé S3 de l'URL pour supprimer le fichier
      const key = extractKeyFromUrl(photo.url);
      if (key) {
        try {
          await deleteS3Object(key);
        } catch (err) {
          // Log l'erreur mais ne bloque pas la suppression en base
          log.error("Failed to delete S3 object on photo.remove", { err });
        }
      }

      const deleted = await ctx.prisma.photo.delete({
        where: { id: input.photoId },
      });

      // Re-sync `Object.coverImage` si on vient de supprimer la cover :
      // prend la prochaine photo (plus petite position) ou null si
      // l'objet n'a plus de photo.
      const obj = await ctx.prisma.object.findUnique({
        where: { id: input.objectId },
        select: { coverImage: true },
      });
      if (obj?.coverImage === photo.url) {
        const next = await ctx.prisma.photo.findFirst({
          where: { objectId: input.objectId },
          orderBy: { position: "asc" },
          select: { url: true },
        });
        await ctx.prisma.object.update({
          where: { id: input.objectId },
          data: { coverImage: next?.url ?? null },
        });
      }

      return deleted;
    }),

  /**
   * Liste les photos d'un objet.
   */
  list: protectedProcedure
    .input(z.object({ objectId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      await assertObjectOwned(ctx.prisma, ctx.userId, input.objectId);

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
      await assertObjectOwned(ctx.prisma, ctx.userId, input.objectId);

      // Sécurité : ne réordonner QUE des photos de cet objet — sans ce
      // filtre, des photoIds arbitraires permettraient d'écrire sur les
      // photos d'autres utilisateurs (IDOR).
      const owned = await ctx.prisma.photo.findMany({
        where: { objectId: input.objectId, id: { in: Object.keys(input.positions) } },
        select: { id: true },
      });
      const ownedIds = new Set(owned.map((p) => p.id));

      await ctx.prisma.$transaction(
        Object.entries(input.positions)
          .filter(([photoId]) => ownedIds.has(photoId))
          .map(([photoId, position]) =>
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
