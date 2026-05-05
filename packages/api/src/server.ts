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
import { prisma } from "@brol/db";

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
 * Collect body chunks from an IncomingMessage and return them as a Buffer.
 */
function collectBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", () => resolve(Buffer.alloc(0)));
  });
}

/**
 * Convert a Node.js IncomingMessage to a fetch Request object (no body — unused, kept for reference).
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
 * tRPC request handler — collects body first, then forwards to tRPC.
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

  // Collect body before building the fetch Request (needed for POST/PUT/PATCH)
  const bodyBuffer = await collectBody(req);
  const bodyStr = bodyBuffer.toString("utf-8");

  const protocol = req.socket.encrypted ? "https" : "http";
  const host = req.headers.host ?? `localhost:${PORT}`;
  const url = `${protocol}://${host}${req.url}`;

  // Create body as ReadableStream for fetch Request
  const bodyStream = bodyBuffer.length > 0
    ? new ReadableStream({
        start(controller) {
          controller.enqueue(new Uint8Array(bodyBuffer));
          controller.close();
        },
      })
    : undefined;

  const fetchReq = new Request(url, {
    method: req.method,
    headers: req.headers as Record<string, string>,
    body: bodyStream,
    duplex: "half",
  });

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
 * Get the most recent session token for a user email.
 */
async function handleGetToken(email: string): Promise<{ token: string | null }> {
  const session = await prisma.session.findFirst({
    where: { user: { email } },
    orderBy: { createdAt: "desc" },
  });
  return { token: session?.token ?? null };
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

  // Test helpers (e2e cleanup) — only in development
  if (pathname === "/api/test/cleanup-user" && req.method === "POST") {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    let body = "";
    req.on("data", (chunk: Buffer) => { body += chunk.toString(); });
    req.on("end", async () => {
      try {
        const { email }: { email: string } = JSON.parse(body);
        await prisma.account.deleteMany({ where: { user: { email } } });
        await prisma.user.deleteMany({ where: { email } });
        res.statusCode = 200;
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: String(e) }));
      }
    });
    req.on("error", () => { res.statusCode = 500; res.end('{"error":"request error"}'); });
    return;
  }

  if (pathname.startsWith("/api/test/get-token") && req.method === "GET") {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    const url = new URL(req.url ?? "", `http://localhost:${PORT}`);
    const email = url.searchParams.get("email");
    if (!email) { res.statusCode = 400; res.end(JSON.stringify({ error: "email required" })); return; }
    // eslint-disable-next-line @typescript-eslint/no-floating-promise-declaration
    handleGetToken(email).then(({ token }) => {
      res.statusCode = 200;
      res.end(JSON.stringify({ token }));
    }).catch((e) => {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: String(e) }));
    });
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