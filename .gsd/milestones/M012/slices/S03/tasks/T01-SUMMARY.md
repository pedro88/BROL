---
id: T01
parent: S03
milestone: M012
key_files:
  - packages/api/src/routers/contacts.ts
key_decisions:
  - search param added to contacts.list with OR filter on name and email (mode insensitive)
duration: 
verification_result: passed
completed_at: 2026-05-12T09:20:59.608Z
blocker_discovered: false
---

# T01: search param sur contacts.list API

**search param sur contacts.list API**

## What Happened

Ajouté search?: string sur le input de contacts.list. Le where clause filtre sur name OR email en insensitive. Backwards compatible — si search absent, toutes les entrées sont retournées.

## Verification

pnpm build: 0 errors. API contacts.list accepte maintenant search param.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `pnpm build 2>&1 | tail -5` | 0 | ✅ pass | 25000ms |

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `packages/api/src/routers/contacts.ts`
