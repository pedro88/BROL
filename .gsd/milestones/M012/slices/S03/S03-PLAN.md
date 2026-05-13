# S03: S03

**Goal:** Remplacer la liste scrollable de contacts par un combobox avec recherche inline
**Demo:** Après S03 : dialog de prêt avec combobox recherche contacts

## Must-Haves

- CreateLoanDialog : combobox avec searchInput
- Recherche par nom (insensible à la casse)
- Liste filtrée en temps réel
- Si 0 résultat : 'Aucun contact trouvé' + option d'ajouter

## Proof Level

- This slice proves: screenshot du dialog avec recherche active

## Integration Closure

Le dialog reste fonctionnel avec flow d'ajout inline

## Verification

- Aucun

## Tasks

- [x] **T01: search param sur contacts.list API** `est:15 min`
  Ajouter le support de recherche sur le endpoint contacts.list.
  - Files: `packages/api/src/routers/contacts.ts`
  - Verify: git diff --stat + test que contacts.list avec search filtre correctement

- [x] **T02: Combobox recherche contacts dans CreateLoanDialog** `est:30 min`
  Transformer la sélection de contact en combobox avec recherche temps réel.
  - Files: `apps/web/src/components/loans/create-loan-dialog.tsx`
  - Verify: git diff --stat + vérifier que la recherche de contacts fonctionne dans le dialog

## Files Likely Touched

- packages/api/src/routers/contacts.ts
- apps/web/src/components/loans/create-loan-dialog.tsx
