# T01: Auth helper + cleanup

Créer `apps/web/e2e/helpers/auth.ts` avec fonctions réutilisables pour sign-up, sign-in, sign-out et cleanup.

## Inputs

- `apps/web/src/app/sign-in/page.tsx`
- `apps/web/src/lib/auth-client.ts`
- `packages/api/src/auth.ts`

## Expected Output

- `apps/web/e2e/helpers/auth.ts` — fonctions signUp, signIn, signOut, createUserAPI, cleanupUser

## Verification

Importable dans les autres tests et fonctionnel.

## Steps

1. Créer `apps/web/e2e/helpers/` directory
2. Implémenter `createUserAPI(email, password, name)` — curl POST vers `/api/auth/sign-up/email` directement, retourne le token
3. Implémenter `signIn(page, email, password)` — UI Playwright: fill email + password, click submit, wait for navigation
4. Implémenter `signUp(page, email, password, name)` — UI Playwright: toggle to sign-up mode, fill fields, submit
5. Implémenter `signOut(page)` — click sign-out button (dans navigation), wait for redirect
6. Implémenter `cleanupUser(email)` — DELETE vers `/api/auth/delete-account` (à créer dans API) OU suppression en DB directe via `psql`
7. Implémenter `getSessionToken(email)` — récupère le token depuis la DB pour Bearer auth
8. Exporter toutes les fonctions avec JSDoc

## Notes

- Cleanup via API route `/api/auth/delete-account` (DELETE) — protège contre les emails non-existants
- Les fonctions UI utilisent `page.goto('/sign-in')` puis interagissent avec le formulaire
- Utiliser des emails uniques avec timestamp pour éviter les conflits: `playwright-${Date.now()}@test.brol`
- Helper doit être compatible avec `test.beforeEach` / `test.afterEach`
