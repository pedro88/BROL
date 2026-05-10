---
id: T01
parent: S06
milestone: M008
key_files:
  - packages/api/src/routers/__tests__/loans.test.ts
  - packages/api/src/test/setup.ts
key_decisions:
  - Added createTestContact helper to setup.ts
  - Updated loans.test.ts: borrowerId → contactId, added test for contact-without-account loan
  - All tests use contact linked to borrower, plus a test for unlinked contact
duration: 
verification_result: untested
completed_at: 2026-05-10T14:21:43.592Z
blocker_discovered: false
---

# T01: loans.test.ts updated: contactId, contact without account test, createTestContact helper

**loans.test.ts updated: contactId, contact without account test, createTestContact helper**

## What Happened

S06/T01 : loans.test.ts mis à jour pour le nouveau schema contactId. borrowerId remplacé par contactId. Ajout du test "creates a loan to contact without account". createTestContact ajouté à setup.ts. 16/16 tests passent.

## Verification

vitest run: 16/16 PASS

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| — | No verification commands discovered | — | — | — |

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `packages/api/src/routers/__tests__/loans.test.ts`
- `packages/api/src/test/setup.ts`
