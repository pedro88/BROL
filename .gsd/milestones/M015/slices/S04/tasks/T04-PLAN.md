---
estimated_steps: 7
estimated_files: 1
skills_used: []
---

# T04: Sign-out function

Creer apps/mobile/src/lib/sign-out.ts (ou ajouter à auth-store)
- signOut():
  1. Appelle authClient.signOut()
  2. Efface le token de secure storage
  3. Clear auth-store
  4. Redirect vers /sign-in
- Utilisé par: Profile tab (logout button), Route guard (auto sign-out on 401)

## Inputs

- None specified.

## Expected Output

- `apps/mobile/src/lib/sign-out.ts`

## Verification

Cliquer logout → redirect /sign-in et token effacé

## Observability Impact

Sign-out events logged
