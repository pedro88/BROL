# T02: Auth full spec (~30 tests)

Réécrire `apps/web/e2e/auth.spec.ts` avec couverture complète de tous les flux auth.

## Inputs

- `apps/web/src/app/sign-in/page.tsx`
- `apps/web/src/middleware.ts`
- `apps/web/e2e/helpers/auth.ts` (T01)

## Expected Output

- `apps/web/e2e/auth.spec.ts` (~30 tests, 0 skipped)

## Verification

`npx playwright test apps/web/e2e/auth.spec.ts — 0 failed, 0 skipped`

## Tests à écrire

### Form validation
1. `form: empty email shows error` — submit without filling
2. `form: empty password shows error`
3. `form: invalid email format shows error`
4. `form: password too short (<8 chars) shows error`

### Sign-up happy path
5. `signup: creates account + redirects to /collections`
6. `signup: creates user in DB with hashed password`
7. `signup: already existing email shows error`

### Sign-in happy path
8. `signin: valid credentials redirect to /collections`
9. `signin: session cookie set after sign-in`

### Sign-in errors
10. `signin: wrong password shows error`
11. `signin: non-existent email shows error`

### Session persistence
12. `session: persists across page navigation`
13. `session: survives refresh`

### Sign-out
14. `signout: button visible in nav when authenticated`
15. `signout: clicking sign-out redirects to /sign-in`
16. `signout: session cookie cleared`

### Middleware redirects
17. `middleware: /collections redirects to /sign-in`
18. `middleware: /settings redirects to /sign-in`
19. `middleware: /objects/add redirects to /sign-in`
20. `middleware: /loans redirects to /sign-in`
21. `middleware: /scan redirects to /sign-in`

### Browse (public — no auth required)
22. `browse: /browse accessible without auth`
23. `browse: heading visible`

### Sign-in / sign-up toggle
24. `toggle: sign-in → sign-up mode`
25. `toggle: sign-up → sign-in mode`

### Responsive
26. `mobile: form renders correctly at 375px`

### OAuth skipped tests
27. `oauth: google button not rendered (commented out)`
28. `oauth: github button not rendered (commented out)`

## Cleanup

Utiliser `test.beforeEach` + `test.afterEach` avec `authHelper.cleanupUser(email)` après chaque test.

## Notes

- Chaque test crée un user unique avec `playwright-${Date.now()}-${random}@test.brol`
- Après T01, `authHelper.signIn(page, email, password)` et `authHelper.signOut(page)` sont disponibles
- Utiliser `page.waitForURL()` pour vérifier les redirections
- Pour `session: persists`, sign-in puis `page.goto('/settings')` puis `page.goto('/collections')` — vérifier que pas de redirect
