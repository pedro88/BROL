# S06: Route guard + redirect

**Goal:** Route guard qui protège les routes tabs. Redirect vers /sign-in si pas connecté.
**Demo:** L'app redirige automatiquement vers /sign-in si pas de session

## Must-Haves

- ## Success Criteria
- Les routes `(tabs)` sont protégées par un auth check au chargement\n- Si pas de token dans secure storage → redirect /sign-in\n- /sign-in et /sign-up sont accessibles sans auth\n- Après sign-out → redirect /sign-in\n- Le redirect préserve la URL de destination (pour redirect après login)

## Proof Level

- This slice proves: En effaçant le token et en ouvrant l'app, on arrive sur /sign-in

## Integration Closure

S06 est le gardien de l'application — protège l'accès aux routes auth.

## Verification

- Tentatives d'accès non autorisé loggées avec timestamp

## Tasks

- [ ] **T01: Route guard dans root layout** `est:1h`
  Implémenter le route guard dans app/_layout.tsx
  - Au chargement (useEffect), lire auth-store
  - Si isLoading: rester sur l'écran actuel ( Splash)
  - Si not authenticated AND route est (tabs): redirect /sign-in
  - Si authenticated AND route est /sign-in ou /sign-up: redirect /home
  - Utiliser router.replace() pour le redirect (pas de history entry)
  - Conserver le path original pour redirect après login (expo-router segments)
  - Files: `apps/mobile/app/_layout.tsx`
  - Verify: 1. Effacer token manuellement → refresh app → arrive sur /sign-in
2. Se connecter → arrive sur /home
3. /sign-in quand déjà connecté → redirect /home

- [ ] **T02: End-to-end auth flow test** `est:20min`
  Test complet du flow auth:
  1. Fresh install (pas de token) → /sign-in
  2. Créer compte → /home
  3. Quitter l'app (pas de restart) → /home
  4. Redémarrer l'app → /home (session restaurée)
  5. Se déconnecter → /sign-in
  6. Accéder à /collections manuellement sans auth → /sign-in
  - Verify: Tous les scénarios passent

## Files Likely Touched

- apps/mobile/app/_layout.tsx
