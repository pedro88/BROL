---
id: S06
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
completed_at: 2026-05-10T14:22:10.716Z
blocker_discovered: false
---

# S06: Fix loans.test.ts for new schema

**loans.test.ts updated for contactId schema, 16/16 tests pass**

## What Happened

S06/T01 exécuté. loans.test.ts mis à jour: borrowerId → contactId. Nouveau test "creates a loan to contact without account" ajouté. createTestContact helper ajouté à setup.ts. 16/16 tests passent.

## Verification

vitest run: 16/16 PASS

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

Aucun.

## Known Limitations

None.

## Follow-ups

None.

## Files Created/Modified

- `packages/api/src/routers/__tests__/loans.test.ts` — Updated: borrowerId → contactId in all create() calls; added loan to unlinked contact test; import createTestContact
- `packages/api/src/test/setup.ts` — Added createTestContact(ownerId, overrides): creates Contact with borrowerId support
