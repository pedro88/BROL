---
id: T05
parent: S01
milestone: M014
key_files:
  - apps/web/src/components/profile/leave-review-dialog.tsx
  - apps/web/src/app/profile/[id]/page.tsx
key_decisions:
  - (none)
duration: 
verification_result: passed
completed_at: 2026-05-14T06:53:06.071Z
blocker_discovered: false
---

# T05: Dialog pour Laisser un avis intégrée à la page profil

**Dialog pour Laisser un avis intégrée à la page profil**

## What Happened

Dialog modale pour laisser un avis intégrée à la page profil. Formulaire avec StarRating interactif, Textarea pour le commentaire optionnel, validation rating required, soumission via review.create mutation.

## Verification

pnpm build

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `pnpm --filter @brol/web build` | 0 | ✅ pass | 4200ms |

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `apps/web/src/components/profile/leave-review-dialog.tsx`
- `apps/web/src/app/profile/[id]/page.tsx`
