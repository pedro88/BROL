---
id: S01
parent: M007
milestone: M007
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
  - Computed OVERDUE at read time avoids cron job
  - Contact borrowerId optional link to Brol user
observability_surfaces:
  - none
drill_down_paths:
  - .gsd/milestones/M007/slices/S01/tasks/T01-SUMMARY.md
  - .gsd/milestones/M007/slices/S01/tasks/T02-SUMMARY.md
  - .gsd/milestones/M007/slices/S01/tasks/T03-SUMMARY.md
  - .gsd/milestones/M007/slices/S01/tasks/T04-SUMMARY.md
duration: ""
verification_result: passed
completed_at: 2026-05-10T06:31:40.846Z
blocker_discovered: false
---

# S01: Schema + API loans/contacts

**S01: Schema + API loans/contacts complete**

## What Happened

S01 completed successfully. Prisma schema updated with borrowerId on Contact. All loans queries (lentOut, borrowed, history) now compute OVERDUE status at read time by comparing returnDueDate with current date. contacts.get and contacts.loansForContact include loan history with computed status. 32 Vitest tests pass including new coverage for all S01 features. Database synced via prisma db push.

## Verification

32 Vitest tests pass, schema synced, prisma client generated

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

None.

## Known Limitations

None.

## Follow-ups

None.

## Files Created/Modified

- `packages/db/prisma/schema.prisma` — Add borrowerId field and indexes to Contact model
- `packages/api/src/routers/contacts.ts` — Add loansForContact query, include loans in get response with computed OVERDUE
- `packages/api/src/routers/loans.ts` — Implement computed OVERDUE status in lentOut, borrowed, history queries
- `packages/api/src/routers/__tests__/contacts.test.ts` — 17 tests for contacts router including loansForContact and OVERDUE
- `packages/api/src/routers/__tests__/loans.test.ts` — 15 tests for loans router including OVERDUE computed status
