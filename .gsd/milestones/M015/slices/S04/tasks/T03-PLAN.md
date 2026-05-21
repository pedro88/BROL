---
estimated_steps: 6
estimated_files: 1
skills_used: []
---

# T03: Session sync on launch

Creer apps/mobile/src/lib/session-sync.ts
- Fonction syncSession(): au launch, lit le token depuis secure-storage
- Si token existe: appelle getSession() (via auth-client) pour valider et obtenir le user
- Met à jour auth-store avec le user si session valide
- Si token expiré ou invalide: clearAuth() + redirect /sign-in
- Appeler syncSession() dans le root layout

## Inputs

- `apps/mobile/src/lib/auth-store.ts`
- `apps/mobile/src/lib/secure-storage.ts`
- `apps/mobile/src/lib/auth-client.ts`

## Expected Output

- `apps/mobile/src/lib/session-sync.ts`

## Verification

Redémarrer l'app → la session est restaurée sans re-login

## Observability Impact

Session sync result logged (restored, expired, invalid, no-token)
