---
id: T01
parent: S03
milestone: M009
key_files:
  - (none)
key_decisions:
  - (none)
duration: 
verification_result: untested
completed_at: 2026-05-11T07:32:36.489Z
blocker_discovered: false
---

# T01: ObjectForm adaptatif par type de collection

**ObjectForm adaptatif par type de collection**

## What Happened

ObjectForm restructuré avec champs adaptatifs selon collection.type. Indicateur de type en badge. Label/placeholder auteur change selon type (Auteur/Réalisateur/Artiste/Marque). Champs conditionnels: ISBN (BOOK/FILM), playersMin/Max/playingTimeMinutes/ageMin (BOARD_GAME), powerWatts (ELECTRIC), customField1/2 avec labels depuis collection (CUSTOM). Placeholder du nom adapté par type. submit passe objectType au router.

## Verification

tsc --noEmit: 0 errors dans object-form.tsx ✅"

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| — | No verification commands discovered | — | — | — |

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

None.
