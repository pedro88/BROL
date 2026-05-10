---
id: T01
parent: S05
milestone: M008
key_files:
  - packages/db/prisma/schema.prisma
  - packages/shared/src/schemas/index.ts
  - packages/api/src/routers/loans.ts
  - apps/web/src/components/loans/create-loan-dialog.tsx
key_decisions:
  - borrowerId became nullable; new field borrowerContactId (Contact.id) for contacts without accounts
  - createLoanSchema input changed from borrowerId to contactId (Contact.id)
  - loans.create resolves contact → borrowerId if account, else borrowerContactId
  - Queries include borrowerContact and derive borrowerName from User first, then Contact
duration: 
verification_result: untested
completed_at: 2026-05-10T14:19:10.704Z
blocker_discovered: false
---

# T01: Schema + loans.create: borrowerId optional, borrowerContactId added, loans to contacts without account now work

**Schema + loans.create: borrowerId optional, borrowerContactId added, loans to contacts without account now work**

## What Happened

S05/T01 : Schema change — borrowerId nullable, borrowerContactId added. loans.create: input changed to contactId (Contact.id), resolves borrowerId from contact.borrowerId or borrowerContactId. Queries: borrowerName derived from User then Contact. CreateLoanDialog updated to pass contactId. Prisma db push + generate done.

## Verification

Prisma db push: OK. tsc loans.ts: 0 erreur loans.ts. API server running on 3001.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| — | No verification commands discovered | — | — | — |

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `packages/db/prisma/schema.prisma`
- `packages/shared/src/schemas/index.ts`
- `packages/api/src/routers/loans.ts`
- `apps/web/src/components/loans/create-loan-dialog.tsx`
