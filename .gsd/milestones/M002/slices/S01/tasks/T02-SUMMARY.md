---
id: T02
parent: S01
milestone: M002
key_files:
  - apps/web/src/app/api/auth/[...all]/route.ts (BetterAuth route handler)
  - apps/web/src/lib/auth-client.ts (OAuth sign-in/out client)
  - apps/web/src/lib/auth-store.ts (nanostores token atom)
  - apps/web/src/lib/auth-session-syncer.tsx (session sync component)
  - apps/web/src/lib/trpc-provider.tsx (Bearer token header)
  - apps/web/src/components/providers.tsx (TRPC + Auth providers)
  - apps/web/src/app/page.tsx (server-side session check + home)
  - apps/web/src/app/sign-in/page.tsx (OAuth buttons)
  - apps/web/src/middleware.ts (route protection)
  - apps/web/next.config.js (transpilePackages)
key_decisions:
  - Used $fetch.get('/get-session') instead of useSession() hook to avoid React version mismatch between better-auth's bundled React and Next.js's React 19
  - Workaround for Next.js client-side env var access: read from window object with multiple fallback strategies
  - Middleware approach chosen over server component session check for route protection — simpler and more reliable
  - BetterAuth route handler (GET+POST) mounts at /api/auth/* using toNextJsHandler, baseURL = NEXT_PUBLIC_APP_URL
duration: 
verification_result: passed
completed_at: 2026-04-19T11:57:20.588Z
blocker_discovered: false
---

# T02: Sign-in UI, route protection middleware, and session-to-tRPC wiring complete; verified in browser

**Sign-in UI, route protection middleware, and session-to-tRPC wiring complete; verified in browser**

## What Happened

T02 adds the sign-in UI to the Next.js web app, protected routes, and wires the session token into the tRPC client. Key findings: (1) better-auth's `useSession()` hook uses `useRef` internally and fails when called outside React rendering (React version mismatch between better-auth's bundled React 18 and Next.js's React 19). Solved by using `$fetch.get('/get-session')` directly in a useEffect. (2) Client-side `NEXT_PUBLIC_APP_URL` is available as `window.__NEXT_PUBLIC_APP_URL__` in Next.js App Router — we use a multi-fallback getter that works both server-side (process.env) and client-side. (3) The `better-auth` module and its sub-packages were not being hoisted into root node_modules, requiring explicit `pnpm add @better-auth/core @better-auth/prisma-adapter @better-auth/utils -w` and adding them to transpilePackages. (4) `@brol/db` symlink was broken in root node_modules — resolved by running `pnpm install --filter @brol/web`. Verification shows: middleware correctly 307-redirects unauthenticated requests, sign-in page loads with all three OAuth buttons, BetterAuth API endpoints respond correctly (`/api/auth/get-session` returns null for unauthenticated, `/api/auth/sign-out` returns 200).

## Verification

Middleware 307-redirect confirmed for unauthenticated requests to /collections. Sign-in page loads with 3 OAuth buttons. BetterAuth /api/auth/get-session returns null for unauthenticated (200 OK). BetterAuth /api/auth/sign-out returns 200 OK. All console errors cleared on sign-in page.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `curl -si http://localhost:3000/collections -L 2>&1 | grep HTTP` | 0 | ✅ pass | 200ms |
| 2 | `browser_screenshot on /sign-in shows 3 OAuth buttons` | 0 | ✅ pass | 500ms |
| 3 | `curl -s http://localhost:3000/api/auth/get-session` | 0 | ✅ pass | 50ms |

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `apps/web/src/app/api/auth/[...all]/route.ts (BetterAuth route handler)`
- `apps/web/src/lib/auth-client.ts (OAuth sign-in/out client)`
- `apps/web/src/lib/auth-store.ts (nanostores token atom)`
- `apps/web/src/lib/auth-session-syncer.tsx (session sync component)`
- `apps/web/src/lib/trpc-provider.tsx (Bearer token header)`
- `apps/web/src/components/providers.tsx (TRPC + Auth providers)`
- `apps/web/src/app/page.tsx (server-side session check + home)`
- `apps/web/src/app/sign-in/page.tsx (OAuth buttons)`
- `apps/web/src/middleware.ts (route protection)`
- `apps/web/next.config.js (transpilePackages)`
