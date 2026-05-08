# S01: Diagnostiquer la cause racine des échecs E2E et stabiliser le serveur API

**Goal:** Garantir que le serveur API (port 3001) tourne pendant les E2E et que les endpoints BetterAuth répondent. Diagnostiquer la cause racine des 48 échecs.
**Demo:** Le serveur API est en état de répondre aux endpoints auth, les helpers E2E peuvent créer/supprimer des users sans `fetch failed`.

## Must-Haves

- Le serveur API répond sur 3001. createUserAPI retourne un token valide. Les tests qui tapent sur 3001 ne retournent plus `fetch failed`. Les deux instances BetterAuth partagent le même secret.

## Proof Level

- This slice proves: Integration: les deux serveurs (3000 + 3001) tournent simultanément avec le même secret. Playwright lance automatiquement les deux via webServer multiple.

## Integration Closure

Harmoniser la configuration entre les 2 instances BetterAuth et configurer Playwright pour lancer les 2 serveurs. C'est la base pour que toutes les slices suivantes puissent fonctionner.

## Verification

- Les logs des deux serveurs montrent clairement si auth fonctionne. Le diagnostic élimine les erreurs `fetch failed` silencieuses.

## Tasks

- [x] **T01: Unifier BETTER_AUTH_SECRET entre les 2 instances** `est:15min`
  1. Unifier BETTER_AUTH_SECRET dans tous les .env : apps/web/.env.local doit avoir le même que .env racine (32144Flush+)
  2. Vérifier que packages/api/.env include aussi le même secret
  3. Supprimer le placeholder 'your-secret-key-here-min-32-chars' de apps/web/.env.local
  4. Vérifier DATABASE_URL cohérent partout
  - Files: `apps/web/.env.local`, `.env`, `packages/api/.env`
  - Verify: grep BETTER_AUTH_SECRET apps/web/.env.local .env packages/api/.env → mêmes valeurs

- [x] **T02: Configurer Playwright pour lancer le serveur API (port 3001) en plus du web** `est:30min`
  1. Lire apps/web/playwright.config.ts
  2. Ajouter un second webServer pour l'API (port 3001) OU modifier webServer pour utiliser un script qui lance les deux
  3. Tester que Playwright lance bien les deux serveurs
  4. Option : utiliser un script pnpm dev:all qui lance les deux serveurs, et pointer Playwright dessus
  - Files: `apps/web/playwright.config.ts`
  - Verify: npx playwright test --reporter=line --grep 'browse' → sans fetch failed

- [x] **T03: Run de vérification E2E — valider la cause racine** `est:45min`
  1. Lancer les E2E avec les 2 serveurs configurés
  2. Courir un subset de tests auth (ex: toggle, form validation, browse)
  3. Vérifier si createUserAPI fonctionne (token retourné)
  4. Vérifier si sign-in/sign-up UI fonctionnent
  5. Documenter les résultats
  - Verify: npx playwright test --reporter=line apps/web/e2e/auth.spec.ts

## Files Likely Touched

- apps/web/.env.local
- .env
- packages/api/.env
- apps/web/playwright.config.ts
