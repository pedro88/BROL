---
estimated_steps: 5
estimated_files: 1
skills_used: []
---

# T01: Convert loans.create throws to TRPCError with readable messages

1. Lire packages/api/src/routers/loans.ts (partie create)
2. Remplacer les `throw new Error('Emprunteur non trouvé')` par `throw new TRPCError({ code: 'NOT_FOUND', message: '...' })`
3. Importer TRPCError depuis '../trpc'
4. Vérifier que les autres throws (objet non trouvé, déjà prêté) sont aussi convertis
5. Vérifier que le client (CreateLoanDialog) affiche correctement le message dans le toast

## Inputs

- `packages/api/src/routers/loans.ts`
- `packages/api/src/trpc/index.ts (TRPCError import)`

## Expected Output

- `packages/api/src/routers/loans.ts`

## Verification

Test API direct : appeler loans.create avec borrowerId invalide → réponse NOT_FOUND avec message lisible (pas 500)

## Observability Impact

N/A — bug fix
