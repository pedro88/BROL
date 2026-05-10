# S02: Web UI loans

**Goal:** Pages web loans : liste prêts (sortants/entrants), historique, actions return/remind
**Demo:** http://localhost:3000/loans affiche prêts sortants/entrants + historique

## Must-Haves

- /loans affiche onglets Prêtés / Empruntés / Historique
- Retour d'objet fonctionne
- Rappel fonctionne

## Proof Level

- This slice proves: Navigation vers /loans fonctionnelle

## Integration Closure

UI fonctionnelle sans créer de nouveaux prêts

## Verification

- Loading states, error states

## Tasks

- [x] **T01: Create loans page with tabs (lent/borrowed/history)** `est:1h30`
  1. Créer la page /apps/web/src/app/loans/page.tsx
  2. Structure de base : tabs Prêtés / Empruntés / Historique
  3. Utiliser les hooks tRPC : loans.lentOut, loans.borrowed, loans.history
  4. Afficher la liste des prêts avec objet, borrower/owner, dates
  5. Intégrer les composants UI existants (Card, Button, etc.)
  - Files: `apps/web/src/app/loans/page.tsx`, `apps/web/src/app/loans/layout.tsx`
  - Verify: Naviguer vers http://localhost:3000/loans affiche la page

- [x] **T02: Add loan card display with status badges** `est:30min`
  1. Créer /apps/web/src/app/loans/[id]/page.tsx (optionnel si on fait pas de détail)
  2. Pour l'instant, garder la logique dans la page liste
  3. Afficher les infos importantes : objet, contact, date limite, statut
  4. Badge coloré pour OVERDUE (rouge), ACTIVE (vert), RETURNED (grisé)
  - Files: `apps/web/src/app/loans/page.tsx`
  - Verify: Les prêts s'affichent avec le bon badge de statut

- [x] **T03: Add return loan action** `est:1h`
  1. Ajouter le bouton 'Marquer comme rendu' sur chaque carte de prêt (pour owner only)
  2. Implémenter la mutation loans.return() via tRPC
  3. Invalidated la query loans.lentOut après le retour
  4. Ajouter un toast/success message après le retour
  5. Gérer les erreurs (toast error)
  - Files: `apps/web/src/app/loans/page.tsx`
  - Verify: Cliquer sur 'Rendu' → prêt disappear de la liste Prêtés

- [x] **T04: Add reminder action** `est:45min`
  1. Ajouter le bouton 'Rappel' sur chaque carte de prêt en retard
  2. Implémenter la mutation loans.remind() via tRPC
  3. Montrer un feedback (toast) quand le rappel est envoyé
  4. Désactiver le bouton si reminderSentAt est recent (< 24h)
  5. Gérer les erreurs gracieusement
  - Files: `apps/web/src/app/loans/page.tsx`
  - Verify: Cliquer sur 'Rappel' → toast de confirmation

- [x] **T05: Add loans to navigation** `est:30min`
  1. Vérifier que la navigation vers /loans est dans le header/sidebar
  2. Ajouter le lien dans le menu principal
  3. Tester que l'auth middleware redirige vers sign-in si non connecté
  4. Vérifier que la page est responsive mobile
  - Files: `apps/web/src/components/navigation.tsx`, `apps/web/src/app/loans/page.tsx`
  - Verify: Accès à /loans depuis le menu

## Files Likely Touched

- apps/web/src/app/loans/page.tsx
- apps/web/src/app/loans/layout.tsx
- apps/web/src/components/navigation.tsx
