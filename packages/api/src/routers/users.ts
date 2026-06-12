/**
 * Router Users - Recherche et lookup d'utilisateurs Brol.
 * @package @brol/api
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";
import { router, protectedProcedure } from "../trpc";
import { geocodePostalCode } from "../lib/geo";
import { LOCALES, THEMES, translate } from "@brol/shared";

const COUNTRY_REGEX = /^[A-Z]{2}$/;
const POSTAL_CODE_REGEX = /^[A-Za-z0-9 -]{3,10}$/;

const locationInput = z.object({
  country: z
    .string()
    .trim()
    .toUpperCase()
    .regex(COUNTRY_REGEX, "Code pays invalide (ISO-3166 alpha-2 attendu)"),
  postalCode: z
    .string()
    .trim()
    .regex(POSTAL_CODE_REGEX, "Code postal invalide"),
});

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
              publicEmail: true,
            },
          },
        },
      });

      if (!user) {
        return null;
      }

      // Privacy : l'email ne sort que si l'utilisateur l'a rendu public
      // (Profile.publicEmail) ou si on se lookup soi-même. Sinon l'endpoint
      // permettrait d'énumérer les emails par handle.
      const emailVisible = user.id === ctx.userId || user.profile?.publicEmail === true;

      return {
        id: user.id,
        handle: user.handle,
        name: user.name,
        email: emailVisible ? user.email : null,
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
              publicEmail: true,
            },
          },
        },
      });

      if (!user) return null;

      // Privacy : l'email ne sort que si l'utilisateur l'a rendu public
      // (Profile.publicEmail) ou si on se lookup soi-même. Sinon l'endpoint
      // permettrait d'énumérer les emails par handle.
      const emailVisible = user.id === ctx.userId || user.profile?.publicEmail === true;

      return {
        id: user.id,
        handle: user.handle,
        name: user.name,
        email: emailVisible ? user.email : null,
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
      select: {
        id: true,
        handle: true,
        name: true,
        email: true,
        image: true,
        country: true,
        postalCode: true,
        city: true,
        locale: true,
        theme: true,
      },
    });
    return user;
  }),

  /**
   * Met à jour la langue préférée de l'utilisateur (fr/nl/en).
   * Persiste le choix du switcher et sert à localiser les emails.
   */
  updateLocale: protectedProcedure
    .input(z.object({ locale: z.enum(LOCALES) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.user.update({
        where: { id: ctx.userId },
        data: { locale: input.locale },
      });
      return { success: true, locale: input.locale };
    }),

  /**
   * Met à jour le thème graphique préféré de l'utilisateur. Persiste le choix
   * du sélecteur (page Paramètres) pour qu'il suive l'utilisateur entre
   * appareils. "magenta" = défaut → stocké en null.
   */
  updateTheme: protectedProcedure
    .input(z.object({ theme: z.enum(THEMES) }))
    .mutation(async ({ ctx, input }) => {
      const theme = input.theme === "magenta" ? null : input.theme;
      await ctx.prisma.user.update({
        where: { id: ctx.userId },
        data: { theme },
      });
      return { success: true, theme: input.theme };
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
   *
   * **Désactivé depuis 2026-05-31** — le handle est utilisé dans des URLs
   * publiques (`/profile/[handle]`) et dans les QR codes partagés. Permettre
   * sa modification cassait les liens partagés et ouvrait la porte à
   * l'impersonation d'un handle libéré.
   *
   * Le handle est attribué une fois pour toutes au signup (cf. `auth.ts`
   * databaseHooks via `generateHandle`). Pour le débloquer plus tard (ex:
   * un changement unique avec audit), retirer le throw et rajouter une
   * colonne `handleChangedAt`. Le UI settings n'expose plus de bouton
   * "Modifier".
   */
  updateHandle: protectedProcedure
    .input(z.object({ handle: z.string().min(1).max(64) }))
    .mutation(async ({ ctx }) => {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: translate(ctx.locale, "errors.handleImmutable"),
      });
    }),

  /**
   * Preview une localisation (CP → ville/coords) sans persister.
   * Sert au feedback live UI (debounce 400ms côté frontend).
   * Retourne null si CP inconnu.
   */
  previewLocation: protectedProcedure
    .input(locationInput)
    .query(async ({ input }) => {
      return geocodePostalCode(input.country, input.postalCode);
    }),

  /**
   * Met à jour la localisation de l'utilisateur courant.
   * Appelle l'API Zippopotam pour résoudre CP → ville/lat/lng et persiste
   * le résultat sur User. Throw BAD_REQUEST si CP inconnu.
   */
  updateLocation: protectedProcedure
    .input(locationInput)
    .mutation(async ({ ctx, input }) => {
      const result = await geocodePostalCode(input.country, input.postalCode);
      if (!result) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: translate(ctx.locale, "errors.postalCodeUnknown"),
        });
      }
      const updated = await ctx.prisma.user.update({
        where: { id: ctx.userId },
        data: {
          country: input.country,
          postalCode: input.postalCode,
          city: result.city,
          lat: result.lat,
          lng: result.lng,
        },
        select: {
          id: true,
          country: true,
          postalCode: true,
          city: true,
          lat: true,
          lng: true,
        },
      });
      return updated;
    }),
});

export type UsersRouter = typeof usersRouter;