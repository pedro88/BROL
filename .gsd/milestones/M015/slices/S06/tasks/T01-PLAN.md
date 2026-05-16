---
estimated_steps: 7
estimated_files: 1
skills_used: []
---

# T01: Route guard dans root layout

Implémenter le route guard dans app/_layout.tsx
- Au chargement (useEffect), lire auth-store
- Si isLoading: rester sur l'écran actuel ( Splash)
- Si not authenticated AND route est (tabs): redirect /sign-in
- Si authenticated AND route est /sign-in ou /sign-up: redirect /home
- Utiliser router.replace() pour le redirect (pas de history entry)
- Conserver le path original pour redirect après login (expo-router segments)

## Inputs

- None specified.

## Expected Output

- `apps/mobile/app/_layout.tsx`

## Verification

1. Effacer token manuellement → refresh app → arrive sur /sign-in
2. Se connecter → arrive sur /home
3. /sign-in quand déjà connecté → redirect /home

## Observability Impact

Redirects d'auth loggés: { from: '/loans', to: '/sign-in', reason: 'no-session' }
