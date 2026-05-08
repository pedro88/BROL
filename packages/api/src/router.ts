/**
 * Router principal de l'API Brol.
 * @package @brol/api
 */

import { router, publicProcedure } from "./trpc";
import { collectionsRouter } from "./routers/collections";
import { objectsRouter } from "./routers/objects";
import { loansRouter } from "./routers/loans";
import { contactsRouter } from "./routers/contacts";
import { qrRouter } from "./routers/qr";
import { auth } from "./auth";

/**
 * Auth router — public endpoints for session management.
 */
const authRouter = router({
  /**
   * Get current session.
   * Public: returns null for anonymous users, session+user when logged in.
   */
  me: publicProcedure.query(async ({ ctx }) => {
    const session = await auth.api.getSession({
      headers: { cookie: ctx.headers["cookie"] ?? "" },
    });
    return {
      sessionToken: session?.session?.token ?? null,
      user: session?.user ?? null,
    };
  }),
});

/**
 * Router racine de l'application.
 * Organisé par domaine fonctionnel.
 */
export const appRouter = router({
  auth: authRouter,
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
