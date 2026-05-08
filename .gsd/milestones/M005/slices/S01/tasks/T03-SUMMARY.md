---
id: T03
parent: S01
milestone: M005
key_files:
  - apps/web/src/middleware.ts
key_decisions:
  - Root / is now the first pattern checked in middleware, before the PUBLIC_PATHS loop
duration: 
verification_result: untested
completed_at: 2026-05-08T06:33:01.861Z
blocker_discovered: false
---

# T03: Added root / to protected routes in middleware with session cookie check.

**Added root / to protected routes in middleware with session cookie check.**

## What Happened

Updated middleware.ts to protect the root path /. Unauthenticated users visiting / are redirected to /sign-in with callbackUrl=/. Authenticated users see the dashboard normally. The check for / is placed before the public paths loop to ensure it takes priority.

## Verification

grep confirms: middleware checks pathname === '/' for protected, reads better-auth.session_token cookie, redirects to /sign-in with callbackUrl if missing.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| — | No verification commands discovered | — | — | — |

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `apps/web/src/middleware.ts`
