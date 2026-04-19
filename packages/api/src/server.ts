/**
 * Point d'entrée du serveur API Brol.
 * Utilise tRPC + BetterAuth sur un serveur HTTP Node.js.
 *
 * @package @brol/api
 */

import { createServer, IncomingMessage } from "http";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth";
import { appRouter } from "./router";
import { createContext } from "./trpc";

/**
 * Configuration du port.
 */
const PORT = process.env.PORT || 3001;

/**
 * API base URL for constructing absolute request URLs.
 */
const API_BASE_URL =
  process.env.API_URL ??
  `http://localhost:${PORT}`;

/**
 * Convert a Node.js IncomingMessage to a fetch Request object.
 */
function nodeToRequest(req: IncomingMessage): Request {
  const protocol = req.socket.encrypted ? "https" : "http";
  const host = req.headers.host ?? `localhost:${PORT}`;
  const url = `${protocol}://${host}${req.url}`;
  return new Request(url, {
    method: req.method,
    headers: req.headers as Record<string, string>,
  });
}

/**
 * BetterAuth handler — converts IncomingMessage to fetch Request.
 */
const betterAuthHandler = toNodeHandler(auth);

/**
 * tRPC request handler.
 */
async function handleTrpc(req: IncomingMessage, res: { statusCode: number; setHeader: (k: string, v: string) => void; end: (data?: string) => void }) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    res.end();
    return;
  }

  const fetchReq = nodeToRequest(req);

  await fetchRequestHandler({
    router: appRouter,
    createContext,
    endpoint: "/api/trpc",
    req: fetchReq,
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
}

/**
 * Main request handler — routes to BetterAuth or tRPC.
 */
function handler(req: IncomingMessage, res: { statusCode: number; setHeader: (k: string, v: string) => void; end: (data?: string) => void }) {
  const pathname = req.url?.split("?")[0] ?? "";

  // BetterAuth handles /api/auth/*
  if (pathname.startsWith("/api/auth")) {
    betterAuthHandler(req, res);
    return;
  }

  // tRPC handles /api/trpc/*
  handleTrpc(req, res);
}

/**
 * Création du serveur HTTP.
 */
const server = createServer(handler);

/**
 * Démarrage du serveur.
 */
server.listen(PORT, () => {
  console.log(`🚀 API Brol running on ${API_BASE_URL}`);
  console.log(`📡 tRPC endpoint: ${API_BASE_URL}/api/trpc`);
  console.log(`🔑 Auth endpoint: ${API_BASE_URL}/api/auth`);
});