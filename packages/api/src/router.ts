/**
 * Router principal de l'API Brol.
 * @package @brol/api
 */

import { router } from "./trpc";
import { collectionsRouter } from "./routers/collections";
import { objectsRouter } from "./routers/objects";
import { loansRouter } from "./routers/loans";
import { contactsRouter } from "./routers/contacts";
import { qrRouter } from "./routers/qr";
import { publicProcedure } from "./trpc";

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
   * Endpoint de santé pour vérifier que l'API est alive.
   */
  health: publicProcedure.query(() => {
    return { status: "ok", timestamp: new Date().toISOString() };
  }),
});

/**
 * Type du router pour les clients tRPC.
 */
export type AppRouter = typeof appRouter;
