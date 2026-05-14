---
estimated_steps: 1
estimated_files: 1
skills_used: []
---

# T05: Ajouter bouton demande sur page objet

Ajouter un bouton 'Faire une demande' sur la page /objects/[id] qui ouvre CreateRequestDialog

## Inputs

- `apps/web/src/components/requests/create-request-dialog.tsx`

## Expected Output

- `apps/web/src/app/objects/[id]/page.tsx mis à jour`

## Verification

pnpm --filter @brol/web build
