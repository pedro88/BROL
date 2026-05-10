---
id: S05
parent: M008
milestone: M008
provides:
  - (none)
requires:
  []
affects:
  []
key_files:
  - (none)
key_decisions:
  - (none)
patterns_established:
  - (none)
observability_surfaces:
  - none
drill_down_paths:
  []
duration: ""
verification_result: passed
completed_at: 2026-05-10T14:19:30.740Z
blocker_discovered: false
---

# S05: Loans to contacts without Brol account

**Loans to contacts without account: schema change + loans.create resolver + queries with borrowerName**

## What Happened

S05/T01 exécuté. borrowerId rendu nullable, borrowerContactId ajouté. loans.create reçoit contactId, résout automatiquement borrowerId (si contact.borrowerId) ou borrowerContactId. Les queries incluent borrowerContact et dérivent borrowerName correctement.

## Verification

Prisma db push OK. tsc loans.ts: 0 erreur sur loans.ts. API server running.

## Requirements Advanced

None.

## Requirements Validated

None.

## New Requirements Surfaced

None.

## Requirements Invalidated or Re-scoped

None.

## Operational Readiness

None.

## Deviations

Aucun. Le work a été fait en advance et correspond au plan.

## Known Limitations

None.

## Follow-ups

None.

## Files Created/Modified

- `packages/db/prisma/schema.prisma` — Schema: borrowerId nullable, borrowerContactId (Contact.id) nullable, borrowerContact relation on Contact, @@index on borrowerContactId
- `packages/shared/src/schemas/index.ts` — createLoanSchema input: borrowerId → contactId
- `packages/api/src/routers/loans.ts` — create: contactId → resolve borrowerId or borrowerContactId; all queries include borrowerContact, derive borrowerName
- `apps/web/src/components/loans/create-loan-dialog.tsx` — borrowerId → contactId in createLoanDialog
