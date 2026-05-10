---
estimated_steps: 3
estimated_files: 4
skills_used: []
---

# T01: Schema + loans.create: borrowerId optional, add borrowerContactId for non-account contacts

Schema Prisma: borrowerId nullable + borrowerContactId (Contact.id) nullable. Ajouter @@index. Contact: loansAsBorrowerContact. push + generate.

loans.ts: create receipt contactId, lookup contact, set borrowerId=contact.borrowerId|null et borrowerContactId=si!borrowerId then contact.id else null.

Queries: include borrowerContact, dériver borrowerName.

## Inputs

- `packages/db/prisma/schema.prisma`
- `packages/api/src/routers/loans.ts`
- `apps/web/src/components/loans/create-loan-dialog.tsx`

## Expected Output

- `packages/db/prisma/schema.prisma`
- `packages/api/src/routers/loans.ts`
- `apps/web/src/components/loans/create-loan-dialog.tsx`

## Verification

Prisma db push OK ; tsc loans.ts OK ; browser: prêt à contact sans account → créé, borrowerContactId setté, apparaît dans /loans
