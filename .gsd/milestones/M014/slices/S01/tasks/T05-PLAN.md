---
estimated_steps: 1
estimated_files: 2
skills_used: []
---

# T05: Créer dialog pour Laisser un avis

Créer le formulaire de création de review (note 1-5 étoiles cliquable, texteoptionnel), la validation (seulement si canReview=true), et l'affichage (dialog modale)

## Inputs

- `apps/web/src/components/profile/star-rating.tsx`

## Expected Output

- `apps/web/src/components/profile/leave-review-dialog.tsx`
- `apps/web/src/app/profile/[id]/page.tsx mis à jour`

## Verification

pnpm --filter @brol/web build
