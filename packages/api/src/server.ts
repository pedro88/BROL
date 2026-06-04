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
import { logger } from "./lib/logger";
import { signInLimiter, getClientIp } from "./lib/rate-limit";

const log = logger.child("server");

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

type Res = {
  statusCode: number;
  setHeader: (k: string, v: string) => void;
  end: (data?: string) => void;
};

/**
 * BetterAuth handler — converts IncomingMessage to fetch Request.
 */
const betterAuthHandler = toNodeHandler(auth);

/**
 * Sign-in endpoint paths guarded by the in-memory rate limiter.
 * Covers email/password sign-in + sign-up (same surface area, same abuse
 * pattern). OAuth callbacks go through `/api/auth/callback/:providerId`
 * and are short-circuited separately if needed.
 */
const SIGN_IN_PATH_RE = /^\/api\/auth\/(sign-?in|sign-?up)(\/|$)/;

/**
 * Apply CORS headers shared by every API response.
 *
 * When the request advertises `credentials: 'include'` (cookies cross-
 * subdomain), the spec forbids `Access-Control-Allow-Origin: *` so we
 * echo the request origin back if it's allowlisted. `Vary: Origin` is
 * required so caches don't serve the wrong CORS answer to a different
 * caller.
 */
function applyCorsHeaders(req: IncomingMessage, res: Res): void {
  const envOrigins = (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const allowedOrigins = [
    "https://app.brol.dev",
    "https://api.brol.dev",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:8081", // Expo Metro
    "http://localhost:19006", // Expo web
    ...envOrigins,
  ];
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-locale");
  res.setHeader("Access-Control-Allow-Credentials", "true");
}

/**
 * Pre-flight handler. Returns true if the request was an OPTIONS and
 * was fully answered (caller must not continue).
 */
function handlePreflight(req: IncomingMessage, res: Res): boolean {
  if (req.method !== "OPTIONS") return false;
  res.statusCode = 204;
  res.end();
  return true;
}

/**
 * tRPC request handler — collects body first, then forwards to tRPC.
 */
async function handleTrpc(req: IncomingMessage, res: Res) {
  applyCorsHeaders(req, res);
  if (handlePreflight(req, res)) return;

  // Collect body (needed for POST/PUT/PATCH; empty for GET)
  const bodyBuffer = await collectBody(req);
  const bodyStr = bodyBuffer.length > 0 ? bodyBuffer.toString("utf-8") : undefined;

  const protocol = req.socket.encrypted ? "https" : "http";
  const host = req.headers.host ?? `localhost:${PORT}`;
  const url = `${protocol}://${host}${req.url}`;

  const fetchReq = new Request(url, {
    method: req.method,
    headers: req.headers as Record<string, string>,
    body: bodyStr,
  });

  await fetchRequestHandler({
    router: appRouter,
    createContext,
    endpoint: "/api/trpc",
    req: fetchReq,
    onError: ({ path, error, type }) => {
      // Toujours logger côté serveur — en prod aussi. Sans ça, impossible de
      // diagnostiquer les erreurs utilisateur. Les TRPCError fonctionnels
      // (UNAUTHORIZED, BAD_REQUEST, FORBIDDEN, NOT_FOUND) restent visibles
      // mais en `warn` pour limiter le bruit.
      const code = error.code;
      const expected =
        code === "UNAUTHORIZED" ||
        code === "FORBIDDEN" ||
        code === "BAD_REQUEST" ||
        code === "NOT_FOUND" ||
        code === "CONFLICT" ||
        code === "TOO_MANY_REQUESTS";
      const meta = {
        path: path ?? null,
        type,
        code,
        message: error.message,
        stack: expected ? undefined : error.stack,
      };
      if (expected) {
        log.warn("tRPC procedure error", meta);
      } else {
        log.error("tRPC procedure error", meta);
      }
    },
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
 * BetterAuth dispatcher with sign-in rate limiting.
 *
 * The actual `toNodeHandler(auth)` runs as before, but we wrap it to
 * short-circuit sign-in / sign-up attempts that exceed the per-IP quota.
 */
function handleBetterAuth(req: IncomingMessage, res: Res) {
  applyCorsHeaders(req, res);
  if (handlePreflight(req, res)) return;

  const pathname = req.url?.split("?")[0] ?? "";
  const isSignIn = req.method === "POST" && SIGN_IN_PATH_RE.test(pathname);

  if (isSignIn) {
    const ip = getClientIp(req.headers as Record<string, string>);
    const result = signInLimiter.check(`ip:${ip}`);
    if (!result.allowed) {
      const retryAfter = Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000));
      res.statusCode = 429;
      res.setHeader("Retry-After", String(retryAfter));
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({
        error: "Trop de tentatives de connexion. Réessayez dans quelques minutes.",
        retryAfter,
      }));
      log.warn("sign-in rate-limited", { ip, retryAfter });
      return;
    }
  }

  betterAuthHandler(req as never, res as never);
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
 * Gate the `/api/test/*` helpers on TWO conditions, not one.
 *
 * NODE_ENV alone isn't enough — a misconfigured prod deploy with
 * NODE_ENV=development would expose user-deletion endpoints. We also
 * require a shared `TEST_API_SECRET` header. Same secret is read by
 * the Playwright E2E helper (`apps/web/e2e/helpers/auth.ts`) to call
 * `cleanup-user` and `get-token` from the browser.
 */
function isTestEndpointAuthorized(req: IncomingMessage): boolean {
  if (process.env.NODE_ENV === "production") return false;
  const expected = process.env.TEST_API_SECRET;
  // Fail closed: if no secret is configured, refuse the call. This makes
  // accidentally enabling NODE_ENV=development in prod a hard fail rather
  // than an open door.
  if (!expected) return false;
  const provided = req.headers["x-test-api-secret"];
  const providedStr = Array.isArray(provided) ? provided[0] : provided;
  return providedStr === expected;
}

/**
 * Main request handler — routes to BetterAuth or tRPC.
 */
function handler(req: IncomingMessage, res: Res) {
  const pathname = req.url?.split("?")[0] ?? "";

  // BetterAuth handles /api/auth/*
  if (pathname.startsWith("/api/auth")) {
    handleBetterAuth(req, res);
    return;
  }

  // Test helpers (e2e cleanup) — gated by NODE_ENV != production AND a
  // shared X-Test-Api-Secret header. See `isTestEndpointAuthorized`.
  if (pathname === "/api/test/cleanup-user" && req.method === "POST") {
    if (!isTestEndpointAuthorized(req)) {
      res.statusCode = 404;
      res.end();
      return;
    }
    res.setHeader("Content-Type", "application/json");
    applyCorsHeaders(req, res);
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
    if (!isTestEndpointAuthorized(req)) {
      res.statusCode = 404;
      res.end();
      return;
    }
    res.setHeader("Content-Type", "application/json");
    applyCorsHeaders(req, res);
    const url = new URL(req.url ?? "", `http://localhost:${PORT}`);
    const email = url.searchParams.get("email");
    if (!email) { res.statusCode = 400; res.end(JSON.stringify({ error: "email required" })); return; }
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
  log.info("API server ready", {
    baseUrl: API_BASE_URL,
    trpcEndpoint: `${API_BASE_URL}/api/trpc`,
    authEndpoint: `${API_BASE_URL}/api/auth`,
    testEndpointGated: process.env.TEST_API_SECRET ? "by-secret" : "CLOSED (set TEST_API_SECRET)",
  });
});
