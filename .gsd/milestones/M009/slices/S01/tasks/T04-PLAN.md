---
estimated_steps: 3
estimated_files: 2
skills_used: []
---

# T04: Mettre à jour tRPC routers

Modifier objects.create/get/update pour accepter objectType + champs spécifiques.
Modifier collections.create/get/update pour accepter type + customFieldLabels.
Valider avec Zod.

## Inputs

- `T03`

## Expected Output

- `routers mis à jour, tests passent`

## Verification

npx vitest run packages/api/src/routers/__tests__/objects.test.ts
