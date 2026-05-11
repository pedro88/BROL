---
id: S02
parent: M011
milestone: M011
provides:
  - PhotoCapture component: <PhotoCapture objectId={id} onPhotoAdded={fn} />
  - PhotoGallery component: <PhotoGallery objectId={id} />
  - duckduckgo.ts: searchDuckDuckGoImages(query) + proxyImageUrl(url)
requires:
  - slice: packages/api/src/lib/s3.ts (S01)
    provides: 
  - slice: packages/api/src/routers/photos.ts (S01)
    provides: 
affects:
  []
key_files:
  - apps/web/src/components/photos/photo-capture.tsx
  - apps/web/src/components/photos/photo-gallery.tsx
  - apps/web/src/lib/duckduckgo.ts
key_decisions:
  - (none)
patterns_established:
  - Upload 3 étapes: presigned URL → PUT S3 → photo.add
  - Dialog inline avec onglets pour les 3 sources photo
observability_surfaces:
  - none
drill_down_paths:
  - .gsd/milestones/M011/slices/S02/tasks/T06-SUMMARY.md
  - .gsd/milestones/M011/slices/S02/tasks/T07-SUMMARY.md
  - .gsd/milestones/M011/slices/S02/tasks/T08-SUMMARY.md
  - .gsd/milestones/M011/slices/S02/tasks/T09-SUMMARY.md
duration: ""
verification_result: passed
completed_at: 2026-05-11T14:36:25.743Z
blocker_discovered: false
---

# S02: Composant capture/upload photo

**Composant PhotoCapture et PhotoGallery intégrés dans la page objet**

## What Happened

Composant PhotoCapture réutilisable avec 3 sources (fichier, caméra mobile, DuckDuckGo Images). Dialog avec onglets, preview, status management. Hooks tRPC typed pour toutes les opérations. PhotoGallery avec grille, suppression avec confirmation, intégration transparente dans la page détail objet.

## Verification

TypeScript compile sans erreur sur apps/web. Les composants sont intégrés dans la page objet. En attente de credentials S3 pour test d'upload complet.

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

DuckDuckGo parsing HTML est fragile — la recherche peut retourner 0 résultats si DDG change sa structure. Prévoir fallback Unsplash API si ça devient problématique.

## Follow-ups

None

## Files Created/Modified

- `apps/web/src/lib/trpc-hooks/photos.ts (new)` — 
- `apps/web/src/components/photos/photo-capture.tsx (new)` — 
- `apps/web/src/components/photos/photo-gallery.tsx (new)` — 
- `apps/web/src/lib/duckduckgo.ts (new)` — 
- `apps/web/src/app/objects/[id]/page.tsx (+PhotoGallery)` — 
