# T05: Browse + public spec (~16 tests)

Réécrire `apps/web/e2e/public-collections.spec.ts` + créer `apps/web/e2e/browse.spec.ts`.

## Inputs

- `apps/web/src/app/browse/page.tsx`
- `apps/web/src/app/collections/[id]/page.tsx`
- `apps/web/src/app/page.tsx`
- `apps/web/e2e/helpers/auth.ts` (T01)

## Expected Output

- `apps/web/e2e/browse.spec.ts` (~10 tests)
- `apps/web/e2e/public-collections.spec.ts` (réécrit, ~6 tests)

## Verification

`npx playwright test apps/web/e2e/browse.spec.ts apps/web/e2e/public-collections.spec.ts — 0 failed`

## Tests browse.spec.ts

### /browse page
1. `page: accessible without auth`
2. `page: shows heading "COLLECTIONS PUBLIQUES"`
3. `page: shows empty state when no public collections`
4. `page: shows public collections when they exist`
5. `page: clicking collection card navigates to detail`

### Homepage
6. `homepage: loads with VHS theme`
7. `homepage: shows quick actions`
8. `homepage: navigation visible`

### Responsive
9. `mobile: browse page renders at 375px`
10. `mobile: homepage renders at 375px`

## Tests public-collections.spec.ts

### /collections/:id public access
1. `public: accessible without auth when isPublic=true`
2. `public: shows collection name and objects`
3. `public: shows empty state when no objects`
4. `private: redirects to /sign-in when isPublic=false`

### isPublic toggle
5. `toggle: edit page shows isPublic toggle`
6. `toggle: changing isPublic reflects in browse`

## Cleanup

Après les tests: remettre isPublic=false pour les collections testées, ou nettoyer en DB.

## Notes

- `/browse` appelle `collections.listPublic` — pas de session requise
- Les tests `public: accessible` nécessitent d'abord de créer une collection publique via T03 (helper signIn + create)
- Pour `private: redirects`, il faut créer une collection PRIVATE (isPublic=false) avec un user authentifié, puis se déconnecter et essayer d'y accéder
- Le middleware ne protège PAS `/collections/:id` (c'est la route browse/public) — mais le tRPC `get` vérifie la visibilité
