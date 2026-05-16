---
estimated_steps: 1
estimated_files: 4
skills_used: []
---

# T02: Créer routers tRPC pour profile, review, badge

Créer les routers tRPC profile.get, profile.update, review.create, review.list, review.canReview, badge.list, badge.definitions, badge.award

## Inputs

- `packages/db/prisma/schema.prisma`

## Expected Output

- `packages/api/src/routers/profile.ts`
- `packages/api/src/routers/review.ts`
- `packages/api/src/routers/badge.ts`
- `packages/api/src/router.ts mis à jour`

## Verification

pnpm --filter @brol/api build && pnpm --filter @brol/api test

## Observability Impact

Logs dans les endpoints review.canReview (qui vérifie l'échange)
