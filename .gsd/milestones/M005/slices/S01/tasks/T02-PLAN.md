---
estimated_steps: 1
estimated_files: 1
skills_used: []
---

# T02: Modifier le Header pour afficher Login/Logout

Ajouter un bouton dans Header qui affiche 'Login' si non-connecté (/sign-in link) ou 'Logout' (bouton qui appelle signOut + redirect /sign-in) si connecté. Utiliser le auth store pour lire l'état. Ajouter un indicateur visuel de session (avatar ou initiales du user).

## Inputs

- `auth-store.ts`
- `auth-client.ts`
- `navigation.tsx`

## Expected Output

- `apps/web/src/components/navigation.tsx modifié`

## Verification

grep -n 'Login\|Logout\|signOut' apps/web/src/components/navigation.tsx

## Observability Impact

Bouton reflète auth state en temps réel.
