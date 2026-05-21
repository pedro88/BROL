---
estimated_steps: 6
estimated_files: 1
skills_used: []
---

# T01: Secure storage wrapper

Creer apps/mobile/src/lib/secure-storage.ts
- Wrapper autour expo-secure-store
- setToken(token: string): Promise<void>
- getToken(): Promise<string | null>
- deleteToken(): Promise<void>
- Error handling: si secure-store échoue, log et retourne null

## Inputs

- None specified.

## Expected Output

- `apps/mobile/src/lib/secure-storage.ts`

## Verification

tsc --noEmit + test: setToken + getToken + deleteToken fonctionnent

## Observability Impact

Erreurs secure storage loggées (keychain unavailable, etc.)
