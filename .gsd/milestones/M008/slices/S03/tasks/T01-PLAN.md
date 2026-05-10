---
estimated_steps: 4
estimated_files: 1
skills_used: []
---

# T01: Fix dead /loans/new link on dashboard

1. Lire apps/web/src/app/page.tsx (dashboard)
2. Chercher toutes les références à /loans/new
3. Remplacer par /loans
4. Vérifier s'il y a d'autres liens morts similaires dans l'app

## Inputs

- `apps/web/src/app/page.tsx`

## Expected Output

- `apps/web/src/app/page.tsx`

## Verification

Navigation : cliquer sur le lien → arrive sur /loans (pas 404)

## Observability Impact

N/A — routing fix
