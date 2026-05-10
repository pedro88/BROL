---
estimated_steps: 5
estimated_files: 1
skills_used: []
---

# T04: Add reminder action

1. Ajouter le bouton 'Rappel' sur chaque carte de prêt en retard
2. Implémenter la mutation loans.remind() via tRPC
3. Montrer un feedback (toast) quand le rappel est envoyé
4. Désactiver le bouton si reminderSentAt est recent (< 24h)
5. Gérer les erreurs gracieusement

## Inputs

- `packages/api/src/routers/loans.ts`

## Expected Output

- `Bouton rappel fonctionnel`

## Verification

Cliquer sur 'Rappel' → toast de confirmation

## Observability Impact

Logs sur erreur de remind
