# S02: loans.create — graceful error on missing borrower

**Goal:** Remplacer les throw new Error() par des TRPCError structurées avec message lisible dans loans.create.
**Demo:** Après S02 : la création d'un prêt affiche une erreur lisible 'Emprunteur non trouvé — crées-en un d'abord' au lieu d'une 500.

## Must-Haves

- loans.create retourne une TRPCError avec code 'NOT_FOUND' et message lisible quand borrowerId n'est pas un User.id\n- Message UI affiché dans le toast du client

## Proof Level

- This slice proves: Vérification manuelle : ouvrir CreateLoanDialog avec un contact sans borrowerId → erreur claire ; avec un contact ayant borrowerId → prêt créé.

## Integration Closure

Les autres procédures loans (return, remind, cancel) utilisent le même pattern d'erreur — vérifiable par les tests existants.

## Verification

- N/A — bug fix

## Tasks

- [x] **T01: Convert loans.create throws to TRPCError with readable messages** `est:1h`
  1. Lire packages/api/src/routers/loans.ts (partie create)
  2. Remplacer les `throw new Error('Emprunteur non trouvé')` par `throw new TRPCError({ code: 'NOT_FOUND', message: '...' })`
  3. Importer TRPCError depuis '../trpc'
  4. Vérifier que les autres throws (objet non trouvé, déjà prêté) sont aussi convertis
  5. Vérifier que le client (CreateLoanDialog) affiche correctement le message dans le toast
  - Files: `packages/api/src/routers/loans.ts`
  - Verify: Test API direct : appeler loans.create avec borrowerId invalide → réponse NOT_FOUND avec message lisible (pas 500)

## Files Likely Touched

- packages/api/src/routers/loans.ts
