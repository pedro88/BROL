# S05: Loans to contacts without Brol account

**Goal:** Permettre de prêter un objet à un contact même s'il n'a pas de compte Brol. loans.create reçoit contactId, résout borrowerId (si compte) ou borrowerContactId (si pas de compte).
**Demo:** Après S05 : je peux prêter un objet à un contact même sans compte Brol

## Must-Haves

- Contact sans borrowerId → prêt créé avec borrowerContactId (pas d'erreur 500)\n- Prêt visible dans /loans avec le bon nom\n- Contact avec compte → fonctionne aussi (borrowerId setté, borrowerContactId=null)\n- Queries (lentOut/history) : borrowerName = User.name si account, sinon Contact.name

## Proof Level

- This slice proves: Browser: prêt à un contact sans account → créé → apparaît dans /loans avec le nom du contact.

## Integration Closure

Les prêts existants restent compatibles (champs nullables). Les queries affichent le bon nom d'emprunteur (User优先 > Contact).

## Verification

- N/A — schema + API change

## Tasks

- [x] **T01: Schema + loans.create: borrowerId optional, add borrowerContactId for non-account contacts** `est:3h`
  Schema Prisma: borrowerId nullable + borrowerContactId (Contact.id) nullable. Ajouter @@index. Contact: loansAsBorrowerContact. push + generate.
  - Files: `packages/db/prisma/schema.prisma`, `packages/shared/src/schemas/index.ts`, `packages/api/src/routers/loans.ts`, `apps/web/src/components/loans/create-loan-dialog.tsx`
  - Verify: Prisma db push OK ; tsc loans.ts OK ; browser: prêt à contact sans account → créé, borrowerContactId setté, apparaît dans /loans

## Files Likely Touched

- packages/db/prisma/schema.prisma
- packages/shared/src/schemas/index.ts
- packages/api/src/routers/loans.ts
- apps/web/src/components/loans/create-loan-dialog.tsx
