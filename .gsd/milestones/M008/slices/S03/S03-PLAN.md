# S03: Fix dead /loans/new link

**Goal:** Identifier et remplacer le lien /loans/new mort sur le dashboard par /loans.
**Demo:** Après S03 : le lien 'Nouveau prêt' sur le dashboard redirige vers /loans.

## Must-Haves

- Le lien/bouton 'nouveau prêt' du dashboard pointe vers /loans (pas /loans/new)

## Proof Level

- This slice proves: Vérification manuelle : depuis le dashboard, cliquer sur le lien de création de prêt → arrive sur /loans

## Integration Closure

N/A — changement de routing pur.

## Verification

- N/A — routing fix

## Tasks

- [x] **T01: Fix dead /loans/new link on dashboard** `est:30min`
  1. Lire apps/web/src/app/page.tsx (dashboard)
  2. Chercher toutes les références à /loans/new
  3. Remplacer par /loans
  4. Vérifier s'il y a d'autres liens morts similaires dans l'app
  - Files: `apps/web/src/app/page.tsx`
  - Verify: Navigation : cliquer sur le lien → arrive sur /loans (pas 404)

## Files Likely Touched

- apps/web/src/app/page.tsx
