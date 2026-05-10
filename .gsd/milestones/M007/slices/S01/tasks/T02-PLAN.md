---
estimated_steps: 4
estimated_files: 1
skills_used: []
---

# T02: Add loansForContact query to contacts router

Modifier contacts.ts router :
1. Ajouter loansForContact query sur le router contacts
2. Inclure les loans dans get() pour avoir l'historique complet
3. Gérer le computed status OVERDUE (comparer returnDueDate avec NOW())

## Inputs

- `packages/api/src/routers/contacts.ts`
- `packages/shared/src/schemas/index.ts`

## Expected Output

- `contacts.loansForContact query`
- `contacts.get inclut loans avec computed status`

## Verification

npx vitest run packages/api/src/routers/__tests__/contacts.test.ts

## Observability Impact

Error logs sur loansForContact failures
