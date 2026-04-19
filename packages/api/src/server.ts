/**
 * Point d'entrée du serveur API Brol.
 * Utilise tRPC avec un adaptateur HTTP standard (Node.js).
 *
 * @package @brol/api
 *
 * @decisions Serveur standalone pour le développement.
 * En production, l'API sera déployée comme serverless functions (Vercel).
 */

import { createServer } from "http";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./trpc";

/**
 * Configuration du port.
 */
const PORT = process.env.PORT || 3001;

/**
 * Créateur du handler HTTP pour tRPC.
 */
const handler = (req: Request, res: { statusCode: number; setHeader: (k: string, v: string) => void; end: (data?: string) => void }) => {
  // CORS headers basiques
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    res.end();
    return;
  }

  // Delegate à tRPC via le fetch adapter
  fetchRequestHandler({
    router: appRouter,
    createContext,
    endpoint: "/api/trpc",
    req,
    onError:
      process.env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(`tRPC error on ${path ?? "<no-path>"}:`, error);
          }
        : undefined,
  }).then((r) => {
    res.statusCode = r.status;
    r.headers.forEach((value: string, key: string) => {
      res.setHeader(key, value);
    });
    r.text().then((body: string) => {
      res.end(body);
    });
  });
};

/**
 * Création du serveur HTTP.
 */
const server = createServer((req, res) => {
  handler(req as unknown as Request, res);
});

/**
 * Démarrage du serveur.
 */
server.listen(PORT, () => {
  console.log(`🚀 API Brol running on http://localhost:${PORT}`);
  console.log(`📡 tRPC endpoint: http://localhost:${PORT}/api/trpc`);
});
