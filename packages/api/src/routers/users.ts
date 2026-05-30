/**
 * Router Users - Recherche et lookup d'utilisateurs Brol.
 * @package @brol/api
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";
import { router, protectedProcedure } from "../trpc";

const HANDLE_REGEX = /^[a-z0-9]{3,20}$/;
const RESERVED_HANDLES = new Set([
  "admin",
  "administrator",
  "root",
  "api",
  "auth",
  "settings",
  "profile",
  "profiles",
  "user",
  "users",
  "brol",
  "support",
  "help",
  "system",
  "null",
  "undefined",
]);

function normalizeHandle(input: string): string {
  return input.trim().replace(/^#/, "").toLowerCase();
}

type HandleCheckReason = "taken" | "reserved" | "invalid";

function validateHandleFormat(handle: string): HandleCheckReason | null {
  if (!HANDLE_REGEX.test(handle)) return "invalid";
  if (RESERVED_HANDLES.has(handle)) return "reserved";
  return null;
}

export const usersRouter = router({
  /**
   * Recherche des utilisateurs par nom ou email.
   * Utilisé pour le sélectionneur d'emprunteur dans la modal de prêt.
   */
  search: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1).max(255),
      })
    )
    .query(async ({ ctx, input }) => {
      const { query } = input;
      const q = query.trim();

      const users = await ctx.prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { handle: { contains: q.replace(/^#/, "").toLowerCase(), mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          handle: true,
          name: true,
          email: true,
          image: true,
          profile: {
            select: {
              avatarUrl: true,
            },
          },
        },
        take: 20,
      });

      return users.map((user) => ({
        id: user.id,
        handle: user.handle,
        name: user.name,
        email: user.email,
        image: user.image,
        avatarUrl: user.profile?.avatarUrl,
      }));
    }),

  /**
   * Récupère un utilisateur par son ID (cuid) ou son handle.
   * Accepte: cuid brut, handle brut ("piet1234"), ou handle préfixé ("#piet1234").
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const raw = input.id.trim();
      const handleCandidate = raw.replace(/^#/, "").toLowerCase();

      const user = await ctx.prisma.user.findFirst({
        where: {
          OR: [{ id: raw }, { handle: handleCandidate }],
        },
        select: {
          id: true,
          handle: true,
          name: true,
          email: true,
          image: true,
          profile: {
            select: {
              avatarUrl: true,
            },
          },
        },
      });

      if (!user) {
        return null;
      }

      return {
        id: user.id,
        handle: user.handle,
        name: user.name,
        email: user.email,
        image: user.image,
        avatarUrl: user.profile?.avatarUrl,
      };
    }),

  /**
   * Récupère un utilisateur par son handle public ("piet1234").
   * Tolère le préfixe "#" optionnel.
   */
  getByHandle: protectedProcedure
    .input(z.object({ handle: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const handle = input.handle.trim().replace(/^#/, "").toLowerCase();

      const user = await ctx.prisma.user.findUnique({
        where: { handle },
        select: {
          id: true,
          handle: true,
          name: true,
          email: true,
          image: true,
          profile: {
            select: {
              avatarUrl: true,
            },
          },
        },
      });

      if (!user) return null;

      return {
        id: user.id,
        handle: user.handle,
        name: user.name,
        email: user.email,
        image: user.image,
        avatarUrl: user.profile?.avatarUrl,
      };
    }),

  /**
   * Récupère le handle de l'utilisateur authentifié.
   * Utilisé par les pages de profil/settings pour afficher le QR.
   */
  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.userId },
      select: { id: true, handle: true, name: true, email: true, image: true },
    });
    return user;
  }),

  /**
   * Vérifie la disponibilité d'un handle pour pré-check UI.
   * Retourne { available, reason? } où reason indique pourquoi indisponible.
   * Le handle de l'utilisateur courant est traité comme "available" (no-op).
   */
  checkHandleAvailability: protectedProcedure
    .input(z.object({ handle: z.string().min(1).max(64) }))
    .query(async ({ ctx, input }) => {
      const handle = normalizeHandle(input.handle);
      const formatError = validateHandleFormat(handle);
      if (formatError) return { available: false, reason: formatError };

      const existing = await ctx.prisma.user.findUnique({
        where: { handle },
        select: { id: true },
      });

      if (!existing || existing.id === ctx.userId) {
        return { available: true };
      }
      return { available: false, reason: "taken" as const };
    }),

  /**
   * Met à jour le handle de l'utilisateur courant.
   * Format strict : 3-20 chars alphanumériques minuscules. Liste de réservés bloquée.
   * Erreur CONFLICT si quelqu'un d'autre prend le handle entre check et update (race).
   */
  updateHandle: protectedProcedure
    .input(z.object({ handle: z.string().min(1).max(64) }))
    .mutation(async ({ ctx, input }) => {
      const handle = normalizeHandle(input.handle);
      const formatError = validateHandleFormat(handle);
      if (formatError === "invalid") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Le pseudo doit faire 3 à 20 caractères, lettres minuscules et chiffres uniquement.",
        });
      }
      if (formatError === "reserved") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Ce pseudo est réservé.",
        });
      }

      try {
        const updated = await ctx.prisma.user.update({
          where: { id: ctx.userId },
          data: { handle },
          select: { id: true, handle: true },
        });
        return updated;
      } catch (err) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === "P2002"
        ) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Ce pseudo est déjà utilisé.",
          });
        }
        throw err;
      }
    }),
});

export type UsersRouter = typeof usersRouter;