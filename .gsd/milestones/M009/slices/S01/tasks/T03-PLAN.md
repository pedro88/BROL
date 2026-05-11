---
estimated_steps: 3
estimated_files: 2
skills_used: []
---

# T03: Mettre à jour Zod schemas dans shared

Créer un ObjectTypeSchema avec les bons champs par type.
Union de 9 schemas (un par ObjectType).
CreateObjectInput + UpdateObjectInput incluent objectType et champs conditionnels.

## Inputs

- `T01`
- `T02`

## Expected Output

- `packages/shared/src/schemas/index.ts mis à jour`

## Verification

tsc --noEmit dans packages/shared
