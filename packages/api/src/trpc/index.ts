/**
 * Configuration tRPC pour le backend Brol.
 * @package @brol/api
 */

import { initTRPC, TRPCError } from "@trpc/server";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import superjson from "superjson";
import { getLazyPrisma, isDbConnected, connectPrisma, getDbStatus } from "@brol/db";

/**
 * Type pour le context de la requête.
 */
export interface Context {
  prisma: ReturnType<typeof getLazyPrisma>;
  userId: string | null;
  dbAvailable: boolean;
}

/**
 * Création du context pour chaque requête (fetch adapter).
 */
export async function createContext(opts: FetchCreateContextFnOptions): Promise<Context> {
  // TODO: Intégrer BetterAuth pour récupérer le userId depuis les cookies/session
  // Pour l'instant, on retourne null (non authentifié)
  
  // Vérifie si la DB est accessible (sans se connecter)
  let dbAvailable = false;
  try {
    dbAvailable = await isDbConnected();
  } catch {
    // Ignore - on vérifiera à la première requête
  }

  return {
    prisma: getLazyPrisma(),
    userId: null,
    dbAvailable,
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
 * Créateur de procédure tRPC nécessitant la DB.
 * Throw une erreur INTERNAL_SERVER_ERROR si la DB n'est pas disponible.
 */
export const dbProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.dbAvailable) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Base de données temporairement indisponible",
    });
  }
  return next({ ctx });
});

/**
 * Export du router et des types.
 */
export const router = t.router;
export type Router = typeof router;
export { connectPrisma, getDbStatus, isDbConnected };
