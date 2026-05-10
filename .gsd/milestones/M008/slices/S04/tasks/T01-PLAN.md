---
estimated_steps: 8
estimated_files: 1
skills_used: []
---

# T01: Add inline contact creation to CreateLoanDialog

1. Lire apps/web/src/components/loans/create-loan-dialog.tsx
2. Ajouter un état `showAddContact: boolean`
3. Ajouter un bouton 'Ajouter un contact' sous la liste de contacts
4. Quand showAddContact=true : remplacer la liste par un formulaire inline (name + email + phone)
5. Appeler trpc.contacts.create.useMutation() pour créer le contact
6. Après création : invalidate contacts.list, reset showAddContact, sélectionner automatiquement le nouveau contact
7. Garder le style cohérent avec le reste du dialog
8. Tester que ça fonctionne aussi avec CreateLoanDialog depuis object-card et object-detail

## Inputs

- `apps/web/src/components/loans/create-loan-dialog.tsx`
- `packages/api/src/routers/contacts.ts (contacts.create signature)`

## Expected Output

- `apps/web/src/components/loans/create-loan-dialog.tsx`

## Verification

Playwright : CreateLoanDialog → 'Ajouter un contact' → remplir nom + email → créer → contact apparaît dans la liste → sélectionner → prêt créé

## Observability Impact

N/A — UX improvement
