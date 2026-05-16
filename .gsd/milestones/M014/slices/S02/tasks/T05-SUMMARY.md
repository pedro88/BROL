---
id: T05
parent: S02
milestone: M014
key_files:
  - apps/web/src/app/objects/[id]/page.tsx
key_decisions:
  - (none)
duration: 
verification_result: passed
completed_at: 2026-05-14T07:11:27.763Z
blocker_discovered: false
---

# T05: Bouton demande communauté ajouté sur page objet

**Bouton demande communauté ajouté sur page objet**

## What Happened

Bouton "Demander à la communauté" ajouté sur la page /objects/[id] sous les actions de prêt. Navigate vers /requests.

## Verification

pnpm build

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `pnpm --filter @brol/web build` | 0 | ✅ pass | 4100ms |

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `apps/web/src/app/objects/[id]/page.tsx`
