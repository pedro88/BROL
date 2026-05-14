---
id: T01
parent: S01
milestone: M014
key_files:
  - packages/db/prisma/schema.prisma
  - packages/api/src/routers/profile.ts
  - packages/api/src/routers/review.ts
  - packages/api/src/routers/badge.ts
  - packages/api/src/router.ts
key_decisions:
  - (none)
duration: 
verification_result: passed
completed_at: 2026-05-14T06:49:53.529Z
blocker_discovered: false
---

# T01: Tables profil, reviews et badges ajoutées au schéma Prisma

**Tables profil, reviews et badges ajoutées au schéma Prisma**

## What Happened

Ajout des tables Profile, Review, BadgeDefinition, UserBadge au schéma Prisma avec les relations appropriées vers User et Loan. Migration appliquée via db push. Les 88 tests API passent toujours.

## Verification

pnpm generate + prisma db push + 88 tests passent

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `pnpm --filter @brol/db generate` | 0 | ✅ pass | 500ms |
| 2 | `npx prisma db push --schema packages/db/prisma/schema.prisma --skip-generate` | 0 | ✅ pass | 100ms |
| 3 | `pnpm --filter @brol/api test` | 0 | ✅ pass | 8260ms |

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `packages/db/prisma/schema.prisma`
- `packages/api/src/routers/profile.ts`
- `packages/api/src/routers/review.ts`
- `packages/api/src/routers/badge.ts`
- `packages/api/src/router.ts`
