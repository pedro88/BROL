---
id: T01
parent: S04
milestone: M008
key_files:
  - apps/web/src/components/loans/create-loan-dialog.tsx
key_decisions:
  - Inline contact form toggled by showAddContact state (switch between selection and creation)
  - After contact creation: invalidate contacts.list, auto-select new contact, stay in dialog
  - Back button returns to contact selection from creation form
duration: 
verification_result: untested
completed_at: 2026-05-10T13:55:04.095Z
blocker_discovered: false
---

# T01: Inline contact creation in CreateLoanDialog with auto-select after creation

**Inline contact creation in CreateLoanDialog with auto-select after creation**

## What Happened

S04/T01 : ajout du formulaire inline pour créer un contact dans CreateLoanDialog. showAddContact state bascule entre sélection et création. Après création : invalidate contacts.list, sélection auto du nouveau contact. Bouton Retour pour revenir à la sélection. Reset complet de l'état sur fermeture.

## Verification

Playwright ou vérification browser : CreateLoanDialog → 'Ajouter un contact' → formulaire inline → créer → contact apparaît dans liste et est pré-sélectionné.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| — | No verification commands discovered | — | — | — |

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `apps/web/src/components/loans/create-loan-dialog.tsx`
