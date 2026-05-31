/**
 * Community Request router — demandes à la communauté pour emprunter.
 * @package @brol/api
 */

import { router, protectedProcedure, publicProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";
import { haversineSql, haversineKm } from "../lib/geo";

const RADIUS_VALUES = [5, 10, 25, 50, 100] as const;

/**
 * Échappe les caractères LIKE/ILIKE (%/_) dans la requête utilisateur
 * pour éviter qu'ils soient interprétés comme wildcards.
 */
function escapeLikePattern(input: string): string {
  return input.replace(/[\\%_]/g, "\\$&");
}

type MatchRow = {
  objectId: string;
  objectName: string;
  ownerId: string;
  ownerLat: number;
  ownerLng: number;
};

export const communityRequestRouter = router({
  /**
   * Crée une demande à la communauté.
   *
   * Le `zone` (anciennement texte libre) est dérivé de la localisation du
   * caller — `User.city + postalCode`. Le matching :
   *   1. Owners dans rayon (Haversine SQL).
   *   2. Filtre `Object.name`/`Object.author` ILIKE %title%.
   *   3. Notification `COMMUNITY_REQUEST` par owner matché.
   *
   * Throw BAD_REQUEST si l'auteur n'a pas encore complété sa localisation.
   */
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(3).max(100),
        description: z.string().max(500).optional(),
        radiusKm: z.union([
          z.literal(5),
          z.literal(10),
          z.literal(25),
          z.literal(50),
          z.literal(100),
        ]).default(25),
        expiresAt: z.string().datetime().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.session.user.id;

      const author = await ctx.prisma.user.findUnique({
        where: { id: authorId },
        select: { country: true, postalCode: true, city: true, lat: true, lng: true },
      });

      if (!author?.lat || !author.lng || !author.postalCode) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Veuillez compléter votre localisation avant de poster une demande.",
        });
      }

      const zone = author.city
        ? `${author.city} (${author.postalCode})`
        : author.postalCode;

      const request = await ctx.prisma.communityRequest.create({
        data: {
          authorId,
          title: input.title,
          description: input.description,
          zone,
          expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
        },
        include: {
          author: { select: { id: true, name: true, image: true, handle: true } },
        },
      });

      // Matching : objets dans rayon dont name/author ILIKE title
      const likePattern = `%${escapeLikePattern(input.title)}%`;
      const radiusFilter = haversineSql(author.lat, author.lng, input.radiusKm);

      const matches = await ctx.prisma.$queryRaw<MatchRow[]>(Prisma.sql`
        SELECT
          o."id"   AS "objectId",
          o."name" AS "objectName",
          u."id"   AS "ownerId",
          u."lat"  AS "ownerLat",
          u."lng"  AS "ownerLng"
        FROM "objects" o
        JOIN "collections" c ON o."collectionId" = c."id"
        JOIN "users" u       ON c."userId" = u."id"
        WHERE u."id" <> ${authorId}
          AND u."lat" IS NOT NULL
          AND u."lng" IS NOT NULL
          AND (o."name" ILIKE ${likePattern} OR o."author" ILIKE ${likePattern})
          AND ${radiusFilter}
        LIMIT 200
      `);

      if (matches.length > 0) {
        await ctx.prisma.notification.createMany({
          data: matches.map((m) => ({
            userId: m.ownerId,
            type: "COMMUNITY_REQUEST" as const,
            title: "Un voisin recherche un objet",
            message: `${request.author.name ?? "Quelqu'un"} cherche "${input.title}" près de chez vous (≈ ${Math.round(
              haversineKm(author.lat!, author.lng!, m.ownerLat, m.ownerLng),
            )} km). Vous avez "${m.objectName}".`,
            relatedId: request.id,
            relatedType: "request",
          })),
        });
      }

      return { request, matchCount: matches.length };
    }),

  /**
   * Liste les demandes (filtres optionnels).
   */
  list: publicProcedure
    .input(
      z.object({
        status: z.enum(["OPEN", "FULFILLED", "CANCELLED", "EXPIRED"]).optional(),
        zone: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(50).default(20),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: {
        status?: "OPEN" | "FULFILLED" | "CANCELLED" | "EXPIRED";
        zone?: { contains: string; mode: "insensitive" };
        OR?: Array<{ title?: { contains: string; mode: "insensitive" }; description?: { contains: string; mode: "insensitive" } }>;
      } = {};

      if (input.status) {
        where.status = input.status;
      } else {
        where.status = "OPEN";
      }

      if (input.zone) {
        where.zone = { contains: input.zone, mode: "insensitive" };
      }

      if (input.search) {
        where.OR = [
          { title: { contains: input.search, mode: "insensitive" } },
          { description: { contains: input.search, mode: "insensitive" } },
        ];
      }

      const requests = await ctx.prisma.communityRequest.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, handle: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
      });

      const hasMore = requests.length > input.limit;
      const items = hasMore ? requests.slice(0, -1) : requests;
      const nextCursor = hasMore ? items[items.length - 1]?.id : null;

      return {
        items,
        nextCursor: nextCursor ?? undefined,
      };
    }),

  /**
   * Récupère une demande par ID.
   */
  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const request = await ctx.prisma.communityRequest.findUnique({
        where: { id: input.id },
        include: {
          author: { select: { id: true, name: true, handle: true, image: true } },
          fulfillBy: { select: { id: true, title: true } },
        },
      });

      if (!request) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Demande introuvable" });
      }

      return request;
    }),

  /**
   * Annule une demande (auteur uniquement).
   */
  cancel: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.session.user.id;

      const request = await ctx.prisma.communityRequest.findUnique({
        where: { id: input.id },
      });

      if (!request) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Demande introuvable" });
      }

      if (request.authorId !== authorId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Vous ne pouvez annuler que vos propres demandes.",
        });
      }

      if (request.status !== "OPEN") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Seules les demandes ouvertes peuvent être annulées.",
        });
      }

      const updated = await ctx.prisma.communityRequest.update({
        where: { id: input.id },
        data: { status: "CANCELLED" },
      });

      return updated;
    }),

  /**
   * Marque une demande comme fulfill (répondue par un owner).
   */
  fulfill: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        fulfillByRequestId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const request = await ctx.prisma.communityRequest.findUnique({
        where: { id: input.id },
      });

      if (!request) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Demande introuvable" });
      }

      if (request.status !== "OPEN") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Seules les demandes ouvertes peuvent être fulfill.",
        });
      }

      const updated = await ctx.prisma.communityRequest.update({
        where: { id: input.id },
        data: {
          status: "FULFILLED",
          fulfillByRequestId: input.fulfillByRequestId,
        },
      });

      // Notification à l'auteur de la demande
      if (request.authorId !== ctx.session.user.id) {
        await ctx.prisma.notification.create({
          data: {
            userId: request.authorId,
            type: "REQUEST_FULFILLED",
            title: "Votre demande a été traitée",
            message: `Quelqu'un a répondu à votre demande: "${request.title}"`,
            relatedId: request.id,
            relatedType: "request",
          },
        });
      }

      return updated;
    }),

  /**
   * Liste les demandes de l'utilisateur courant.
   */
  myRequests: protectedProcedure.query(async ({ ctx }) => {
    const authorId = ctx.session.user.id;

    const requests = await ctx.prisma.communityRequest.findMany({
      where: { authorId },
      orderBy: { createdAt: "desc" },
    });

    return requests;
  }),
});
