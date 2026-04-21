---
estimated_steps: 1
estimated_files: 1
skills_used: []
---

# T04: Ajouter isPublic toggle au CreateCollectionDialog

Ajouter toggle isPublic au formulaire de création. Mettre à jour le schéma Zod pour inclure isPublic.

## Inputs

- `packages/api/src/routers/collections.ts`

## Expected Output

- `apps/web/src/components/collections/create-collection-dialog.tsx`

## Verification

grep isPublic apps/web/src/components/collections/create-collection-dialog.tsx
