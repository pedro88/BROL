# S05: Email reminders avec Resend

**Goal:** Intégrer Resend pour l'envoi de rappels par email, avec template email
**Demo:** Email de rappel reçu dans la vraie boîte mail

## Must-Haves

- RESEND_API_KEY configurée
- Email reminder envoyé lors du remind
- Template email correct (objet, dates, contact)

## Proof Level

- This slice proves: Email reçu lors du test de rappel

## Integration Closure

Fonction email reminder complète en production

## Verification

- Logs d'envoi email, erreurs Resend

## Tasks

- [x] **T01: Implement email reminder via Resend** `est:1h30`
  1. Ajouter RESEND_API_KEY dans .env.example
  2. Implémenter sendReminderEmail() dans le loans router
  3. Appeler sendReminderEmail() dans loans.remind
  4. Gérer les erreurs proprement (log + retour user)
  - Files: `packages/api/src/routers/loans.ts`, `.env.example`
  - Verify: Email envoyé quand loans.remind appelé

- [x] **T02: Create email template for reminders** `est:30min`
  Créer un template HTML email pour le rappel avec objet, dates, contact, message personnalisé
  - Files: `packages/api/src/emails/reminder.tsx`
  - Verify: Template génère HTML correct

## Files Likely Touched

- packages/api/src/routers/loans.ts
- .env.example
- packages/api/src/emails/reminder.tsx
