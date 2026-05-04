# S04: Tests unitaires routers tRPC

**Goal:** Exécuter les tests unitaires sur les 5 routers tRPC et vérifier qu'ils passent tous.
**Demo:** 

## Must-Haves

- vitest run passe sans erreur sur les 5 fichiers de test.

## Proof Level

- This slice proves: runtime-realtime

## Integration Closure

Les 5 routers (collections, objects, loans, contacts, qr) sont testés et passent en isolation.

## Verification

- Run the task and slice verification checks for this slice.

## Tasks

- [x] **T01: Exécuter vitest et vérifier 100% pass** `est:20min`
  Exécuter vitest sur les 5 fichiers de test (collections, objects, loans, contacts, qr). Vérifier les 60 tests passent. Analyser la coverage et identifier les lignes non couvertes.
  - Files: `packages/api/src/routers/__tests__/collections.test.ts`, `packages/api/src/routers/__tests__/objects.test.ts`, `packages/api/src/routers/__tests__/loans.test.ts`, `packages/api/src/routers/__tests__/contacts.test.ts`, `packages/api/src/routers/__tests__/qr.test.ts`
  - Verify: DATABASE_URL=... pnpm --filter @brol/api exec vitest run → 5 test files, 60 tests passed

## Files Likely Touched

- packages/api/src/routers/__tests__/collections.test.ts
- packages/api/src/routers/__tests__/objects.test.ts
- packages/api/src/routers/__tests__/loans.test.ts
- packages/api/src/routers/__tests__/contacts.test.ts
- packages/api/src/routers/__tests__/qr.test.ts
