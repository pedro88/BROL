/**
 * Configuration tRPC pour le backend Brol.
 * @package @brol/api
 */

import { initTRPC, TRPCError } from "@trpc/server";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { prisma } from "@brol/db";
import { getSession } from "../auth";
import {
  trpcReadLimiter,
  trpcMutationLimiter,
  getClientIp,
} from "../lib/rate-limit";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@brol/shared";

/**
 * Type pour le context de la requête.
 */
export interface Context {
  prisma: typeof prisma;
  userId: string | null;
  session: { user: { id: string } } | null;
  /** Raw request headers (lowercase keys) for auth helpers */
  headers: Record<string, string>;
  /** Locale résolue (header `x-locale` → défaut fr) pour les messages serveur. */
  locale: Locale;
}

/**
 * Création du context pour chaque requête (fetch adapter).
 * Intègre BetterAuth pour récupérer le userId depuis les cookies/session.
 * getSession already checks both cookies AND Bearer token (see auth.ts).
 */
export async function createContext(opts: FetchCreateContextFnOptions): Promise<Context> {
  const session = await getSession(opts.req);

  // Build headers object from request for use in procedures
  const headers: Record<string, string> = {};
  opts.req.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value;
  });

  // Locale depuis l'en-tête `x-locale` posé par les clients (web cookie /
  // mobile i18n). Fallback fr. (On évite un lookup DB ici — les emails, eux,
  // utilisent la locale persistée du destinataire.)
  const headerLocale = headers["x-locale"];
  const locale = isLocale(headerLocale) ? headerLocale : DEFAULT_LOCALE;

  return {
    prisma,
    userId: session?.user?.id ?? null,
    session,
    headers,
    locale,
  };
}

/**
 * Initialisation de tRPC avec les plugins nécessaires.
 */
const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof Error ? error.cause.message : null,
      },
    };
  },
});

/**
 * Sliding-window rate limit on every tRPC call.
 *
 * Keys: prefer `user:<id>` (one bucket per account, fair across devices)
 * and fall back to `ip:<addr>` for unauthenticated traffic. Health
 * endpoint is skipped (ops/LB need to poll it freely).
 *
 * Reads use the read bucket (60/min), mutations the write bucket
 * (20/min) — both per the strict policy decided in rev 4 audit.
 *
 * Skipped in Vitest (unit tests use `appRouter.createCaller` which
 * still goes through middleware, and the limit would break tests that
 * perform many mutations in a row). E2E tests (`pnpm test:e2e`) go
 * through the real HTTP adapter and DO exercise the limiter — see
 * `apps/web/e2e/helpers/auth.ts` for the dedicated suite when added.
 */
const rateLimitMiddleware = t.middleware(async ({ ctx, path, type, next }) => {
  if (path === "health") return next();
  if (process.env.VITEST === "true") return next();

  const limiter = type === "mutation" ? trpcMutationLimiter : trpcReadLimiter;
  const key = ctx.userId
    ? `user:${ctx.userId}`
    : `ip:${getClientIp(ctx.headers)}`;

  const result = limiter.check(key);
  if (!result.allowed) {
    const retryAfterSec = Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000));
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "Trop de requêtes. Réessayez dans quelques secondes.",
    });
  }
  return next({ ctx });
});

/**
 * Créateur de procédure tRPC publique (sans auth requise).
 * Includes the global rate-limit middleware.
 */
export const publicProcedure = t.procedure.use(rateLimitMiddleware);

/**
 * Créateur de procédure tRPC protégée (auth requise).
 * Includes the global rate-limit middleware.
 */
export const protectedProcedure = publicProcedure.use(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Vous devez être connecté pour accéder à cette ressource.",
    });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session!,
      userId: ctx.userId,
    },
  });
});

/**
 * Export du router et des types.
 */
export const router = t.router;
export type Router = typeof router;
export { TRPCError };