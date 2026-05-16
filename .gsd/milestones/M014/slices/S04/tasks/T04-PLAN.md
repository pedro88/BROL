---
estimated_steps: 1
estimated_files: 1
skills_used: []
---

# T04: UI tier dans page settings

Créer la page /settings avec section Tier: affiche le plan actuel, barres de progression (collections, objets, prêts), bouton pour upgrader vers TIER_2 ou TIER_3

## Inputs

- `packages/api/src/routers/tier.ts`

## Expected Output

- `apps/web/src/app/settings/page.tsx mis à jour avec section tier`

## Verification

pnpm --filter @brol/web build
