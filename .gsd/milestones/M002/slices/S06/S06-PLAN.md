# S06: Tests e2e complets (tous les cas)

**Goal:** Couverture e2e complète de tous les cas: auth (sign-in/sign-up/errors), session persistence, middleware, collections CRUD, objects CRUD, browse public.

**Demo:** Tous les edge cases testés — sign-up/sign-in/session persistence/sign-out + collections CRUD + objects CRUD + browse public + form validation + error handling + responsive. Zéro test skippé (sauf OAuth credentials).

## Must-Haves

- Zéro test skippé (sauf OAuth credentials non-configurées)
- Session cleanup entre chaque test (aucune interférence)
- Auth helper réutilisable dans tous les specs
- Responsive mobile (375px) couvert

## Proof Level

- This slice proves: tous les flux utilisateurs sont testables et passent

## Integration Closure

Chaque spec.test.ts passe avec npx playwright test. Zéro test failed.

## Tasks

- [ ] **T01: Auth helper + cleanup** `est:45min`
  Créer apps/web/e2e/helpers/auth.ts: signUp (UI Playwright), signIn (UI Playwright), signOut, createUserAPI (curl direct), cleanupUser.
  - Files: `apps/web/e2e/helpers/auth.ts`
  - Verify: importable sans erreur TypeScript

- [ ] **T02: Auth full spec (~30 tests)** `est:2h`
  Réécrire auth.spec.ts: form validation, sign-up happy path, sign-in happy path, sign-in errors, session persistence, sign-out, all middleware redirects, responsive.
  - Files: `apps/web/e2e/auth.spec.ts`
  - Verify: npx playwright test auth.spec.ts — 0 failed, 0 skipped (hors OAuth)

- [ ] **T03: Collections spec (~12 tests)** `est:1h`
  Réécrire collections.spec.ts: /collections charge, empty state, /collections/:id, CreateCollectionDialog validation + creation, navigation.
  - Files: `apps/web/e2e/collections.spec.ts`
  - Verify: npx playwright test collections.spec.ts — 0 failed

- [ ] **T04: Objects spec (~8 tests)** `est:1h`
  Réécrire objects.spec.ts: /objects/add form validation, création, /objects/:id, navigation.
  - Files: `apps/web/e2e/objects.spec.ts`
  - Verify: npx playwright test objects.spec.ts — 0 failed

- [ ] **T05: Browse + public spec (~16 tests)** `est:1h`
  Réécrire public-collections.spec.ts + créer browse.spec.ts: /browse, public/private access, isPublic toggle, homepage.
  - Files: `apps/web/e2e/browse.spec.ts`, `apps/web/e2e/public-collections.spec.ts`
  - Verify: npx playwright test browse.spec.ts public-collections.spec.ts — 0 failed

## Files Likely Touched

- apps/web/e2e/helpers/auth.ts (nouveau)
- apps/web/e2e/auth.spec.ts (réécrit)
- apps/web/e2e/collections.spec.ts (réécrit)
- apps/web/e2e/objects.spec.ts (réécrit)
- apps/web/e2e/public-collections.spec.ts (réécrit)
- apps/web/e2e/browse.spec.ts (nouveau)
