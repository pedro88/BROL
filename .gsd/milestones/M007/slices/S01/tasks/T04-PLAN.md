---
estimated_steps: 5
estimated_files: 2
skills_used: []
---

# T04: Add/update Vitest tests for S01 features

Pour T02 et T03, les tests doivent vérifier :
1. contacts.loansForContact retourne l'historique complet
2. loans.lentOut affiche OVERDUE pour les prêts en retard
3. loans.borrowed affiche OVERDUE pour les emprunts en retard
Lancer les tests avec DATABASE_URL configuré.

## Inputs

- `packages/api/src/routers/__tests__/contacts.test.ts`
- `packages/api/src/routers/__tests__/loans.test.ts`

## Expected Output

- `Tests Vitest passent`

## Verification

DATABASE_URL="postgresql://postgres:password@localhost:5432/brol_test?schema=public" npx vitest run packages/api/src/routers/__tests__/loans.test.ts packages/api/src/routers/__tests__/contacts.test.ts
