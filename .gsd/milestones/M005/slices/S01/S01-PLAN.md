# S01: Login/logout button + redirect conditionnel

**Goal:** Ajouter le bouton login/logout dans le header + implémenter la redirection conditionnelle / selon l'état de session.
**Demo:** L'app redirige / → sign-in si non-connecté, / → dashboard si connecté. Le bouton login/logout fonctionne.

## Must-Haves

- Bouton 'Login' dans header si non-connecté, 'Logout' si connecté
- / non-connecté → redirect vers /sign-in
- / connecté → reste sur /
- Click Logout → session détruite, redirect /sign-in
- Navigation /settings accessible seulement si connecté (redirect /sign-in sinon)

## Proof Level

- This slice proves: E2E: visit / non-connecté → redirect vers /sign-in. E2E: visit / connecté → reste sur /. Click logout → redirect vers /sign-in.

## Verification

- Logs des redirects conditionnels en dev.

## Tasks

- [x] **T01: Analyser l'existant auth client + store** `est:15min`
  Lire le fichier apps/web/src/lib/auth-client.ts pour comprendre le helper signOut existant. Examiner comment auth-session-syncer.tsx détecte la session et expose le state.
  - Files: `apps/web/src/lib/auth-client.ts`, `apps/web/src/lib/auth-session-syncer.tsx`, `apps/web/src/lib/auth-store.ts`
  - Verify: grep -n 'signOut\|useSession\|useAuth' apps/web/src/lib/

- [x] **T02: Modifier le Header pour afficher Login/Logout** `est:30min`
  Ajouter un bouton dans Header qui affiche 'Login' si non-connecté (/sign-in link) ou 'Logout' (bouton qui appelle signOut + redirect /sign-in) si connecté. Utiliser le auth store pour lire l'état. Ajouter un indicateur visuel de session (avatar ou initiales du user).
  - Files: `apps/web/src/components/navigation.tsx`
  - Verify: grep -n 'Login\|Logout\|signOut' apps/web/src/components/navigation.tsx

- [x] **T03: Modifier le middleware pour redirect conditionnel** `est:45min`
  Lire middleware.ts actuel et le modifier pour que / (et /settings, /collections, /loans, /contacts, /qr, /objects/*, /collections/*) redirigent vers /sign-in si pas de session valide. /browse, /sign-in, /sign-up restent publics.
  - Files: `apps/web/src/middleware.ts`
  - Verify: grep -n 'redirect\|sign-in\|middleware' apps/web/src/middleware.ts

- [x] **T04: Vérifier manuellement le flow login/logout** `est:30min`
  Lancer l'app web (port 3000) et l'API (port 3001). Vérifier manuellement : / non-connecté → /sign-in. /sign-in → login. Après login → /. Header affiche 'Logout'. Click logout → /sign-in. Vérifier aussi /settings redirige si non-connecté.
  - Verify: Vérification browser: / → /sign-in (anon), login → / (header montre logout), logout → /sign-in

## Files Likely Touched

- apps/web/src/lib/auth-client.ts
- apps/web/src/lib/auth-session-syncer.tsx
- apps/web/src/lib/auth-store.ts
- apps/web/src/components/navigation.tsx
- apps/web/src/middleware.ts
