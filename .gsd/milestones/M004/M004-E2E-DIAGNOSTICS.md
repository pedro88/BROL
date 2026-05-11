# M004 E2E Diagnostics — 15 échecs restants après fix selectors

**Date:** 2026-05-11  
**Branche:** `fix/test-e2e`  
**Contexte:** M004 vise ≥72/76 (95%) E2E passants. Le fix selectors a porté de 26/87 → 68/87. 15 échecs restent.

---

## Bilan des 15 échecs

| # | Test | Fichier | Erreur | Root Cause | Catégorie |
|---|---|---|---|---|---|
| 1 | logo links to homepage | browse.spec.ts:157 | `toHaveURL` échoue — URL reste `/collections` | Test timing: logo → `/` mais `waitForURL` ne détecte pas nav React client-side | Test |
| 2 | edit page shows isPublic toggle | browse.spec.ts:223 | `toBeVisible` échoue — switch non trouvé | Toggle `isPublic` absent du formulaire edit collection | UI |
| 3 | valid collection shows name | collections.spec.ts:140 | `toBeVisible` échoue — "Test Detail Collection" introuvable | Token raw → full token: mutation tRPC silencieusement échoue, collection pas créée en DB | Auth |
| 4 | creates collection with isPublic=true | collections.spec.ts:215 | `strict mode violation` — 2 éléments "Public Col E2E" | Le nom apparaît 2x sur la page — sélecteur sans `.first()` | Test |
| 5 | logo click returns to homepage | homepage.spec.ts:42 | `toHaveURL` échoue — URL `/browse` au lieu de `/` | Même cause que #1 | Test |
| 6 | creates object in collection | objects.spec.ts:107 | `not.toContain` — URL reste `/objects/add` | `collectionId` manquant → mutation tRPC échoue silencieusement | UI |
| 7 | changing isPublic reflects in browse | browse.spec.ts:230 | `Target page, context or browser has been closed` | Race condition sur la mutation toggle | Test/timing |
| 8 | private access redirects to /sign-in | public-collections.spec.ts:117 | `Object.is equality` — ni redirect ni not-found | `clearSession()` ne supprime pas le cookie session | Auth |
| 9 | form validation — name required | objects.spec.ts:95 | `toBeVisible` échoue — champ pas focused | Bouton disabled si nom vide → pas de submit → focus inchangé | Test |
| 10 | public collection visible to non-auth | public-collections.spec.ts:162 | `toBeVisible` échoue — "Verify Public Access" introuvable | Mêmes causes que #3 (token raw → mutation échoue) | Auth |
| 11 | valid object shows name | objects.spec.ts:161 | `toBeVisible` échoue | Token raw → objet pas créé en DB | Auth |
| 12 | sign-in then sign-out affects access | public-collections.spec.ts:140 | `Object.is equality` — session pas clearée | `clearSession()` ne supprime pas le cookie | Auth |
| 13 | accessible to owner when authenticated | public-collections.spec.ts:126 | `toBeVisible` échoue — page browse vide | Token raw → objet pas créé (mêmes causes que #3/#10) | Auth |
| 14 | redirects to /sign-in without auth | objects.spec.ts:118 | `Target page, context or browser has been closed` | `clearSession()` → session pas clear → goto → redirect infini | Auth |
| 15 | can navigate to object add page | objects.spec.ts:185 | `Test timeout 30000ms exceeded` | Dépend de #14 (session pas clear → navigation timeout) | Test/timing |

---

## Causes racinaires groupées

### Groupe A — Auth token raw vs full signed (bugs 3, 10, 11, 13)

**Problème:** `createUserAPI()` retourne `{ token }` — ce token est le `sessionId` brut de BetterAuth. Pour les appels tRPC authentifiés via `Authorization: Bearer <token>`, BetterAuth exige le **full token** (sessionId + signature). Le raw token cause une authentification silencieusement échouée.

**Résultat:** `createCollectionAPI`, `createObjectAPI`, `createPublicCollectionAPI` échouent tous silencieusement → les données ne sont pas créées → les tests vérifient des éléments qui n'existent pas.

**Fix:** Obtenir le full token via `/api/auth/get-session` avec le raw token en Bearer Authorization.

### Groupe B — clearSession ne supprime pas le cookie (bugs 8, 12, 14)

**Problème:** `clearSession()` fait un `fetch(.../sign-out)` mais ne supprime pas le cookie `better-auth.session_token` du browser Playwright. Après sign-out, le cookie persiste, le middleware ne redirige pas vers `/sign-in`, et les tests de "private access sans auth" échouent.

**Fix:** Ajouter `page.context().clearCookies()` après le sign-out API, ou appeler `page.context().clearCookies([{ name: 'better-auth.session_token' }])`.

### Groupe C — Tests timing/selectors (bugs 1, 5)

**Problème:** Les tests de logo utilisent `toHaveURL(\`${WEB_BASE}/\`)` après un click client-side. Si le browser était déjà sur `/collections` ou `/browse` au départ, `toHaveURL` échoue car l'URL n'a pas changé. Le logo navigate vers `/`, mais `waitForURL` était satisfait avant le click.

**Fix:** Attendre explicitement le changement d'URL après le click, pas juste un timeout.

### Groupe D — Test strict mode (bug 4)

**Problème:** `getByText(/Public Col E2E/i)` sans `.first()` resolve à 2 éléments.

**Fix:** `.first()` sur les assertions qui matchent potentiellement plusieurs éléments.

### Groupe E — Test form validation (bug 9)

**Problème:** Le test soumet sans remplir le champ `name`, attend focus. Mais le bouton "Ajouter" est `disabled` si `name` est vide (required HTML5), donc le form ne se soumet pas et le focus ne change pas.

**Fix:** Ajuster l'assertion pour vérifier que le champ reste focused au lieu de regarder un focus change.

### Groupe F — UI: isPublic toggle manquant (bug 2)

**Problème:** Le formulaire edit collection (`/collections/[id]/edit`) n'inclut pas le toggle `isPublic`.

**Fix:** Ajouter un Radix Switch pour `isPublic` dans le formulaire et l'envoyer via `collections.update`.

### Groupe G — UI: object create sans collectionId (bug 6)

**Problème:** Le formulaire `/objects/add` ne sélectionne pas automatiquement une collection. Si le select `collectionId` est vide, la mutation échoue silencieusement.

**Fix:** Pré-sélectionner la première collection de l'utilisateur, ou afficher une erreur si aucune n'est sélectionnée.

---

## Fixes recommandés (ordre de priorité)

### Priorité 1 — Groupe A (auth token)

Fichier: `apps/web/e2e/helpers/auth.ts`

Ajouter une fonction pour obtenir le full token:

```typescript
export async function getFullToken(rawToken: string, baseUrl: string): Promise<string> {
  const res = await fetch(`${baseUrl}/api/auth/get-session`, {
    headers: { Authorization: `Bearer ${rawToken}` },
    credentials: "include",
  });
  const data = await res.json();
  return data?.session?.token ?? data?.token ?? rawToken;
}
```

 Modifier `createUserAPI` pour retourner le full token, ou créer `createUserAPIWithFullToken` qui fait la conversion.

### Priorité 2 — Groupe B (clearSession)

Fichier: `apps/web/e2e/helpers/auth.ts`

```typescript
export async function clearSession(page: Page): Promise<void> {
  try {
    await page.evaluate(async (baseUrl) => {
      await fetch(`${baseUrl}/api/auth/sign-out`, {
        method: "POST",
        credentials: "include",
      });
    }, WEB_BASE);
  } catch {}
  // Clear cookies too
  await page.context().clearCookies();
}
```

### Priorité 3 — Groupe C (test timing)

Fichier: `apps/web/e2e/browse.spec.ts` (test logo links to homepage)

```typescript
test("logo links to homepage", async ({ page }) => {
  await page.goto(`${WEB_BASE}/collections`);
  const logo = page.locator("text=BROL").first();
  await logo.click();
  await page.waitForURL(/\/(?!\w)/, { timeout: 5000 }).catch(() => {});
  await expect(page).toHaveURL(/\/$/);
});
```

### Priorité 4 — Groupe D (strict mode)

Fichier: `apps/web/e2e/collections.spec.ts` (test creates collection with isPublic=true)

```typescript
await expect(page.getByText(/Public Col E2E/i).first()).toBeVisible({ timeout: 8000 });
```

---

## Hypothèses non confirmées (à vérifier)

- **Hypothèse G6/G7:** L'objet n'est pas créé parce que `collectionId` est manquant dans le formulaire. Vérifier la console du browser (devrait afficher une erreur tRPC 401 ou 400).
- **Hypothèse G6/G7:** Les mutations tRPC silencieuses. Vérifier si `onError` est défini dans les mutations React — si non, les erreurs sont invisibles.
