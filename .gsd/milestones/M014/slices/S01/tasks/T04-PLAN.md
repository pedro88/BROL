---
estimated_steps: 1
estimated_files: 1
skills_used: []
---

# T04: Créer page profil /profile/[id]

Créer la page /profile/[id] avec les sections: header (avatar, nom, bio, member since), badges, statistiques (note moyenne, nb commentaires, nb prêts), liste commentaires, objets prêtés. Ajouter bouton Laisser un avis si eligible.

## Inputs

- `packages/api/src/routers/profile.ts`
- `packages/api/src/routers/review.ts`

## Expected Output

- `apps/web/src/app/profile/[id]/page.tsx`

## Verification

pnpm --filter @brol/web build
