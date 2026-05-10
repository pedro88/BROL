---
estimated_steps: 5
estimated_files: 2
skills_used: []
---

# T01: Create loans page with tabs (lent/borrowed/history)

1. Créer la page /apps/web/src/app/loans/page.tsx
2. Structure de base : tabs Prêtés / Empruntés / Historique
3. Utiliser les hooks tRPC : loans.lentOut, loans.borrowed, loans.history
4. Afficher la liste des prêts avec objet, borrower/owner, dates
5. Intégrer les composants UI existants (Card, Button, etc.)

## Inputs

- `packages/api/src/routers/loans.ts`
- `apps/web/src/app/collections/page.tsx`

## Expected Output

- `Page /loans fonctionnelle`

## Verification

Naviguer vers http://localhost:3000/loans affiche la page

## Observability Impact

Loading state pendant le fetch
