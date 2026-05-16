---
estimated_steps: 7
estimated_files: 1
skills_used: []
---

# T01: Auth client (sign-in API calls)

Créer apps/mobile/src/lib/auth-client.ts
- signInEmailPassword(email, password): POST /api/auth/sign-in/email
- signUpEmailPassword(email, password, name): POST /api/auth/sign-up/email
- signOut(): POST /api/auth/sign-out
- getSession(): GET /api/auth/get-session
- Retourne { session, user } depuis BetterAuth
- Note: Le sessionId dans la réponse est le raw token à stocker

## Inputs

- `apps/mobile/src/lib/secure-storage.ts (TBD dans S04)`

## Expected Output

- `apps/mobile/src/lib/auth-client.ts`

## Verification

tsc --noEmit

## Observability Impact

Erreurs d'auth visible dans la console (network + invalid credentials)
