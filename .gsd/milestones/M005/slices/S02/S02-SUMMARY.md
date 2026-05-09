---
id: S02
parent: M005
milestone: M005
provides:
  - ["Dashboard with live DB data instead of hardcoded values"]
requires:
  []
affects:
  []
key_files:
  - ["packages/api/src/routers/collections.ts", "packages/api/src/routers/contacts.ts", "packages/api/src/routers/loans.ts", "apps/web/src/app/page.tsx"]
key_decisions:
  - ["No dedicated stats endpoint needed — derive totals from collections.list (sum objectCount), contacts.list (length), loans.lentOut (length)"]
patterns_established:
  - (none)
observability_surfaces:
  - ["Loading indicators on stat cards during fetch", "Graceful empty state when no loans active"]
drill_down_paths:
  []
duration: ""
verification_result: passed
completed_at: 2026-05-08T06:51:42.956Z
blocker_discovered: false
---

# S02: Supprimer les données mock du dashboard

**Replaced mock data with real tRPC queries — dashboard now shows real object count, contacts, active loans from DB.**

## What Happened

S02 replaced mock dashboard data with real tRPC calls. Page converted to client component. Three queries in parallel batch: collections.list (sum objectCount), contacts.list (array length), loans.lentOut (active loans length). Network confirmed all three load in a single batched request to the API. Loading and empty states handled. The "returns" section now shows actual active loans with object name, borrower, and due date.

## Verification

Network trace: GET /api/trpc/collections.list,contacts.list,loans.lentOut?batch=1 → 200. grep confirms no hardcoded mock values in page.tsx.

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

None.
