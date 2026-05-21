---
estimated_steps: 7
estimated_files: 1
skills_used: []
---

# T02: End-to-end auth flow test

Test complet du flow auth:
1. Fresh install (pas de token) → /sign-in
2. Créer compte → /home
3. Quitter l'app (pas de restart) → /home
4. Redémarrer l'app → /home (session restaurée)
5. Se déconnecter → /sign-in
6. Accéder à /collections manuellement sans auth → /sign-in

## Inputs

- None specified.

## Expected Output

- Update the implementation and proof artifacts needed for this task.

## Verification

Tous les scénarios passent

## Observability Impact

Aucune
