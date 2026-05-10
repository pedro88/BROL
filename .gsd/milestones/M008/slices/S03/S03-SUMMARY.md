---
id: S03
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
completed_at: 2026-05-10T13:54:53.599Z
blocker_discovered: false
---

# S03: Fix dead /loans/new link

**Dashboard: /loans/new → /loans routing fix**

## What Happened

S03/T01 : lien /loans/new → /loans dans le QuickAction du dashboard. Vérification que /loans existe et fonctionne.

## Verification

Navigation manuelle : dashboard → /loans → 200 OK

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

Néant.

## Known Limitations

None.

## Follow-ups

None.

## Files Created/Modified

- `apps/web/src/app/page.tsx` — Replaced href=/loans/new → href=/loans in QuickAction
