---
estimated_steps: 5
estimated_files: 1
skills_used: []
---

# T03: Add return loan action

1. Ajouter le bouton 'Marquer comme rendu' sur chaque carte de prêt (pour owner only)
2. Implémenter la mutation loans.return() via tRPC
3. Invalidated la query loans.lentOut après le retour
4. Ajouter un toast/success message après le retour
5. Gérer les erreurs (toast error)

## Inputs

- `packages/api/src/routers/loans.ts`
- `packages/api/src/lib/trpc.ts`

## Expected Output

- `Bouton retour fonctionnel`

## Verification

Cliquer sur 'Rendu' → prêt disappear de la liste Prêtés

## Observability Impact

Logs sur erreur de return
