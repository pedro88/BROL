# S02: Collections publiques

**Goal:** Rendre les collections browsable publiquement sans login. Ajouter un champ isPublic au modèle, des procédures tRPC publiques pour lister/voir les collections publiques, et une page /browse pour naviguer sans authentification.
**Demo:** Anyone can browse public collections at /browse, public collections accessible at /c/[slug] without login

## Must-Haves

- `curl http://localhost:3001/api/trpc/collections.listPublic` retourne les collections publiques
- `/browse` render sans erreur (middleware permet l'accès)
- `CreateCollectionDialog` a une toggle isPublic fonctionnelle
- La page `/collections` affiche aussi les collections publiques

## Proof Level

- This slice proves: runtime-realtime

## Integration Closure

CollectionsRouter mis à jour avec publicProcedure pour les endpoints publics. Le reste du codebase (web, objects) n'est pas affecté par ce slice.

## Verification

- Nouvelle query tRPC listPublic.getPublic — pas de données sensibles (collections publiques uniquement)

## Tasks

- [ ] **T01: Ajouter isPublic au modèle Prisma** `est:10min`
  Ajouter champ isPublic Bool @default(false) au modèle Collection et migrer la DB
  - Files: `packages/db/prisma/schema.prisma`
  - Verify: grep isPublic packages/db/prisma/schema.prisma

- [ ] **T02: Ajouter listPublic/getPublic au tRPC router** `est:30min`
  Ajouter listPublic (publicProcedure) et getPublic (publicProcedure) au collectionsRouter. Laisse list/get existants (protectedProcedure) pour les collections de l'utilisateur.
  - Files: `packages/api/src/routers/collections.ts`
  - Verify: curl http://localhost:3001/api/trpc/collections.listPublic

- [ ] **T03: Créer page /browse** `est:20min`
  Créer page /browse pour lister les collections publiques. Utilise trpc.collections.listPublic.useQuery(). Grid responsive.
  - Files: `apps/web/src/app/browse/page.tsx`
  - Verify: curl -o /dev/null -w '%{http_code}' http://localhost:3000/browse

- [ ] **T04: Ajouter isPublic toggle au CreateCollectionDialog** `est:15min`
  Ajouter toggle isPublic au formulaire de création. Mettre à jour le schéma Zod pour inclure isPublic.
  - Files: `apps/web/src/components/collections/create-collection-dialog.tsx`
  - Verify: grep isPublic apps/web/src/components/collections/create-collection-dialog.tsx

## Files Likely Touched

- packages/db/prisma/schema.prisma
- packages/api/src/routers/collections.ts
- apps/web/src/app/browse/page.tsx
- apps/web/src/components/collections/create-collection-dialog.tsx
