---
estimated_steps: 1
estimated_files: 2
skills_used: []
---

# T04: UI notifications (page + badge dans navigation)

Ajouter un bouton avec badge (nb non lus) dans le header navigation, page /notifications

## Inputs

- `packages/api/src/routers/notification.ts`

## Expected Output

- `apps/web/src/app/notifications/page.tsx`
- `apps/web/src/components/navigation.tsx mis à jour`

## Verification

pnpm --filter @brol/web build
