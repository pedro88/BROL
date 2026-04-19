/**
 * Configuration tRPC pour le backend Brol.
 * @package @brol/api
 */

import { initTRPC, TRPCError } from "@trpc/server";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import superjson from "superjson";
import { prisma } from "@brol/db";

/**
 * Type pour le context de la requête.
 */
export interface Context {
  prisma: typeof prisma;
  userId: string | null;
}

/**
 * Création du context pour chaque requête (fetch adapter).
 */
export async function createContext(opts: FetchCreateContextFnOptions): Promise<Context> {
  // TODO: Intégrer BetterAuth pour récupérer le userId depuis les cookies/session
  // Pour l'instant, on retourne null (non authentifié)

  return {
    prisma,
    userId: null,
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
