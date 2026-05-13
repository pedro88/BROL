# S02: S02

**Goal:** Intégrer PhotoCapture dans le formulaire d'ajout d'objet et ajouter un bouton FAB (+) sur la page /loans
**Demo:** Après S02 : formulaire objet avec capture photo + bouton + visible sur /loans

## Must-Haves

- ObjectForm affiche PhotoCapture
- /loans affiche un bouton FAB flottant '+' qui ouvre le dialog de création de prêt (nécessite sélection d'objet)
- Les liens dashboard vers /objects et /loans fonctionnent

## Proof Level

- This slice proves: screenshot du formulaire + de la page prêts

## Integration Closure

Le FAB ouvre un flow de création de prêt

## Verification

- Aucun

## Tasks

- [x] **T01: Photo dans formulaire objet (coverImage URL + PhotoCapture sur edit)** `est:45 min`
  Intégrer la capture photo dans le formulaire objet.
  - Files: `apps/web/src/components/objects/object-form.tsx`, `apps/web/src/app/objects/[id]/edit/page.tsx`, `packages/api/src/routers/objects.ts`
  - Verify: git diff --stat && vérifier que /objects/add crée un objet et redirige vers /objects/[id]/edit, et que la page edit affiche PhotoCapture

- [x] **T02: Bouton + sur /loans avec dialog de sélection d'objet** `est:30 min`
  Ajouter un bouton "+" visible sur la page /loans.
  - Files: `apps/web/src/app/loans/page.tsx`
  - Verify: git diff --stat && vérifier que le bouton "+" apparaît sur /loans et que le flow objet→dialog fonctionne

## Files Likely Touched

- apps/web/src/components/objects/object-form.tsx
- apps/web/src/app/objects/[id]/edit/page.tsx
- packages/api/src/routers/objects.ts
- apps/web/src/app/loans/page.tsx
