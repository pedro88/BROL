# M015: Infrastructure Mobile — tRPC + Auth + Navigation

**Vision:** Ériger le socle technique de l'app mobile : client tRPC vers l'API existante (port 3001), authentication via BetterAuth avec Bearer token stocké en secure storage, et tab navigation pour matcher l'expérience web. Sans ce socle, aucun écran ne peut communiquer avec le backend.

## Contexte technique

### Architecture auth mobile
- BetterAuth sur `packages/api` (port 3001) retourne `{ session, user }` après sign-in
- Le `sessionToken` (raw token, pas le cookie) est stocké dans `expo-secure-store`
- Chaque requête tRPC envoie `Authorization: Bearer {token}` dans les headers
- Le `TRPCProvider` wrap l'app et injecte le token depuis secure storage
- Sync de session: au launch, lire le token depuis secure storage → appeler `/api/auth/get-session` → restaurer l'état auth

### Client tRPC mobile
- URL: `http://localhost:3001/api/trpc` (dev) → `${NEXT_PUBLIC_API_URL}/api/trpc` (prod)
- Même router `appRouter` que la web app (collections, objects, loans, contacts, qr, photos, etc.)
- Pas de SuperJSON transformer (React Native ne supporte pas devalue/custom transformers nativement) → dates en string ISO
- QueryClient avec `staleTime: 5000`, retry policy

### Navigation
- expo-router Tab layout pour le shell principal (5 tabs: Home, Collections, Objects, Loans, Profile)
- Stack pour les flows modaux (create/edit/scan/detail)
- Les tabs correspondent aux sections de la bottom bar web

## Scope (inclus)
- Client tRPC React Native + TRPCProvider
- Secure storage du session token (expo-secure-store)
- Sign-in / Sign-up screen (email + password via BetterAuth)
- Auth state global (user, session, signOut)
- Tab navigation shell avec les 5 tabs
- Refresh token / session sync au launch
- Route guard (redirect vers /sign-in si pas connecté)

## Scope (exclu pour cette milestone)
- Tout écran avec données réelles (Collections, Objects, Loans, etc.) → M016
- Scanner QR → M017
- Photos upload → M016/M017
- Notifications → M017

## Défis techniques known
- expo-secure-store vs AsyncStorage : utiliser expo-secure-store (plus sécurisé, chiffré)
- Le token BetterAuth raw (sessionId) doit être obtenu via `/api/auth/get-session` après sign-in — pas directement depuis la réponse sign-in
- React Query v5 + tRPC v11 : même pattern que web app, pas de changement
- Pas de SuperJSON : les dates arrivent comme strings ISO, compatibilité assurée côté composants