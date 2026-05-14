---
estimated_steps: 1
estimated_files: 1
skills_used: []
---

# T06: E2E tests pour la page profil

Écrire les tests E2E: navigation vers profil, affichage informations, envoi d'un commentaire (si eligible)

## Inputs

- `apps/web/e2e/helpers/auth.ts`

## Expected Output

- `apps/web/e2e/profile.spec.ts`

## Verification

pnpm --filter @brol/web test:e2e
