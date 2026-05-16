# S02: Demande à la communauté pour emprunt

**Goal:** Permettre aux utilisateurs de faire une demande publique à la communauté pour emprunter un objet
**Demo:** Les utilisateurs peuvent envoyer une demande à la communauté pour un objet souhaité

## Must-Haves

- Table CommunityRequest en DB (auteur, objet souhaité, message, zone, status)
- API CRUD: create, list, get, cancel, fulfill
- Page /requests pour voir les demandes actives
- Bouton sur la page d'un objet pour créer une demande
- Notification envoyée au owner quand une demande est créée
- Page /requests/[id] pour les détails et répondre

## Proof Level

- This slice proves: End-to-end test

## Verification

- Logs dans les endpoints CRUD de communityRequest

## Tasks

- [x] **T01: Ajouter table CommunityRequest au schéma Prisma** `est:small`
  Ajouter la table CommunityRequest (auteur, objet souhaité, description, zone, status, fulfillByRequestId, expiresAt) au schéma Prisma
  - Files: `packages/db/prisma/schema.prisma`
  - Verify: pnpm generate

- [x] **T02: Créer router tRPC community-request** `est:medium`
  Créer le router tRPC communityRequest avec les endpoints: create, list, get, cancel, fulfill
  - Files: `packages/api/src/routers/community-request.ts`, `packages/api/src/router.ts`
  - Verify: pnpm --filter @brol/api build && pnpm --filter @brol/api test

- [x] **T03: Créer composants UI pour les demandes** `est:small`
  Créer les composants: RequestCard (affiche une demande), CreateRequestDialog (formulaire création), RequestsList (liste avec filtres)
  - Files: `apps/web/src/components/requests/`
  - Verify: pnpm --filter @brol/web build

- [x] **T04: Créer page /requests** `est:small`
  Créer la page /requests (liste des demandes actives avec filtres: zone, objet, status)
  - Files: `apps/web/src/app/requests/`
  - Verify: pnpm --filter @brol/web build

- [x] **T05: Ajouter bouton demande sur page objet** `est:small`
  Ajouter un bouton 'Faire une demande' sur la page /objects/[id] qui ouvre CreateRequestDialog
  - Files: `apps/web/src/app/objects/[id]/page.tsx`
  - Verify: pnpm --filter @brol/web build

- [x] **T06: E2E tests pour les demandes communauté** `est:small`
  Écrire les tests E2E: création de demande, affichage liste, réponse à une demande
  - Files: `apps/web/e2e/requests.spec.ts`
  - Verify: pnpm --filter @brol/web test:e2e

## Files Likely Touched

- packages/db/prisma/schema.prisma
- packages/api/src/routers/community-request.ts
- packages/api/src/router.ts
- apps/web/src/components/requests/
- apps/web/src/app/requests/
- apps/web/src/app/objects/[id]/page.tsx
- apps/web/e2e/requests.spec.ts
