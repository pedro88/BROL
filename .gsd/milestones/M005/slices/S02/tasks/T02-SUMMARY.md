---
id: T02
parent: S02
milestone: M005
key_files:
  - apps/web/src/app/page.tsx
key_decisions:
  - (none)
duration: 
verification_result: untested
completed_at: 2026-05-08T06:51:17.469Z
blocker_discovered: false
---

# T02: Replaced mock dashboard data with real tRPC queries for objects, contacts, and active loans.

**Replaced mock dashboard data with real tRPC queries for objects, contacts, and active loans.**

## What Happened

Replaced all hardcoded mock values in page.tsx. Converted to client component ("use client"). Added trpc collections.list query to sum objectCount for total objects, contacts.list for contact count, loans.lentOut for active loans count. Added loading states ("...") during fetch. Enhanced the "retours récents" section to show actual active loan cards with object name, borrower, and due date (or empty state). No more '24', '3', '12' hardcoded values.

## Verification

grep confirms no hardcoded '24', '3', '12' in page.tsx. grep shows trpc.collections.list, trpc.contacts.list, trpc.loans.lentOut useQuery calls. Network trace showed GET /api/trpc/collections.list,contacts.list,loans.lentOut?batch=1 → 200.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| — | No verification commands discovered | — | — | — |

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `apps/web/src/app/page.tsx`
