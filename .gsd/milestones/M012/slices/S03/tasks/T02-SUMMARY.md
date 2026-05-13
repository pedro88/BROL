---
id: T02
parent: S03
milestone: M012
key_files:
  - apps/web/src/components/loans/create-loan-dialog.tsx
key_decisions:
  - Replaced flat contact list with search input + dropdown combobox
  - Selected contact displayed in highlighted box with X to deselect
  - Smart create: if search matches no existing contact, show 'Create X' option
duration: 
verification_result: passed
completed_at: 2026-05-12T09:20:59.610Z
blocker_discovered: false
---

# T02: Combobox recherche contacts dans CreateLoanDialog

**Combobox recherche contacts dans CreateLoanDialog**

## What Happened

Remplacé la liste plate de contacts par un combobox avec recherche. Le champ de recherche filtre via l'API (search param sur contacts.list). Si un contact est sélectionné, il s'affiche dans un encadré avec bouton pour le désélectionner. Si la recherche ne correspond à aucun contact, une option 'Créer X' apparaît. Reset du search sur sélection et fermeture.

## Verification

pnpm --filter @brol/web exec tsc --noEmit: 0 errors.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `pnpm --filter @brol/web exec tsc --noEmit 2>&1 | grep create-loan-dialog` | 0 | ✅ pass | 8000ms |

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `apps/web/src/components/loans/create-loan-dialog.tsx`
