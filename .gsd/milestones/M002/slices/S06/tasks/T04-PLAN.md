# T04: Objects spec (~8 tests)

Réécrire `apps/web/e2e/objects.spec.ts` pour couvrir le CRUD objects avec session auth.

## Inputs

- `apps/web/src/app/objects/add/page.tsx`
- `apps/web/src/components/objects/object-form.tsx`
- `apps/web/e2e/helpers/auth.ts` (T01)

## Expected Output

- `apps/web/e2e/objects.spec.ts` (~8 tests)

## Verification

`npx playwright test apps/web/e2e/objects.spec.ts — 0 failed`

## Tests à écrire

### /objects/add
1. `add: page redirects to /sign-in without auth`
2. `add: page loads with auth — form visible`
3. `add: form validation — name required`
4. `add: creates object in collection`

### /objects/:id
5. `detail: non-existent object shows not found`
6. `detail: valid object shows name and details`

### Navigation
7. `nav: can navigate to object add page`

### Responsive
8. `mobile: page renders at 375px`

## Cleanup

Après chaque test: supprimer l'object créé (via collection :id ou via helper).

## Notes

- `/objects/add` nécessite d'abord une collection existante — créer une collection via T03 ou directement en DB avant le test
- Utiliser `authHelper.signIn` dans `test.beforeEach`
- L'ID de la collection à utiliser peut être récupéré via un test.setup() ou en créer une dans `test.beforeEach`
