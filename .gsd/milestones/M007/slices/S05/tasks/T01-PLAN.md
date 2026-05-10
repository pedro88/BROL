---
estimated_steps: 4
estimated_files: 2
skills_used: []
---

# T01: Implement email reminder via Resend

1. Ajouter RESEND_API_KEY dans .env.example
2. Implémenter sendReminderEmail() dans le loans router
3. Appeler sendReminderEmail() dans loans.remind
4. Gérer les erreurs proprement (log + retour user)

## Inputs

- `packages/api/src/routers/loans.ts`

## Expected Output

- `Fonction sendReminderEmail implémentée`

## Verification

Email envoyé quand loans.remind appelé

## Observability Impact

Logs sur erreur d'envoi email
