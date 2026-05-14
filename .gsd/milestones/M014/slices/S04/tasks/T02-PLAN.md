---
estimated_steps: 1
estimated_files: 2
skills_used: []
---

# T02: Créer router tRPC tier avec vérification de limites

Créer le router tRPC tier avec: getLimits (limites du current user), checkLimit (vérifier avant action), upgrade (upgrade vers un tier)

## Inputs

- None specified.

## Expected Output

- `packages/api/src/routers/tier.ts`
- `packages/api/src/router.ts mis à jour`

## Verification

pnpm --filter @brol/api build

## Observability Impact

Logs dans checkLimit (quand limite atteinte)
