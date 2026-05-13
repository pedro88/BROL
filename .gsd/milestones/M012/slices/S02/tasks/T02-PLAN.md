---
estimated_steps: 8
estimated_files: 1
skills_used: []
---

# T02: Bouton + sur /loans avec dialog de sélection d'objet

Ajouter un bouton "+" visible sur la page /loans.

**Étapes:**
1. Dans loans/page.tsx, après le header "PRÊTS", ajouter un bouton "+ NOUVEAU PRÊT" (style cohérent avec les QuickActions du dashboard)
2. Le bouton ouvre le dialog de création de prêt — mais pour ça il faut un objectId → utiliser une page intermédiaire /loans/new ou modifier le flow
3. Alternative plus simple: le bouton "+" ouvre un dialog qui demande d'abord de sélectionner un objet à prêter, puis ouvre CreateLoanDialog
4. Créer un mini-dialog de sélection d'objet (search + liste) déclenché par le bouton "+"
5. Une fois l'objet choisi, ouvrir CreateLoanDialog avec cet objectId

**Approche retenue:** Dialog de sélection d'objet (pour éviter de créer une nouvelle page full). Le dialog montre les objets disponibles (non prêtés) avec recherche, puis ouvre CreateLoanDialog.

## Inputs

- `apps/web/src/app/loans/page.tsx`
- `apps/web/src/components/loans/create-loan-dialog.tsx`

## Expected Output

- `apps/web/src/app/loans/page.tsx`

## Verification

git diff --stat && vérifier que le bouton "+" apparaît sur /loans et que le flow objet→dialog fonctionne

## Observability Impact

Aucun
