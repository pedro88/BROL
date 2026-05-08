# S03: Mock data → real tRPC queries

**Goal:** Remplacer les appels mock par des vraies queries tRPC. Vérifier que le Bearer token auth fonctionne, que les endpoints protégés retournent les vraies données, et que les erreurs 401 sont gérées proprement côté frontend.
**Demo:** 

## Must-Haves

- Le middleware et les pages utilisent des vraies queries tRPC. Les endpoints protégés (collections.list, objects.get, etc.) répondent correctement avec ou sans auth Bearer token. Le frontend gère les erreurs 401 sans crash.

## Proof Level

- This slice proves: runtime-realtime

## Integration Closure

Le bearer token auth path est vérifié end-to-end. Les endpoints protégés ne retournent plus de 500 (runtime errors) mais un 401 propre. Les pages frontend peuvent accéder aux vraies données une fois connectées.

## Verification

- Aucune surface d'observabilité ajoutée — toilettage d'intégration.

## Tasks

- [x] **T01: Fix auth.ts: sessionToken → token, expires → expiresAt** `est:15min`
  Le code getSession() utilise sessionToken et expires. Le schéma Prisma utilise token et expiresAt. Fixer ces 2 bugs + ajouter include: { user: true } manquant.
  - Files: `packages/api/src/auth.ts`
  - Verify: grep token packages/api/src/auth.ts | grep -v sessionToken && grep expiresAt packages/api/src/auth.ts

- [x] **T02: Vérifier que l'API démarre sans erreur et que les endpoints répondent** `est:15min`
  Redémarrer le serveur API. Vérifier que /api/trpc/health.check fonctionne (publicProcedure). Vérifier que /api/trpc/collections.list retourne 401 sans Bearer token (comportement attendu).
  - Files: `packages/api/src/server.ts`
  - Verify: curl http://localhost:3001/api/trpc/health.check → JSON response ; curl http://localhost:3001/api/trpc/collections.list → 401 UNAUTHORIZED

- [x] **T03: Test du flow sign-in → Bearer token → protected endpoint** `est:30min`
  Créer un utilisateur de test via BetterAuth sign-up. Se logger via sign-in. Extraire le session token. Faire un appel à collections.list avec Bearer token. Vérifier que les données utilisateur sont retournées.
  - Verify: curl avec Authorization: Bearer <token> → 200 avec données ou empty array (selon si collections existent)

## Files Likely Touched

- packages/api/src/auth.ts
- packages/api/src/server.ts
