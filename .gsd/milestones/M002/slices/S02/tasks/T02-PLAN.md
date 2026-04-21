---
estimated_steps: 1
estimated_files: 1
skills_used: []
---

# T02: Ajouter listPublic/getPublic au tRPC router

Ajouter listPublic (publicProcedure) et getPublic (publicProcedure) au collectionsRouter. Laisse list/get existants (protectedProcedure) pour les collections de l'utilisateur.

## Inputs

- None specified.

## Expected Output

- `packages/api/src/routers/collections.ts`

## Verification

curl http://localhost:3001/api/trpc/collections.listPublic
