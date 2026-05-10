# S01: Schema + API loans/contacts

**Goal:** Ajouter la relation loans sur Contact, créer contact.loansForContact, détecter OVERDUE à la volée dans les queries loans, améliorer les routers existants
**Demo:** Loan visible en API avec borrower, history-query fonctionne

## Must-Haves

- Contact.get inclut array loans
- loans.lentOut affiche correctement OVERDUE (date comparison)
- Tests Vitest contacts + loans passent

## Proof Level

- This slice proves: Tests Vitest passent, queries manuelles fonctionnelles

## Integration Closure

API loans/contacts fonctionnelle avec données cohérentes

## Verification

- Logs sur erreurs de création de prêt et envoi de rappel

## Tasks

- [x] **T01: Add Contact.loans relation in Prisma schema** `est:30min`
  Modifier le schema Prisma :
  1. Ajouter `loans Loan[]` sur le model Contact
  2. Générer la migration SQL
  3. Appliquer `prisma migrate dev`
  4. Vérifier que le champ est bien en base
  - Files: `packages/db/prisma/schema.prisma`
  - Verify: npx prisma migrate status && npx prisma db pull (dry-run)

- [x] **T02: Add loansForContact query to contacts router** `est:1h`
  Modifier contacts.ts router :
  1. Ajouter loansForContact query sur le router contacts
  2. Inclure les loans dans get() pour avoir l'historique complet
  3. Gérer le computed status OVERDUE (comparer returnDueDate avec NOW())
  - Files: `packages/api/src/routers/contacts.ts`
  - Verify: npx vitest run packages/api/src/routers/__tests__/contacts.test.ts

- [x] **T03: Implement computed OVERDUE status in loans queries** `est:1h`
  Modifier loans.ts router :
  1. Dans lentOut, borrowed, history : calculer le statut OVERDUE à la volée (returnDueDate < NOW() && status === ACTIVE → OVERDUE)
  2. Ajouter les tests pour la logique OVERDUE dans __tests__/loans.test.ts
  3. Améliorer la include pour ramener toutes les infos nécessaires (object, borrower/owner)
  - Files: `packages/api/src/routers/loans.ts`, `packages/api/src/routers/__tests__/loans.test.ts`
  - Verify: npx vitest run packages/api/src/routers/__tests__/loans.test.ts

- [x] **T04: Add/update Vitest tests for S01 features** `est:30min`
  Pour T02 et T03, les tests doivent vérifier :
  1. contacts.loansForContact retourne l'historique complet
  2. loans.lentOut affiche OVERDUE pour les prêts en retard
  3. loans.borrowed affiche OVERDUE pour les emprunts en retard
  Lancer les tests avec DATABASE_URL configuré.
  - Files: `packages/api/src/routers/__tests__/contacts.test.ts`, `packages/api/src/routers/__tests__/loans.test.ts`
  - Verify: DATABASE_URL="postgresql://postgres:password@localhost:5432/brol_test?schema=public" npx vitest run packages/api/src/routers/__tests__/loans.test.ts packages/api/src/routers/__tests__/contacts.test.ts

## Files Likely Touched

- packages/db/prisma/schema.prisma
- packages/api/src/routers/contacts.ts
- packages/api/src/routers/loans.ts
- packages/api/src/routers/__tests__/loans.test.ts
- packages/api/src/routers/__tests__/contacts.test.ts
