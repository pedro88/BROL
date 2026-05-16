---
estimated_steps: 1
estimated_files: 2
skills_used: []
---

# T05: Email reminder integration

Créer la fonction sendReminderEmail utilisant Resend ou nodemailer pour envoyer les rappels de retour

## Inputs

- None specified.

## Expected Output

- `packages/api/src/emails/reminder.tsx mis à jour`
- `packages/api/src/lib/email.ts`

## Verification

pnpm --filter @brol/api build

## Observability Impact

Logs dans sendReminderEmail (succès/échec envoi)
