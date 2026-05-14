---
id: T02
parent: S01
milestone: M014
key_files:
  - packages/api/src/routers/profile.ts
  - packages/api/src/routers/review.ts
  - packages/api/src/routers/badge.ts
  - packages/api/src/router.ts
key_decisions:
  - (none)
duration: 
verification_result: passed
completed_at: 2026-05-14T06:50:46.634Z
blocker_discovered: false
---

# T02: Routers tRPC profile, review et badge créés

**Routers tRPC profile, review et badge créés**

## What Happened

Trois routers tRPC créés: profile (get/update), review (list/canReview/create), badge (definitions/list/award/syncUser). Tous exposés via appRouter. API build + 88 tests passent.

## Verification

pnpm build API + 88 tests passent

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `pnpm --filter @brol/api build` | 0 | ✅ pass | 207ms |
| 2 | `pnpm --filter @brol/api test` | 0 | ✅ pass | 8260ms |

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `packages/api/src/routers/profile.ts`
- `packages/api/src/routers/review.ts`
- `packages/api/src/routers/badge.ts`
- `packages/api/src/router.ts`
