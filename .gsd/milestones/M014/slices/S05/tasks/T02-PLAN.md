---
estimated_steps: 1
estimated_files: 3
skills_used: []
---

# T02: Intégrer badge.syncUser dans les triggers

Intégrer l'appel à badge.syncUser dans loans.create (après création du prêt, pour award first-loan/lender-5), objects.create (pour collector badges), review.create (pour reviewer)

## Inputs

- `packages/api/src/routers/badge.ts`

## Expected Output

- `packages/api/src/routers/loans.ts`
- `packages/api/src/routers/objects.ts`
- `packages/api/src/routers/review.ts`

## Verification

pnpm --filter @brol/api build && pnpm --filter @brol/api test

## Observability Impact

Logs quand syncUser est appelé et quand un badge est awarded
