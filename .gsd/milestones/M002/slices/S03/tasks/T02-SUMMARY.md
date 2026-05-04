---
id: T02
parent: S03
milestone: M002
key_files:
  - (none)
key_decisions:
  - L'endpoint health est `health` (top-level dans appRouter) — pas `health.check`
duration: 
verification_result: passed
completed_at: 2026-05-04T07:21:46.591Z
blocker_discovered: false
---

# T02: API server fonctionnel — health:200, collections.list:401, Bearer:200

**API server fonctionnel — health:200, collections.list:401, Bearer:200**

## What Happened

API server restarté après le fix de T01. Les tests curl confirment: GET /api/trpc/health → 200 {\"status\":\"ok\"}, GET /api/trpc/collections.list → 401 UNAUTHORIZED (sans auth), GET /api/trpc/collections.list + Bearer token → 200 {\"items\":[],\"nextCursor\":null}. Les procédures publiques et protégées fonctionnent correctement.

## Verification

curl http://localhost:3001/api/trpc/health → {\"status\":\"ok\"} ✓ ; curl collections.list → 401 ✓

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `curl -s http://localhost:3001/api/trpc/health` | 0 | ✅ pass | 0ms |
| 2 | `curl -s http://localhost:3001/api/trpc/collections.list | grep UNAUTHORIZED` | 0 | ✅ pass | 0ms |

## Deviations

None. Le health endpoint est `health` (pas `health.check`). Collections.list retourne bien 401 sans auth.

## Known Issues

Le health endpoint ne s'appelle pas `health.check` mais `health` — pas de bug, juste une différence de naming.

## Files Created/Modified

None.
