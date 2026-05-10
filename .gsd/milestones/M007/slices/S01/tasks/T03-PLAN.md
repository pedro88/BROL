---
estimated_steps: 4
estimated_files: 2
skills_used: []
---

# T03: Implement computed OVERDUE status in loans queries

Modifier loans.ts router :
1. Dans lentOut, borrowed, history : calculer le statut OVERDUE à la volée (returnDueDate < NOW() && status === ACTIVE → OVERDUE)
2. Ajouter les tests pour la logique OVERDUE dans __tests__/loans.test.ts
3. Améliorer la include pour ramener toutes les infos nécessaires (object, borrower/owner)

## Inputs

- `packages/api/src/routers/loans.ts`

## Expected Output

- `OVERDUE detected on read queries`
- `Tests pour status computation`

## Verification

npx vitest run packages/api/src/routers/__tests__/loans.test.ts

## Observability Impact

Console.error on overdue computation failure
