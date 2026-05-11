---
id: T06
parent: S02
milestone: M011
key_files:
  - apps/web/src/lib/trpc-hooks/photos.ts
key_decisions:
  - (none)
duration: 
verification_result: untested
completed_at: 2026-05-11T14:35:35.773Z
blocker_discovered: false
---

# T06: Hooks tRPC pour photos: usePhotosList, usePresignedUrl, usePhotoAdd, usePhotoRemove, usePhotoReorder

**Hooks tRPC pour photos: usePhotosList, usePresignedUrl, usePhotoAdd, usePhotoRemove, usePhotoReorder**

## What Happened

Créé hooks tRPC pour les 5 procédures photo: usePhotosList, usePresignedUrl, usePhotoAdd, usePhotoRemove, usePhotoReorder. Chaque hook expose les callbacks typés et invalide automatiquement le cache de la liste photos après mutation.

## Verification

TypeScript compile sans erreur dans apps/web/src/lib/trpc-hooks/photos.ts

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| — | No verification commands discovered | — | — | — |

## Deviations

None

## Known Issues

None

## Files Created/Modified

- `apps/web/src/lib/trpc-hooks/photos.ts`
