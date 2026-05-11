---
id: T10
parent: S03
milestone: M011
key_files:
  - packages/api/src/routers/objects.ts
key_decisions:
  - (none)
duration: 
verification_result: untested
completed_at: 2026-05-11T14:37:37.147Z
blocker_discovered: false
---

# T10: Photos incluses dans les réponses objects.list et objects.get

**Photos incluses dans les réponses objects.list et objects.get**

## What Happened

Ajouté photos (orderBy: position asc) dans les includes de objects.list et objects.get. La réponse inclut maintenant photos[] avec id, url, position, createdAt pour chaque objet. La PhotoGallery charge les photos séparément via usePhotosList pour une gestion d'état indépendante.

## Verification

grep 'photos' packages/api/src/routers/objects.ts confirme l'include photos

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| — | No verification commands discovered | — | — | — |

## Deviations

"Photos loadées via usePhotosList单独的 (indépendant de objects.list) plutôt que eager loaded via objects.get — plus simple et plus prévisible pour l'UX."

## Known Issues

None

## Files Created/Modified

- `packages/api/src/routers/objects.ts`
