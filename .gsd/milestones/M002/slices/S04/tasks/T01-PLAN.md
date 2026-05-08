---
estimated_steps: 1
estimated_files: 5
skills_used: []
---

# T01: Exécuter vitest et vérifier 100% pass

Exécuter vitest sur les 5 fichiers de test (collections, objects, loans, contacts, qr). Vérifier les 60 tests passent. Analyser la coverage et identifier les lignes non couvertes.

## Inputs

- `packages/api/vitest.config.ts`
- `packages/api/src/test/setup.ts`

## Expected Output

- `Tests unitaires exécutés`

## Verification

DATABASE_URL=... pnpm --filter @brol/api exec vitest run → 5 test files, 60 tests passed
