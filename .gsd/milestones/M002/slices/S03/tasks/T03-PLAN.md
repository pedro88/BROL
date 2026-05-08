---
estimated_steps: 1
estimated_files: 1
skills_used: []
---

# T03: Test du flow sign-in → Bearer token → protected endpoint

Créer un utilisateur de test via BetterAuth sign-up. Se logger via sign-in. Extraire le session token. Faire un appel à collections.list avec Bearer token. Vérifier que les données utilisateur sont retournées.

## Inputs

- `packages/api/src/auth.ts (fixed)`

## Expected Output

- `Full end-to-end test: create user → sign in → access protected endpoint with Bearer token`

## Verification

curl avec Authorization: Bearer <token> → 200 avec données ou empty array (selon si collections existent)
