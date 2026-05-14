---
estimated_steps: 1
estimated_files: 2
skills_used: []
---

# T02: Créer router tRPC community-request

Créer le router tRPC communityRequest avec les endpoints: create, list, get, cancel, fulfill

## Inputs

- `packages/db/prisma/schema.prisma`

## Expected Output

- `packages/api/src/routers/community-request.ts`
- `packages/api/src/router.ts mis à jour`

## Verification

pnpm --filter @brol/api build && pnpm --filter @brol/api test

## Observability Impact

Logs dans create (notification owner) et fulfill (notification auteur)
