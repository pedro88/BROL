/**
 * Point d'entrée du serveur API Brol.
 * Utilise tRPC avec l'adaptateur standalone (HTTP standard Node.js).
 *
 * @package @brol/api
 *
 * @decisions Serveur standalone pour le développement.
 * En production, l'API sera déployée comme serverless functions (Vercel).
 */

import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { appRouter } from "./router";
import { createContext } from "./trpc";
import type { IncomingMessage, ServerResponse } from "http";

/**
 * Configuration du port.
 */
const PORT = process.env.PORT || 3001;

/**
 * Headers CORS pour permettre les requêtes depuis le frontend.
 */
function setCorsHeaders(req: IncomingMessage, res: ServerResponse) {
  const origin = req.headers.origin;
  res.setHeader("Access-Control-Allow-Origin", origin || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
}

/**
 * Création du serveur HTTP avec tRPC.
 */
const server = createHTTPServer({
  router: appRouter,
  createContext,
  onError:
    process.env.NODE_ENV === "development"
      ? ({ path, error }: { path: string | undefined; error: Error }) => {
          console.error(`tRPC error on ${path ?? "<no-path>"}:`, error.message);
        }
      : undefined,
  middleware: (req, res, next) => {
    setCorsHeaders(req, res);
    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }
    next();
  },
});

/**
 * Démarrage du serveur.
 */
server.listen(PORT, () => {
  console.log(`🚀 API Brol running on http://localhost:${PORT}`);
  console.log(`📡 tRPC endpoint: http://localhost:${PORT}/api/trpc`);
});
