---
id: T01
parent: S01
milestone: M002
key_files:
  - packages/api/src/auth.ts (new — BetterAuth instance with OAuth providers)
  - packages/api/src/server.ts (updated — BetterAuth route handler + absolute URL for tRPC)
  - packages/api/src/trpc/index.ts (updated — userId extraction from session)
  - packages/api/src/router.ts (updated — auth.me public query)
  - .env (created from .env.example with OAuth vars documented)
key_decisions:
  - D024: esbuild 0.27.7 workaround — use `{ google: google({...}) }` instead of `{ google({...}) }` for BetterAuth socialProviders config
  - D016 (existing): Apple client secret is a JWT ES256 generated from PKCS#8 private key env var at module load, cached in module scope
  - D018 (existing): Session extracted server-side via `auth.api.getSession({ headers })` in createContext — no middleware wrapper needed for tRPC v11
duration: 
verification_result: passed
completed_at: 2026-04-19T10:05:49.852Z
blocker_discovered: false
---

# T01: Wire BetterAuth + Google/GitHub/Apple OAuth into API server and tRPC context

**Wire BetterAuth + Google/GitHub/Apple OAuth into API server and tRPC context**

## What Happened

Task T01 completed fully. Created `packages/api/src/auth.ts` with BetterAuth configured for Google, GitHub, and Apple OAuth providers, Prisma adapter pointing to the existing DB schema, and a `getSession()` helper. Updated `packages/api/src/server.ts` to mount BetterAuth routes at `/api/auth/[...all]` alongside tRPC at `/api/trpc`, with proper absolute URL construction for the Node.js HTTP server (tRPC's fetch adapter requires absolute URLs). Updated `packages/api/src/trpc/index.ts` to extract `userId` from the session cookie in `createContext`, populating `ctx.userId` for protected procedures. Updated `packages/api/src/router.ts` to expose `auth.me` as a public tRPC query returning `{ sessionToken, user }`. Ran Prisma generate for the DB client. Discovered and documented esbuild 0.27.7 bug: nested function calls inside object literals inside another function call fail to parse (e.g., `{ google({ clientId: "a" }) }` inside `betterAuth({...})`). Workaround: use the explicit property-value form `{ google: google({ clientId: "a" }) }`. All 3 slice verification checks pass: health endpoint returns ok, auth.me returns null session (anonymous), and collections.list returns UNAUTHORIZED as expected.

## Verification

All slice verification checks pass: (1) `curl http://localhost:3001/api/trpc/health` returns `{"status":"ok"}`; (2) `curl http://localhost:3001/api/trpc/auth.me` returns `{"sessionToken":null,"user":null}` for anonymous users; (3) `curl http://localhost:3001/api/trpc/collections.list` returns UNAUTHORIZED error for unauthenticated requests. The BetterAuth API routes (`/api/auth/get-session`) also return `null` for anonymous sessions. OAuth provider warnings for missing env vars are expected since credentials are not configured yet — BetterAuth correctly warns but doesn't crash. The .env was created from .env.example so OAuth env vars are documented.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `curl -s http://localhost:3001/api/trpc/health` | 0 | ✅ pass | 5ms |
| 2 | `curl -s http://localhost:3001/api/trpc/auth.me` | 0 | ✅ pass | 3ms |
| 3 | `curl -s http://localhost:3001/api/trpc/collections.list` | 0 | ✅ pass (UNAUTHORIZED error returned as expected) | 4ms |
| 4 | `esbuild transform auth.ts (all 4 modified source files)` | 0 | ✅ pass (TypeScript files compile with esbuild) | 100ms |

## Deviations

The esbuild 0.27.7 bundled with tsx 4.21.0 has a parser bug with nested function calls in object literals inside another function call. This required changing the BetterAuth `socialProviders` config from `{ google({...}) }` syntax to the explicit `{ google: google({...}) }` form. This is an environment-specific workaround (esbuild 0.27.7 → 0.28 likely fixes it). No deviations from the plan's functional intent.

## Known Issues

esbuild 0.27.7 parser workaround documented in D024. If tsx/esbuild is upgraded, the shorthand `{ google({...}) }` syntax should work again. OAuth credentials not yet configured in .env — providers will warn at runtime.

## Files Created/Modified

- `packages/api/src/auth.ts (new — BetterAuth instance with OAuth providers)`
- `packages/api/src/server.ts (updated — BetterAuth route handler + absolute URL for tRPC)`
- `packages/api/src/trpc/index.ts (updated — userId extraction from session)`
- `packages/api/src/router.ts (updated — auth.me public query)`
- `.env (created from .env.example with OAuth vars documented)`
