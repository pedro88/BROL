---
estimated_steps: 1
estimated_files: 3
skills_used: []
---

# T03: Intégrer vérification limites dans les routers

Ajouter un helper checkTierLimit() dans les routers collections, objects, loans pour bloquer quand limite atteinte

## Inputs

- `packages/api/src/routers/tier.ts`

## Expected Output

- `packages/api/src/routers/collections.ts`
- `packages/api/src/routers/objects.ts`
- `packages/api/src/routers/loans.ts mis à jour`

## Verification

pnpm --filter @brol/api build && pnpm --filter @brol/api test

## Observability Impact

Logs quand une limite est vérifiée et quand elle bloque une action
