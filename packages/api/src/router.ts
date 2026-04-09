/**
 * Router principal de l'API Brol.
 * @package @brol/api
 */

import { router, publicProcedure, dbProcedure, connectPrisma, getDbStatus, isDbConnected } from "./trpc";
import { collectionsRouter } from "./routers/collections";
import { objectsRouter } from "./routers/objects";
import { loansRouter } from "./routers/loans";
import { contactsRouter } from "./routers/contacts";
import { qrRouter } from "./routers/qr";

/**
 * Router racine de l'application.
 * Organisé par domaine fonctionnel.
 */
export const appRouter = router({
  collections: collectionsRouter,
  objects: objectsRouter,
  loans: loansRouter,
  contacts: contactsRouter,
  qr: qrRouter,

  /**
   * Health check basique - fonctionne même sans DB.
   */
  health: publicProcedure.query(() => {
    return { 
      status: "ok", 
      timestamp: new Date().toISOString(),
      service: "brol-api"
    };
  }),

  /**
   * Health check complet - vérifie la connexion DB.
   * Utilise dbProcedure car il a besoin de la DB.
   */
  healthDb: dbProcedure.query(async ({ ctx }) => {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "brol-api",
      database: "connected"
    };
  }),

  /**
   * DB status - retourne l'état de la connexion sans lever d'erreur.
   */
  dbStatus: publicProcedure.query(async () => {
    const dbStatus = await getDbStatus();
    return dbStatus;
  }),

  /**
   * Tentative de reconnexion à la DB.
   */
  dbReconnect: publicProcedure.mutation(async () => {
    const connected = await connectPrisma();
    return { 
      success: connected,
      message: connected ? "Database reconnected" : "Failed to reconnect to database"
    };
  }),
});

/**
 * Type du router pour les clients tRPC.
 */
export type AppRouter = typeof appRouter;
