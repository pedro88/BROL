---
id: S02
parent: M012
milestone: M012
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
completed_at: 2026-05-12T09:05:18.098Z
blocker_discovered: false
---

# S02: Photo dans formulaire objet + bouton prêt sur page prêts

**Formulaire objet avec photo + bouton prêt sur /loans**

## What Happened

S02 complète — 2/2 tâches faites. T01: champ coverImage URL dans ObjectForm (entre Notes et QR Code), redirect après création → /objects/[id]/edit, PhotoCapture intégré sur la page edit avec galerie des photos. T02: bouton "+ NOUVEAU PRÊT" dans le header /loans, ObjectPickerDialog avec recherche d'objets disponibles, CreateLoanDialogWrapper pour le cycle de vie.

## Verification

pnpm --filter @brol/web exec tsc --noEmit: 0 errors. T01 + T02 implémentées et compilables.

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
