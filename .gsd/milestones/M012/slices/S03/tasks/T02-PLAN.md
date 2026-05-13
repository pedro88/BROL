---
estimated_steps: 8
estimated_files: 1
skills_used: []
---

# T02: Combobox recherche contacts dans CreateLoanDialog

Transformer la sélection de contact en combobox avec recherche temps réel.

**Étapes:**
1. Dans CreateLoanDialog, remplacer la liste plate de contacts par un champ de recherche avec dropdown
2. Ajouter un state `contactSearch: string`
3. Le champ de recherche filtre les contacts en temps réel (front-side pour <50 contacts, ou re-query avec search si plus tard)
4. Si le contact n'existe pas, afficher "Ajouter un contact" en bas du dropdown (comportement existant conservé)
5. Afficher le contact sélectionné dans le champ avec possibilité de le désélectionner
6. Adapter le style pour ressembler à un combobox native (border, padding, chevron)

## Inputs

- `apps/web/src/components/loans/create-loan-dialog.tsx`

## Expected Output

- `apps/web/src/components/loans/create-loan-dialog.tsx`

## Verification

git diff --stat + vérifier que la recherche de contacts fonctionne dans le dialog

## Observability Impact

Aucun
