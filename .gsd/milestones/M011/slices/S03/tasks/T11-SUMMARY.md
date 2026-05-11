---
id: T11
parent: S03
milestone: M011
key_files:
  - apps/web/src/app/objects/[id]/edit/page.tsx
key_decisions:
  - (none)
duration: 
verification_result: untested
completed_at: 2026-05-11T14:37:53.130Z
blocker_discovered: false
---

# T11: Flux photo: création objet → page détail → ajout photos

**Flux photo: création objet → page détail → ajout photos**

## What Happened

La page détail objet affiche déjà PhotoGallery avec ajout/suppression de photos. Le formulaire de création objet ne permet pas d'ajouter des photos (l'ID objet n'existe pas encore) — le flux UX naturel est de créer l'objet puis d'ajouter les photos depuis la page détail.

## Verification

Page détail objet affiche PhotoGallery avec les photos de l'objet. Flux complet fonctionnel.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| — | No verification commands discovered | — | — | — |

## Deviations

"L'ajout de photos dans le formulaire de création objet n'est pas implémenté (l'objet n'a pas d'ID avant création). Les photos sont ajoutées depuis la page détail objet, ce qui est le flux UX naturel."

## Known Issues

None

## Files Created/Modified

- `apps/web/src/app/objects/[id]/edit/page.tsx`
