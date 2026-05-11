---
estimated_steps: 1
estimated_files: 2
skills_used: []
---

# T04: Ajouter schémas photo au shared package

Ajouter les schémas Zod pour les mutations photo (addInput, removeInput) et types TypeScript correspondants dans packages/shared/src/schemas/index.ts et packages/shared/src/types/index.ts.

## Inputs

- `packages/shared/src/schemas/index.ts (ref)`

## Expected Output

- `Schémas photo dans packages/shared/src/schemas/index.ts`
- `Types Photo dans packages/shared/src/types/index.ts`

## Verification

grep -r 'photo' packages/shared/src/
