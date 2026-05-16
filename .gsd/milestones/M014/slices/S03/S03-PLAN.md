# S03: Système de notification

**Goal:** Implémenter le système de notification (rappels retour/retard, demandes communauté, commentaires/notes)
**Demo:** Les utilisateurs reçoivent des notifications pour tous les événements importants

## Must-Haves

- Table Notification en DB (userId, type, titre, message, lu, relatedId, relatedType)
- Création automatique de notifications: rappel retour, rappel retard, nouvelle demande communauté, review reçu
- Page /notifications avec liste + badge sur l'icône de navigation
- Marquer comme lu (individuel + tous)
- Intégration email pour les rappels (vianodemailer ou Resend)

## Proof Level

- This slice proves: End-to-end test

## Verification

- Logs dans les procédures de création de notification

## Tasks

- [x] **T01: Ajouter table Notification au schéma Prisma** `est:small`
  Ajouter la table Notification (userId, type enum, titre, message, isRead, relatedId, relatedType, emailSentAt) au schéma Prisma
  - Files: `packages/db/prisma/schema.prisma`
  - Verify: pnpm generate

- [x] **T02: Créer router tRPC notification** `est:medium`
  Créer le router tRPC notification avec les endpoints: list, markRead, markAllRead, getUnreadCount, create (interne)
  - Files: `packages/api/src/routers/notification.ts`, `packages/api/src/router.ts`
  - Verify: pnpm --filter @brol/api build && pnpm --filter @brol/api test

- [x] **T03: Intégrer création automatique de notifications dans les routers** `est:medium`
  Ajouter des procédures triggerNotification dans les routers concernés (loans pour rappels, review pour review reçu, community-request pour nouvelles demandes)
  - Files: `packages/api/src/routers/loans.ts`, `packages/api/src/routers/review.ts`, `packages/api/src/routers/community-request.ts`
  - Verify: pnpm --filter @brol/api build && pnpm --filter @brol/api test

- [x] **T04: UI notifications (page + badge dans navigation)** `est:small`
  Ajouter un bouton avec badge (nb non lus) dans le header navigation, page /notifications
  - Files: `apps/web/src/app/notifications/`, `apps/web/src/components/navigation.tsx`
  - Verify: pnpm --filter @brol/web build

- [x] **T05: Email reminder integration** `est:medium`
  Créer la fonction sendReminderEmail utilisant Resend ou nodemailer pour envoyer les rappels de retour
  - Files: `packages/api/src/lib/email.ts`, `packages/api/src/emails/reminder.tsx`
  - Verify: pnpm --filter @brol/api build

- [x] **T06: E2E tests pour les notifications** `est:small`
  Écrire les tests E2E: affichage badge, liste notifications, marquer lu
  - Files: `apps/web/e2e/notifications.spec.ts`
  - Verify: pnpm --filter @brol/web test:e2e

## Files Likely Touched

- packages/db/prisma/schema.prisma
- packages/api/src/routers/notification.ts
- packages/api/src/router.ts
- packages/api/src/routers/loans.ts
- packages/api/src/routers/review.ts
- packages/api/src/routers/community-request.ts
- apps/web/src/app/notifications/
- apps/web/src/components/navigation.tsx
- packages/api/src/lib/email.ts
- packages/api/src/emails/reminder.tsx
- apps/web/e2e/notifications.spec.ts
