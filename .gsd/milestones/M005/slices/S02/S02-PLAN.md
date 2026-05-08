# S02: Supprimer les données mock du dashboard

**Goal:** Remplacer les données mock (24 objets, 3 prêts, 12 contacts) par des appels tRPC réels.
**Demo:** Les stats du dashboard affichent des vraies données depuis la DB.

## Must-Haves

- StatCard 'Objets' affiche le nombre réel d'objets du user
- StatCard 'Prêtés' affiche les prêts actifs du user
- StatCard 'Contacts' affiche le nombre réel de contacts du user
- Les sections vides/loading sont gérées proprement
- Aucun hardcoded '24', '3', '12' dans le DOM

## Proof Level

- This slice proves: E2E: dashboard stats reflètent les vraies valeurs (count réel d'objets, prêts actifs, contacts).

## Verification

- Loading states pendant le fetch des données réelles.

## Tasks

- [x] **T01: Identifier les endpoints tRPC pour les stats** `est:15min`
  Vérifier que les routers tRPC exposent des count ou list endpoints utilisables pour les stats : objects.list, contacts.list, loans.list. Lire les routers et les types shared si nécessaire.
  - Files: `packages/api/src/routers/objects.ts`, `packages/api/src/routers/contacts.ts`, `packages/api/src/routers/loans.ts`
  - Verify: grep -n 'list\|count\|stats' packages/api/src/routers/*.ts

- [ ] **T02: Remplacer les données mock par des hooks tRPC** `est:45min`
  Rendre page.tsx client-side ('use client'). Remplacer les valeurs codées en dur par des appels trpc.objects.list, trpc.contacts.list, trpc.loans.list. Ajouter des loading skeletons et empty states. Gérer les erreurs avec un fallback.
  - Files: `apps/web/src/app/page.tsx`
  - Verify: grep -n 'useQuery\|trpc\.\|useState' apps/web/src/app/page.tsx && ! grep "'24'\|'3'\|'12'" apps/web/src/app/page.tsx

## Files Likely Touched

- packages/api/src/routers/objects.ts
- packages/api/src/routers/contacts.ts
- packages/api/src/routers/loans.ts
- apps/web/src/app/page.tsx
