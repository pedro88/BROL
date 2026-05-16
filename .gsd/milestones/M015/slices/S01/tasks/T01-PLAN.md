---
estimated_steps: 3
estimated_files: 1
skills_used: []
---

# T01: QueryClient singleton

Créer apps/mobile/src/lib/query-client.ts
- QueryClient singleton avec staleTime: 5000
- retry: 1 pour queries, 0 pour mutations

## Inputs

- None specified.

## Expected Output

- `apps/mobile/src/lib/query-client.ts`

## Verification

tsc --noEmit dans apps/mobile

## Observability Impact

Aucune - configuration pure
