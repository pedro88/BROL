---
estimated_steps: 5
estimated_files: 2
skills_used: []
---

# T02: Auth state store (nanostores)

Creer apps/mobile/src/lib/auth-store.ts
- Atom nanostores: { user: User | null, sessionToken: string | null, isLoading: boolean }
- Setter actions: setUser, setToken, clearAuth
- Export useAuthStore() pour lire depuis un composant
- Export useAuth() hook: retourne { user, sessionToken, isLoading, isAuthenticated }

## Inputs

- None specified.

## Expected Output

- `apps/mobile/src/lib/auth-store.ts`
- `apps/mobile/src/lib/use-auth.ts`

## Verification

tsc --noEmit

## Observability Impact

Changements d'état auth loggés (sign-in, sign-out, session-restore)
