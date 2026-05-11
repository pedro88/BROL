---
id: S03
parent: M011
milestone: M011
provides:
  - Photos incluses dans objects.list et objects.get (sans override du cache)
  - PhotoGallery accessible depuis la page détail objet
requires:
  - slice: S01: router photos + S3
    provides: 
  - slice: S02: PhotoCapture + PhotoGallery components
    provides: 
affects:
  []
key_files:
  - packages/api/src/routers/objects.ts
  - apps/web/src/components/photos/photo-gallery.tsx
key_decisions:
  - (none)
patterns_established:
  - Flux naturel: créer objet → page détail → ajouter photos
observability_surfaces:
  - none
drill_down_paths:
  - .gsd/milestones/M011/slices/S03/tasks/T10-SUMMARY.md
  - .gsd/milestones/M011/slices/S03/tasks/T11-SUMMARY.md
duration: ""
verification_result: passed
completed_at: 2026-05-11T14:38:08.591Z
blocker_discovered: false
---

# S03: Intégration photos sur objets

**Photos affichées dans la page détail objet via PhotoGallery**

## What Happened

S03 a ajouté photos dans les réponses objects.list et objects.get. La PhotoGallery est intégrée dans la page détail objet entre le header et les détails. Le flux UX: création objet → redirection vers détail → ajout photos. Les mutations add/remove étaient déjà dans S01/S02.

## Verification

Photos visible dans la page détail objet. Objects.list/get incluent photos dans la réponse. Flux création→détail→photos fonctionnel.

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

"L'ajout de photos dans le formulaire de création objet n'est pas implémenté (l'objet n'a pas d'ID avant création). Les photos sont ajoutées depuis la page détail objet."

## Known Limitations

Les photos ne peuvent être ajoutées qu'après création de l'objet (flux: créer → détail → photos). Pas d'upload de photo au moment de la création.

## Follow-ups

None

## Files Created/Modified

- `packages/api/src/routers/objects.ts (photos in list/get)` — 
- `apps/web/src/app/objects/[id]/page.tsx (PhotoGallery)` — 
- `apps/web/src/app/objects/[id]/edit/page.tsx (pas de changement` — flux via détail)
