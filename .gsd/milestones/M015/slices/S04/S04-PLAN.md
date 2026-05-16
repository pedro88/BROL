# S04: Auth state + Secure storage + Session sync

**Goal:** Auth state global avec expo-secure-store. Session sync au launch.
**Demo:** Le session token est stocké chiffré et lu au launch pour restaurer la session

## Must-Haves

- ## Success Criteria
- `auth-store.ts` expose un atom (nanostores) avec user + sessionToken
- `secure-storage.ts` wrapper autour expo-secure-store (set/get/delete token)
- `session-sync.ts` au launch: lit le token, appelle /api/auth/get-session, restaure user dans auth-store
- `useAuth()` hook pour lire l'état auth depuis n'importe quel composant
- `signOut()` qui efface le token et redirect vers /sign-in

## Proof Level

- This slice proves: Après un app restart, le token est relu depuis secure storage et la session est restaurée

## Integration Closure

S04 consomme S02+S03 et produit un auth state utilisé par S05 (tabs) et S06 (route guard).

## Verification

- L'état de session (connected/disconnected) est observable et loggé au launch

## Tasks

- [ ] **T01: Secure storage wrapper** `est:30min`
  Creer apps/mobile/src/lib/secure-storage.ts
  - Wrapper autour expo-secure-store
  - setToken(token: string): Promise<void>
  - getToken(): Promise<string | null>
  - deleteToken(): Promise<void>
  - Error handling: si secure-store échoue, log et retourne null
  - Files: `apps/mobile/src/lib/secure-storage.ts`
  - Verify: tsc --noEmit + test: setToken + getToken + deleteToken fonctionnent

- [ ] **T02: Auth state store (nanostores)** `est:30min`
  Creer apps/mobile/src/lib/auth-store.ts
  - Atom nanostores: { user: User | null, sessionToken: string | null, isLoading: boolean }
  - Setter actions: setUser, setToken, clearAuth
  - Export useAuthStore() pour lire depuis un composant
  - Export useAuth() hook: retourne { user, sessionToken, isLoading, isAuthenticated }
  - Files: `apps/mobile/src/lib/auth-store.ts`, `apps/mobile/src/lib/use-auth.ts`
  - Verify: tsc --noEmit

- [ ] **T03: Session sync on launch** `est:45min`
  Creer apps/mobile/src/lib/session-sync.ts
  - Fonction syncSession(): au launch, lit le token depuis secure-storage
  - Si token existe: appelle getSession() (via auth-client) pour valider et obtenir le user
  - Met à jour auth-store avec le user si session valide
  - Si token expiré ou invalide: clearAuth() + redirect /sign-in
  - Appeler syncSession() dans le root layout
  - Files: `apps/mobile/src/lib/session-sync.ts`
  - Verify: Redémarrer l'app → la session est restaurée sans re-login

- [ ] **T04: Sign-out function** `est:15min`
  Creer apps/mobile/src/lib/sign-out.ts (ou ajouter à auth-store)
  - signOut():
    1. Appelle authClient.signOut()
    2. Efface le token de secure storage
    3. Clear auth-store
    4. Redirect vers /sign-in
  - Utilisé par: Profile tab (logout button), Route guard (auto sign-out on 401)
  - Files: `apps/mobile/src/lib/sign-out.ts`
  - Verify: Cliquer logout → redirect /sign-in et token effacé

## Files Likely Touched

- apps/mobile/src/lib/secure-storage.ts
- apps/mobile/src/lib/auth-store.ts
- apps/mobile/src/lib/use-auth.ts
- apps/mobile/src/lib/session-sync.ts
- apps/mobile/src/lib/sign-out.ts
