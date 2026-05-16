---
estimated_steps: 1
estimated_files: 1
skills_used: []
---

# T03: Vérifier affichage badges sur page profil

Vérifier que la page /profile/[id] affiche correctement les badges avec icône, nom, description tooltip et badge awardé

## Inputs

- `packages/api/src/routers/profile.ts`

## Expected Output

- `apps/web/src/app/profile/[id]/page.tsx vérifié`

## Verification

pnpm --filter @brol/web build
