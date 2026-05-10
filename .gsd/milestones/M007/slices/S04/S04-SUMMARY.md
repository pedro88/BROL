---
id: S04
parent: M007
milestone: M007
provides:
  - (none)
requires:
  - slice: S02
    provides: Query invalidation after create
  - slice: S03
    provides: Contact list for selector
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
  - .gsd/milestones/M007/slices/S04/tasks/T01-SUMMARY.md
  - .gsd/milestones/M007/slices/S04/tasks/T02-SUMMARY.md
  - .gsd/milestones/M007/slices/S04/tasks/T03-SUMMARY.md
duration: ""
verification_result: passed
completed_at: 2026-05-10T07:49:58.946Z
blocker_discovered: false
---

# S04: Web loan creation

**S04: Loan creation from object detail done**

## What Happened

S04: Loan creation integrated into object detail page. CreateLoanDialog component with contact selector, date picker, notes. Button label changes based on current loan status. On success, navigates to /loans and invalidates relevant queries.

## Verification

Button, dialog, mutation, navigation all wired

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

- `apps/web/src/components/loans/create-loan-dialog.tsx` — CreateLoanDialog with contact selector + date + notes
- `apps/web/src/app/objects/[id]/page.tsx` — Loan button integrated, hasActiveLoan detection, current loan display
