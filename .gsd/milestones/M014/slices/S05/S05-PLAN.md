# S05: Système de badge

**Goal:** Implémenter le système de badge (badges atteints, progression, affichage sur le profil)
**Demo:** Les utilisateurs gagnent des badges en utilisant l'application

## Must-Haves

- Seed data des BadgeDefinition dans la DB (7 badges par défaut)
- syncUser appelé automatiquement après prêt, ajout d'objet, review
- Page /profile/[id] affiche les badges awardés
- Badge awarded automatiquement quand les critères sont atteints
- API badge.list inclut les badges awardés pour l'utilisateur

## Proof Level

- This slice proves: End-to-end test

## Verification

- Logs quand un badge est awardé

## Tasks

- [x] **T01: Seed BadgeDefinition dans la DB** `est:small`
  Créer le seed script pour les 7 BadgeDefinition par défaut (first-loan, lender-5, lender-25, collector-10, collector-50, reviewer, five-stars) dans la DB
  - Files: `packages/db/prisma/seed.ts`
  - Verify: pnpm db:seed && query badge_definitions table

- [x] **T02: Intégrer badge.syncUser dans les triggers** `est:medium`
  Intégrer l'appel à badge.syncUser dans loans.create (après création du prêt, pour award first-loan/lender-5), objects.create (pour collector badges), review.create (pour reviewer)
  - Files: `packages/api/src/routers/loans.ts`, `packages/api/src/routers/objects.ts`, `packages/api/src/routers/review.ts`
  - Verify: pnpm --filter @brol/api build && pnpm --filter @brol/api test

- [x] **T03: Vérifier affichage badges sur page profil** `est:small`
  Vérifier que la page /profile/[id] affiche correctement les badges avec icône, nom, description tooltip et badge awardé
  - Files: `apps/web/src/app/profile/[id]/page.tsx`
  - Verify: pnpm --filter @brol/web build

- [x] **T04: Tests unitaires pour les badges** `est:small`
  Écrire les tests: award automatique de first-loan après premier prêt, collector-10 après 10 objets, reviewer après premier review
  - Files: `packages/api/src/routers/__tests__/badge.test.ts`
  - Verify: pnpm --filter @brol/api test

## Files Likely Touched

- packages/db/prisma/seed.ts
- packages/api/src/routers/loans.ts
- packages/api/src/routers/objects.ts
- packages/api/src/routers/review.ts
- apps/web/src/app/profile/[id]/page.tsx
- packages/api/src/routers/__tests__/badge.test.ts
