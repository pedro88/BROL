# T03: Collections spec (~12 tests)

Réécrire `apps/web/e2e/collections.spec.ts` pour couvrir le CRUD complet avec session auth.

## Inputs

- `apps/web/src/app/collections/page.tsx`
- `apps/web/src/components/collections/create-collection-dialog.tsx`
- `apps/web/e2e/helpers/auth.ts` (T01)

## Expected Output

- `apps/web/e2e/collections.spec.ts` (~12 tests)

## Verification

`npx playwright test apps/web/e2e/collections.spec.ts — 0 failed`

## Tests à écrire

### /collections page
1. `page loads with authenticated session`
2. `page shows heading "MES COLLECTIONS" or similar`
3. `page shows empty state when no collections`
4. `page redirects to /sign-in without auth`

### /collections/:id
5. `detail: non-existent collection shows not found`
6. `detail: valid collection shows name and description`

### CreateCollectionDialog
7. `create: button opens dialog`
8. `create: form validation — name required`
9. `create: creates collection with isPublic=false`
10. `create: creates collection with isPublic=true`

### Navigation
11. `nav: clicking collection card navigates to detail`
12. `nav: can navigate back to collections list`

### Responsive
13. `mobile: page renders at 375px`

## Cleanup

Après chaque test: supprimer la collection créée en DB via `psql` (ou via helper T01).

## Notes

- Pour `create: creates collection`, ouvrir `/collections`, cliquer "Nouvelle collection", remplir le dialog, soumettre
- Utiliser `authHelper.signIn(page, email, password)` dans `test.beforeEach`
- Les tests qui ne nécessitent pas de auth (redirect) peuvent être dans un `test.describe` séparé
