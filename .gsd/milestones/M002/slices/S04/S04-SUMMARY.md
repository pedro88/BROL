---
id: S04
parent: M002
milestone: M002
provides:
  - (none)
requires:
  - slice: S01: procédure tRPC protégées, S02: collections.listPublic/getPublic, S03: Bearer token auth
    provides: 
affects:
  []
key_files:
  - (none)
key_decisions:
  - DATABASE_URL requis pour les tests (pas de fallback automatique)
  - Les tests vitest utilisent un seul fork (poolOptions.forks.singleFork: true) — parallèle limité mais stable
  - Coverage >85% overall — lignes non couvertes sont cursor ternaries et edge cases
patterns_established:
  - (none)
observability_surfaces:
  - none
drill_down_paths:
  - .gsd/milestones/M002/slices/S04/tasks/T01-SUMMARY.md
duration: ""
verification_result: passed
completed_at: 2026-05-04T07:27:43.231Z
blocker_discovered: false
---

# S04: Tests unitaires routers tRPC

**Tests unitaires passent — 60 tests, 5 routers, ~85% coverage**

## What Happened

S04 vérifie que les 60 tests unitaires sur les 5 routers passent. Tous passent après le fix emailVerified de S03. Le setup de test (packages/api/src/test/setup.ts) requiert DATABASE_URL car le fallback hardcodé ne fonctionnait pas. Les tests couvrent CRUD complet, authorization checks, et cas publics vs privés. Coverage globale ~85%.

## Verification

60 tests passed in 5 test files. Collections router 98.86% coverage.

## Requirements Advanced

None.

## Requirements Validated

None.

## New Requirements Surfaced

None.

## Requirements Invalidated or Re-scoped

None.

## Operational Readiness

None.

## Deviations

None.

## Known Limitations

["Playwright e2e config échoue car `pnpm start` requiert un build Next.js (.next/) qui n existe pas en dev"]

## Follow-ups

["S05: tests e2e Playwright (nécessite API server + Next.js prod build)", "Les lignes non couvertes sont cursor pagination + edge cases — acceptables"]

## Files Created/Modified

- `packages/api/src/test/setup.ts (fix emailVerified null → false)` — 
