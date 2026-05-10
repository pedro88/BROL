# S04: Inline contact creation in CreateLoanDialog

**Goal:** Ajouter un formulaire inline pour créer un contact directement dans le CreateLoanDialog, sans quitter le dialog.
**Demo:** Après S04 : depuis CreateLoanDialog, je peux créer un contact sans quitter le dialog.

## Must-Haves

- Bouton 'Ajouter un contact' dans CreateLoanDialog\n- Formulaire inline (ou dialog) pour créer un contact sans quitter\n- Contact apparaît dans la liste après création\n- Prêt peut être créé avec le nouveau contact

## Proof Level

- This slice proves: Vérification manuelle : CreateLoanDialog → 'Ajouter un contact' → formulaire inline → contact créé → apparaît dans la liste → prêt créé.

## Integration Closure

CreateLoanDialog est utilisé depuis object-card et object-detail. Vérifier que les deux continuent de fonctionner après l'ajout du formulaire inline.

## Verification

- N/A — UX improvement

## Tasks

- [x] **T01: Add inline contact creation to CreateLoanDialog** `est:2h`
  1. Lire apps/web/src/components/loans/create-loan-dialog.tsx
  2. Ajouter un état `showAddContact: boolean`
  3. Ajouter un bouton 'Ajouter un contact' sous la liste de contacts
  4. Quand showAddContact=true : remplacer la liste par un formulaire inline (name + email + phone)
  5. Appeler trpc.contacts.create.useMutation() pour créer le contact
  6. Après création : invalidate contacts.list, reset showAddContact, sélectionner automatiquement le nouveau contact
  7. Garder le style cohérent avec le reste du dialog
  8. Tester que ça fonctionne aussi avec CreateLoanDialog depuis object-card et object-detail
  - Files: `apps/web/src/components/loans/create-loan-dialog.tsx`
  - Verify: Playwright : CreateLoanDialog → 'Ajouter un contact' → remplir nom + email → créer → contact apparaît dans la liste → sélectionner → prêt créé

## Files Likely Touched

- apps/web/src/components/loans/create-loan-dialog.tsx
