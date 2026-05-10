# S03: Web UI contacts

**Goal:** Pages web contacts : liste, création, mise à jour, suppression, détail avec historique
**Demo:** http://localhost:3000/contacts affiche liste + création + détail

## Must-Haves

- Liste contacts visible
- Création / modification contact
- Suppression contact
- Détail contact avec historique loans

## Proof Level

- This slice proves: CRUD fonctionnel + navigation

## Integration Closure

CRUD complet + historique visible

## Verification

- Confirmation suppression, erreurs de validation

## Tasks

- [x] **T01: Create contacts page with CRUD** `est:1h`
  Créer /contacts/page.tsx avec liste de contacts, dialog création/édition, confirmation suppression
  - Files: `apps/web/src/app/contacts/page.tsx`
  - Verify: Page affiche la liste de contacts

- [x] **T02: Create contact detail page with history** `est:30min`
  Créer /contacts/[id]/page.tsx avec détail du contact + historique loans via contacts.loansForContact
  - Files: `apps/web/src/app/contacts/[id]/page.tsx`
  - Verify: Détail affiche l'historique

## Files Likely Touched

- apps/web/src/app/contacts/page.tsx
- apps/web/src/app/contacts/[id]/page.tsx
