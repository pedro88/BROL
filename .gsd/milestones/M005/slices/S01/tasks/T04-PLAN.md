---
estimated_steps: 1
estimated_files: 1
skills_used: []
---

# T04: Vérifier manuellement le flow login/logout

Lancer l'app web (port 3000) et l'API (port 3001). Vérifier manuellement : / non-connecté → /sign-in. /sign-in → login. Après login → /. Header affiche 'Logout'. Click logout → /sign-in. Vérifier aussi /settings redirige si non-connecté.

## Inputs

- None specified.

## Expected Output

- `Vérification manuelle complète`

## Verification

Vérification browser: / → /sign-in (anon), login → / (header montre logout), logout → /sign-in

## Observability Impact

Aucun — test manuel.
