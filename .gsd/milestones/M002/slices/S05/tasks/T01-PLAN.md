---
estimated_steps: 1
estimated_files: 1
skills_used: []
---

# T01: Mettre à jour auth.spec.ts et exécuter les tests

Mettre à jour auth.spec.ts pour tester email/password (pas OAuth). Ajouter tests sign-in/sign-up. Marquer les tests OAuth comme skip (credentials not configured).

## Inputs

- `apps/web/e2e/auth.spec.ts (original)`

## Expected Output

- `apps/web/e2e/auth.spec.ts mis à jour`

## Verification

playwright test --project=chromium → tests exécutables passent, OAuth tests skip
