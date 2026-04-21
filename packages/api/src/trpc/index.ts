/**
 * Configuration tRPC pour le backend Brol.
 * @package @brol/api
 */

import { initTRPC, TRPCError } from "@trpc/server";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import superjson from "superjson";
import { prisma } from "@brol/db";
import { getSession } from "../auth";

/**
 * Type pour le context de la requête.
 */
export interface Context {
  prisma: typeof prisma;
  userId: string | null;
  /** Raw request headers (lowercase keys) for auth helpers */
  headers: Record<string, string>;
}

/**
 * Création du context pour chaque requête (fetch adapter).
 * Intègre BetterAuth pour récupérer le userId depuis les cookies/session.
 */
export async function createContext(opts: FetchCreateContextFnOptions): Promise<Context> {
  const session = await getSession(opts.req);

  // Build headers object from request for use in procedures
  const headers: Record<string, string> = {};
  opts.req.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value;
  });

  return {
    prisma,
    userId: session?.user?.id ?? null,
    headers,
  };
}

/**
 * Initialisation de tRPC avec les plugins nécessaires.
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
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
 * Créateur de procédure tRPC publique (sans auth requise).
 */
export const publicProcedure = t.procedure;

/**
 * Créateur de procédure tRPC protégée (auth requise).
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Vous devez être connecté pour accéder à cette ressource.",
    });
  }
  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
    },
  });
});

/**
 * Export du router et des types.
 */
export const router = t.router;
export type Router = typeof router;