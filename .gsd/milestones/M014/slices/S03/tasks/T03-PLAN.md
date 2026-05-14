---
estimated_steps: 1
estimated_files: 3
skills_used: []
---

# T03: Intégrer création automatique de notifications dans les routers

Ajouter des procédures triggerNotification dans les routers concernés (loans pour rappels, review pour review reçu, community-request pour nouvelles demandes)

## Inputs

- `packages/api/src/routers/notification.ts`

## Expected Output

- `packages/api/src/routers/loans.ts mis à jour`
- `packages/api/src/routers/review.ts mis à jour`
- `packages/api/src/routers/community-request.ts mis à jour`

## Verification

pnpm --filter @brol/api build && pnpm --filter @brol/api test

## Observability Impact

Logs quand une notification est créée pour chaque trigger
