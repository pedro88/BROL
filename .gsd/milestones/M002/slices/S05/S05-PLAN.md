# S05: Tests e2e OAuth + public visibility

**Goal:** Exécuter les tests E2E Playwright sur les 5 fichiers de spec (auth, collections, homepage, objects, public-collections). Mettre à jour les tests qui vérifient des fonctionnalités absentes (OAuth buttons). Adapter auth.spec.ts pour tester email/password au lieu d'OAuth.
**Demo:** 

## Must-Haves

- playwright test passe sur les tests exécutables (auth redirects, browse, email/password form). Les tests OAuth sont skipped avec reason.

## Proof Level

- This slice proves: runtime-realtime

## Integration Closure

Les 5 fichiers de spec sont exécutables. Les tests de middleware (auth redirects) et browse passent. Les tests email/password sign-in sont ajoutés. Les tests OAuth sont mark as skip (credentials not configured).

## Verification

- Run the task and slice verification checks for this slice.

## Tasks

- [x] **T01: Mettre à jour auth.spec.ts et exécuter les tests** `est:20min`
  Mettre à jour auth.spec.ts pour tester email/password (pas OAuth). Ajouter tests sign-in/sign-up. Marquer les tests OAuth comme skip (credentials not configured).
  - Files: `apps/web/e2e/auth.spec.ts`
  - Verify: playwright test --project=chromium → tests exécutables passent, OAuth tests skip

- [x] **T02: Exécuter les tests public-collections et collections** `est:20min`
  Exécuter playwright test sur public-collections.spec.ts et collections.spec.ts. Vérifier que browse, middleware, toggle isPublic fonctionnent.
  - Files: `apps/web/e2e/public-collections.spec.ts`, `apps/web/e2e/collections.spec.ts`
  - Verify: playwright test public-collections.spec.ts collections.spec.ts → pass ou skip

## Files Likely Touched

- apps/web/e2e/auth.spec.ts
- apps/web/e2e/public-collections.spec.ts
- apps/web/e2e/collections.spec.ts
