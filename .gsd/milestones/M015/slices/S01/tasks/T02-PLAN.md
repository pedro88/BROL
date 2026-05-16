---
estimated_steps: 4
estimated_files: 1
skills_used: []
---

# T02: tRPC client React Native

Créer apps/mobile/src/lib/trpc.ts
- createTRPCReact<AppRouter>()
- httpBatchLink vers NEXT_PUBLIC_API_URL ou localhost:3001
- headers: Authorization: Bearer {token depuis auth store}

## Inputs

- `packages/api/src/router.ts (pour AppRouter type)`

## Expected Output

- `apps/mobile/src/lib/trpc.ts`

## Verification

tsc --noEmit + test manuel: import { trpc } from './trpc' et vérifier que health query fonctionne

## Observability Impact

Erreurs de config tRPC loggées au startup
