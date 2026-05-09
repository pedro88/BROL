---
id: T01
parent: S02
milestone: M005
key_files:
  - packages/api/src/routers/objects.ts
  - packages/api/src/routers/contacts.ts
  - packages/api/src/routers/loans.ts
  - packages/api/src/routers/collections.ts
key_decisions:
  - Pas de nouveau endpoint stats nécessaire — collections.list donne objectCount, contacts.list et loans.lentOut suffisent
duration: 
verification_result: untested
completed_at: 2026-05-08T06:39:04.666Z
blocker_discovered: false
---

# T01: Identified tRPC endpoints for dashboard stats: collections.list (with objectCount), contacts.list, loans.lentOut.

**Identified tRPC endpoints for dashboard stats: collections.list (with objectCount), contacts.list, loans.lentOut.**

## What Happened

Identified available tRPC endpoints for dashboard stats: collections.list returns items with objectCount per collection, contacts.list returns all user contacts, loans.lentOut returns active loans. No need for a dedicated stats endpoint — can derive totals from existing endpoints.

## Verification

grep -n 'list\|count\|stats' packages/api/src/routers/*.ts confirmed all available endpoints: collections.list (has _count.objects), objects.list (requires collectionId), contacts.list, loans.lentOut (ACTIVE/OVERDUE loans).

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| — | No verification commands discovered | — | — | — |

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `packages/api/src/routers/objects.ts`
- `packages/api/src/routers/contacts.ts`
- `packages/api/src/routers/loans.ts`
- `packages/api/src/routers/collections.ts`
