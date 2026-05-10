# S04: Web loan creation

**Goal:** Intégrer création de prêt dans le détail objet avec sélecteur contact
**Demo:** http://localhost:3000/objects/[id] avec bouton Prêter → dialogue création prêt

## Must-Haves

- Bouton Prêter sur page détail objet
- Dialogue création prêt avec sélecteur contact
- Prêt créé et visible dans /loans

## Proof Level

- This slice proves: Prêt créé visible dans /loans

## Integration Closure

Création de prêt fonctionnelle depuis UI

## Verification

- Validation emprunté par quelqu'un d'autre, erreurs

## Tasks

- [x] **T01: Create loan creation dialog component** `est:1h`
  Créer le composant CreateLoanDialog avec sélecteur de contact, date de retour optionnelle, notes
  - Files: `apps/web/src/components/loans/create-loan-dialog.tsx`
  - Verify: Dialogue s'ouvre depuis la page objet

- [x] **T02: Add loan button to object detail page** `est:30min`
  Ajouter bouton Prêter sur /objects/[id] avec dialogue intégré, détecter si un prêt actif existe déjà
  - Files: `apps/web/src/app/objects/[id]/page.tsx`
  - Verify: Bouton visible et fonctionne

- [x] **T03: Test end-to-end loan creation flow** `est:30min`
  Vérifier que le prêt créé apparaît bien dans /loans (prêtés tab)
  - Files: `apps/web/src/app/loans/page.tsx`
  - Verify: Créer un prêt → visible dans /loans

## Files Likely Touched

- apps/web/src/components/loans/create-loan-dialog.tsx
- apps/web/src/app/objects/[id]/page.tsx
- apps/web/src/app/loans/page.tsx
