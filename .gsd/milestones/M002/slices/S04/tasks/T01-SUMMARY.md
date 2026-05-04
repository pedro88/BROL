---
id: T01
parent: S04
milestone: M002
key_files:
  - packages/api/src/routers/__tests__/collections.test.ts
  - packages/api/src/routers/__tests__/objects.test.ts
  - packages/api/src/routers/__tests__/loans.test.ts
  - packages/api/src/routers/__tests__/contacts.test.ts
  - packages/api/src/routers/__tests__/qr.test.ts
key_decisions:
  - 60 tests unitaires couvrent les 5 routers: collections (12), objects (11), loans (10), contacts (12), qr (12)
  - Coverage: collections 98.86%, objects 88.88%, loans 86.25%, contacts 92.96%, qr 96.18% — lignes non couvertes sont mainly edge cases et cursor pagination (nextCursor ternaries)
duration: 
verification_result: passed
completed_at: 2026-05-04T07:27:26.285Z
blocker_discovered: false
---

# T01: 60 tests unitaires passent — 5 routers, coverage ~85% overall

**60 tests unitaires passent — 5 routers, coverage ~85% overall**

## What Happened

Les 60 tests unitaires sur les 5 routers tRPC passent tous. Le fix de S03 (emailVerified null → false) a résolu le problème bloquant. Les tests couvrent les cas heureux, les erreurs d authorization (autre utilisateur), et les cas limites (collection vide, collection publique vs privée). La coverage est bonne: collections 98.86%, objects 88.88%, loans 86.25%, contacts 92.96%, qr 96.18%.

## Verification

vitest run → 5 test files passed, 60 tests passed ✅

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `DATABASE_URL=... pnpm --filter @brol/api exec vitest run` | 0 | ✅ pass | 5020ms |

## Deviations

Aucune. Les tests passaient déjà (S03 a corrigé emailVerified). Aucune modification de code n était nécessaire — les 60 tests fonctionnaient après le fix de S03.

## Known Issues

Le playwright e2e config utilise `pnpm start` (prod build) mais pas de .next/build existant — les tests e2e ne peuvent pas démarrer sans build préalable. Ce problème est hors scope S04.

## Files Created/Modified

- `packages/api/src/routers/__tests__/collections.test.ts`
- `packages/api/src/routers/__tests__/objects.test.ts`
- `packages/api/src/routers/__tests__/loans.test.ts`
- `packages/api/src/routers/__tests__/contacts.test.ts`
- `packages/api/src/routers/__tests__/qr.test.ts`
