/**
 * Point d'entrée du package API Brol.
 * @package @brol/api
 */

export { appRouter, type AppRouter } from "./router";
export { router, publicProcedure, protectedProcedure, type Context } from "./trpc";
