---
estimated_steps: 4
estimated_files: 1
skills_used: []
---

# T03: TRPCProvider wrapper

Créer apps/mobile/src/lib/trpc-provider.tsx
- TRPCProvider composant qui wrap l'app avec QueryClientProvider + TRPCProvider
- Lit le token depuis auth-store (nanostores) et l'injecte dans les headers tRPC
- Re-render quand le token change (via useEffect sur auth-store)

## Inputs

- `apps/mobile/src/lib/trpc.ts`
- `apps/mobile/src/lib/query-client.ts`

## Expected Output

- `apps/mobile/src/lib/trpc-provider.tsx`

## Verification

L'app charge sans erreur TRPC context missing

## Observability Impact

Erreurs de provider (Missing TRPC context) visibles dans la console
