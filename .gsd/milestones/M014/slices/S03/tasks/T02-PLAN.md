---
estimated_steps: 1
estimated_files: 2
skills_used: []
---

# T02: Créer router tRPC notification

Créer le router tRPC notification avec les endpoints: list, markRead, markAllRead, getUnreadCount, create (interne)

## Inputs

- None specified.

## Expected Output

- `packages/api/src/routers/notification.ts`
- `packages/api/src/router.ts mis à jour`

## Verification

pnpm --filter @brol/api build && pnpm --filter @brol/api test

## Observability Impact

Logs dans create (type notification + destinataire)
