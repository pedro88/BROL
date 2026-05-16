# S01: tRPC client + TRPCProvider

**Goal:** Créer le client tRPC React Native + TRPCProvider. C'est le socle pour tout le reste.
**Demo:** Le code compile, le client tRPC est configuré, les hooks useQuery/useMutation fonctionnent

## Must-Haves

- ## Success Criteria
- `apps/mobile/src/lib/trpc.ts` exporte `trpc` (createTRPCReact<AppRouter>)
- `apps/mobile/src/lib/trpc-provider.tsx` exporte `TRPCProvider` avec QueryClient
- `apps/mobile/src/lib/query-client.ts` exporte le QueryClient singleton
- Header `Authorization: Bearer {token}` envoyé sur chaque requête
- URL API configurable via env var

## Proof Level

- This slice proves: Code compiles + requests HTTP réussissent vers l'API

## Integration Closure

S01 fournit le client tRPC que S02-S06 consomment.

## Verification

- Les erreurs tRPC (network, auth) doivent être logged dans la console

## Tasks

- [ ] **T01: QueryClient singleton** `est:15min`
  Créer apps/mobile/src/lib/query-client.ts
  - QueryClient singleton avec staleTime: 5000
  - retry: 1 pour queries, 0 pour mutations
  - Files: `apps/mobile/src/lib/query-client.ts`
  - Verify: tsc --noEmit dans apps/mobile

- [ ] **T02: tRPC client React Native** `est:30min`
  Créer apps/mobile/src/lib/trpc.ts
  - createTRPCReact<AppRouter>()
  - httpBatchLink vers NEXT_PUBLIC_API_URL ou localhost:3001
  - headers: Authorization: Bearer {token depuis auth store}
  - Files: `apps/mobile/src/lib/trpc.ts`
  - Verify: tsc --noEmit + test manuel: import { trpc } from './trpc' et vérifier que health query fonctionne

- [ ] **T03: TRPCProvider wrapper** `est:30min`
  Créer apps/mobile/src/lib/trpc-provider.tsx
  - TRPCProvider composant qui wrap l'app avec QueryClientProvider + TRPCProvider
  - Lit le token depuis auth-store (nanostores) et l'injecte dans les headers tRPC
  - Re-render quand le token change (via useEffect sur auth-store)
  - Files: `apps/mobile/src/lib/trpc-provider.tsx`
  - Verify: L'app charge sans erreur TRPC context missing

- [ ] **T04: Dépendances tRPC** `est:15min`
  Installer les dépendances tRPC React Query si pas déjà là:
  - @trpc/react-query
  - @tanstack/react-query
  - @brol/shared (pour les types Zod)
  Verifier que @tanstack/react-query est compatible React 18 (actuellement v5.62.8)
  - Files: `apps/mobile/package.json`
  - Verify: pnpm install dans apps/mobile + tsc --noEmit

## Files Likely Touched

- apps/mobile/src/lib/query-client.ts
- apps/mobile/src/lib/trpc.ts
- apps/mobile/src/lib/trpc-provider.tsx
- apps/mobile/package.json
