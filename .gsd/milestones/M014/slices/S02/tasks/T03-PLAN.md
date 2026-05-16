---
estimated_steps: 1
estimated_files: 1
skills_used: []
---

# T03: Créer composants UI pour les demandes

Créer les composants: RequestCard (affiche une demande), CreateRequestDialog (formulaire création), RequestsList (liste avec filtres)

## Inputs

- None specified.

## Expected Output

- `apps/web/src/components/requests/request-card.tsx`
- `apps/web/src/components/requests/create-request-dialog.tsx`
- `apps/web/src/components/requests/requests-list.tsx`

## Verification

pnpm --filter @brol/web build
