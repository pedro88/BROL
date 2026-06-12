/**
 * Community Request router — demandes à la communauté pour emprunter.
 * @package @brol/api
 */

import { router, protectedProcedure, publicProcedure } from "../trpc";
import { translate } from "@brol/shared";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";
import { haversineSql, haversineKm } from "../lib/geo";
import { logger } from "../lib/logger";
import { pageOf } from "../lib/pagination";
import { syncUserBadges } from "../lib/badge-service";

const log = logger.child("communityRequest");

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
          message: translate(ctx.locale, "errors.locationIncomplete"),
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

      log.info("community request matching", {
        requestId: request.id,
        authorId,
        title: input.title,
        radiusKm: input.radiusKm,
        authorLat: author.lat,
        authorLng: author.lng,
        matchCount: matches.length,
      });

      if (matches.length > 0) {
        await ctx.prisma.notification.createMany({
          data: matches.map((m) => ({
            userId: m.ownerId,
            type: "COMMUNITY_REQUEST" as const,
            title: translate(ctx.locale, "notifications.communityRequestTitle"),
            message: translate(ctx.locale, "notifications.communityRequestMessage", {
              requesterName: request.author.name ?? "Quelqu'un",
              searchTitle: input.title,
              distance: Math.round(
                haversineKm(author.lat!, author.lng!, m.ownerLat, m.ownerLng),
              ),
              matchObjectName: m.objectName,
            }),
            relatedId: request.id,
            relatedType: "request",
          })),
        });
      }

      await syncUserBadges(ctx.prisma, authorId);

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

      return pageOf(requests, input.limit);
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
        throw new TRPCError({ code: "NOT_FOUND", message: translate(ctx.locale, "errors.requestNotFound") });
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
        throw new TRPCError({ code: "NOT_FOUND", message: translate(ctx.locale, "errors.requestNotFound") });
      }

      if (request.authorId !== authorId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: translate(ctx.locale, "errors.canOnlyCancelOwnRequest"),
        });
      }

      if (request.status !== "OPEN") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: translate(ctx.locale, "errors.onlyOpenRequestsCanBeCancelled"),
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
        throw new TRPCError({ code: "NOT_FOUND", message: translate(ctx.locale, "errors.requestNotFound") });
      }

      if (request.status !== "OPEN") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: translate(ctx.locale, "errors.onlyOpenRequestsCanBeFulfilled"),
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
            title: translate(ctx.locale, "notifications.requestFulfilledTitle"),
            message: translate(ctx.locale, "notifications.requestFulfilledMessage", {
              requestTitle: request.title,
            }),
            relatedId: request.id,
            relatedType: "request",
          },
        });
      }

      await syncUserBadges(ctx.prisma, ctx.session.user.id);

      return updated;
    }),

  /**
   * Liste les demandes de l'utilisateur courant + compteurs de messages
   * non-lus par demande (utile pour le dashboard "Mes demandes").
   */
  myRequests: protectedProcedure.query(async ({ ctx }) => {
    const authorId = ctx.session.user.id;

    const requests = await ctx.prisma.communityRequest.findMany({
      where: { authorId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { messages: true } },
      },
    });

    const unreadByRequest = await ctx.prisma.requestMessage.groupBy({
      by: ["requestId"],
      where: { toUserId: authorId, isRead: false },
      _count: { _all: true },
    });
    const unreadMap = new Map<string, number>(
      unreadByRequest.map((row) => [row.requestId, row._count._all]),
    );

    return requests.map((r) => ({
      ...r,
      messageCount: r._count.messages,
      unreadCount: unreadMap.get(r.id) ?? 0,
    }));
  }),
});
