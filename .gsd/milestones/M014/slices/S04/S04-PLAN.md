# S04: Tiers d'utilisation et limites

**Goal:** Implémenter les tiers d'utilisation (Free: 5 collections/50 objets/10 prêts, Tier 2: 10/500/50 à 3€/mois, Tier 3: illimité à 20€/mois)
**Demo:** Les utilisateurs ont accès à des plans selon leurs besoins

## Must-Haves

- Enum Tier dans DB (FREE, TIER_2, TIER_3) avec limites
- Champ tier + limits sur User/Profile
- Middleware/API: vérifier les limites avant création (collections, objets, prêts)
- Page /settings avec affichage du tier actuel et bouton upgrade
- Affichage usage: X/5 collections, Y/50 objets, Z/10 prêts sur le dashboard
- Blocage si limite atteinte avec message clair + CTA upgrade

## Proof Level

- This slice proves: End-to-end test

## Verification

- Logs dans les procédures de vérification de limites

## Tasks

- [x] **T01: Ajouter enum Tier et champ user.tier au schéma Prisma** `est:small`
  Ajouter enum TierTier (FREE, TIER_2, TIER_3) et champ tier + metadata (expiresAt) sur User ou Profile dans le schéma Prisma
  - Files: `packages/db/prisma/schema.prisma`
  - Verify: pnpm generate

- [x] **T02: Créer router tRPC tier avec vérification de limites** `est:medium`
  Créer le router tRPC tier avec: getLimits (limites du current user), checkLimit (vérifier avant action), upgrade (upgrade vers un tier)
  - Files: `packages/api/src/routers/tier.ts`, `packages/api/src/router.ts`
  - Verify: pnpm --filter @brol/api build

- [x] **T03: Intégrer vérification limites dans les routers** `est:medium`
  Ajouter un helper checkTierLimit() dans les routers collections, objects, loans pour bloquer quand limite atteinte
  - Files: `packages/api/src/routers/collections.ts`, `packages/api/src/routers/objects.ts`, `packages/api/src/routers/loans.ts`
  - Verify: pnpm --filter @brol/api build && pnpm --filter @brol/api test

- [x] **T04: UI tier dans page settings** `est:medium`
  Créer la page /settings avec section Tier: affiche le plan actuel, barres de progression (collections, objets, prêts), bouton pour upgrader vers TIER_2 ou TIER_3
  - Files: `apps/web/src/app/settings/page.tsx`
  - Verify: pnpm --filter @brol/web build

- [x] **T05: Tests unitaires pour tier limits** `est:small`
  Écrire les tests: limites respectées, upgrade déclenché, blocage si limite atteinte
  - Files: `packages/api/src/routers/__tests__/tier.test.ts`
  - Verify: pnpm --filter @brol/api test

## Files Likely Touched

- packages/db/prisma/schema.prisma
- packages/api/src/routers/tier.ts
- packages/api/src/router.ts
- packages/api/src/routers/collections.ts
- packages/api/src/routers/objects.ts
- packages/api/src/routers/loans.ts
- apps/web/src/app/settings/page.tsx
- packages/api/src/routers/__tests__/tier.test.ts
