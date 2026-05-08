# Guide des tests BROL

## Prérequis

PostgreSQL doit tourner localement sur le port 5432 avec le rôle `postgres:password`.

## Serveurs

Les tests E2E nécessitent **deux serveurs** en parallèle :

```bash
# Terminal 1 — API tRPC (port 3001)
pnpm --filter=@brol/api dev

# Terminal 2 — Web Next.js (port 3000)
pnpm --filter=@brol/web dev
```

> Les deux serveurs utilisent `reuseExistingServer: true` dans la config Playwright, donc si un serveur tourne déjà, Playwright le réutilise. Mais les tests **ne lancent pas automatiquement** les serveurs s'ils ne répondent pas sur le port attendu — il faut les démarrer manuellement avant.

## Lancer les tests

### Tests unitaires (routers tRPC)

```bash
cd packages/api && npx vitest run
```

### Tests E2E (Playwright)

```bash
# Assurez-vous que les serveurs tournent (:3000 et :3001)
npx playwright test --reporter=list
```

### Tout lancer

```bash
pnpm test          # unitaires uniquement
pnpm test:e2e      # E2E uniquement
```

## Baseline actuelle — 6 mai 2026

### Tests unitaires : ✅ 60/60 (100%)

| Fichier | Tests | Statut |
|---|---|---|
| `collections.test.ts` | 14 | ✅ |
| `loans.test.ts` | 11 | ✅ |
| `qr.test.ts` | 12 | ✅ |
| `contacts.test.ts` | 12 | ✅ |
| `objects.test.ts` | 11 | ✅ |

### Tests E2E : ⚠️ 56/76 (74%)

#### Passants (56)

**auth.spec.ts (24/28)**
- ✅ sign-up : crée un compte et redirige
- ✅ sign-up : doublon d'email montre erreur
- ✅ sign-up : cycle sign-up/sign-in — hash fonctionne en DB
- ✅ sign-up : mot de passe trop court bloqué
- ✅ sign-in : credentials valides redirigent
- ✅ sign-in : cookie de session défini
- ✅ sign-in : mot de passe erroné montre erreur
- ✅ sign-in : email inexistant montre erreur
- ✅ session persistence : persiste après navigation
- ✅ session persistence : survive au rechargement
- ✅ session persistence : hasActiveSession après sign-in
- ✅ sign-out : session authentifiée permet accès /collections
- ✅ sign-out : sign-out efface la session
- ✅ sign-out : session effacée → /collections redirige vers sign-in
- ✅ browse : accessible sans auth
- ✅ browse : affiche COLLECTIONS PUBLIQUES
- ✅ toggle : sign-in ↔ sign-up mode
- ✅ responsive : formulaire à 375px
- ✅ responsive : browse à 375px
- ✅ OAuth : boutons Google/GitHub/Apple non affichés (commentés)
- ✅ form validation : email vide → erreur required
- ✅ form validation : mot de passe vide → erreur required
- ✅ form validation : format email invalide → erreur
- ✅ form validation : mot de passe trop court → erreur

**collections.spec.ts (7/14)**
- ✅ loads with authenticated session
- ✅ shows collections heading or title
- ✅ shows empty state when no collections
- ✅ redirects to /sign-in without auth
- ✅ non-existent collection shows not found
- ✅ button opens dialog
- ✅ form validation — name required

**objects.spec.ts (2/8)**
- ✅ objects/add page loads with auth
- ✅ redirects to /sign-in without auth

**browse.spec.ts (9/18)**
- ✅ accessible without auth
- ✅ shows COLLECTIONS PUBLIQUES heading
- ✅ shows empty state when no public collections
- ✅ does not show private collections
- ✅ loads with VHS theme
- ✅ shows quick actions section
- ✅ navigation visible in header
- ✅ quick action links to collections
- ✅ browse page renders at 375px mobile

**homepage.spec.ts (3/6)**
- ✅ loads with VHS logo
- ✅ shows ACTIONS RAPIDES section
- ✅ navbar visible

**public-collections.spec.ts (0/6)**
- ❌ Tous échoués

#### Échecs (20) — classés par catégorie

| Catégorie | Fichiers concernés | Nb d'échecs |
|---|---|---|
| **Données manquantes** | public-collections.spec.ts, browse.spec.ts | 6 |
| **Collections CRUD** | collections.spec.ts (create, detail, navigation) | 5 |
| **Objects add/CRUD** | objects.spec.ts (add, form, detail, navigation) | 4 |
| **Homepage navigation** | homepage.spec.ts (logo link), browse.spec.ts (logo link) | 2 |
| **isPublic toggle** | browse.spec.ts (edit page, toggle sync) | 2 |
| **Responsive** | homepage.spec.ts (375px), browse.spec.ts (375px) | 1 |

### Détail des 20 échecs E2E

```
browse.spec.ts:80:7        ❌ shows public collections when they exist
browse.spec.ts:93:7        ❌ clicking collection card navigates to detail
browse.spec.ts:143:7       ❌ logo links to homepage
browse.spec.ts:199:7       ❌ edit page shows isPublic toggle
browse.spec.ts:206:7       ❌ changing isPublic reflects in browse
collections.spec.ts:139:7  ❌ valid collection shows name
collections.spec.ts:188:7  ❌ creates collection with isPublic=false
collections.spec.ts:214:7  ❌ creates collection with isPublic=true
collections.spec.ts:265:7  ❌ clicking collection card navigates to detail
collections.spec.ts:285:7  ❌ can navigate back to collections list
homepage.spec.ts:23:7      ❌ logo click returns to homepage
homepage.spec.ts:45:7      ❌ renders at 375px mobile
objects.spec.ts:93:7       ❌ form validation — name required
objects.spec.ts:105:7      ❌ creates object in collection
objects.spec.ts:116:7      ❌ redirects to /sign-in without auth
objects.spec.ts:159:7      ❌ valid object shows name
objects.spec.ts:183:7      ❌ can navigate to object add page
public-collections.spec.ts:71:7   ❌ accessible without auth when isPublic=true
public-collections.spec.ts:78:7   ❌ shows collection name and objects
public-collections.spec.ts:120:7  ❌ accessible to owner when authenticated
public-collections.spec.ts:156:7  ❌ public collection visible to non-authenticated users
```

### Historique

| Date | Unitaires | E2E | Notes |
|---|---|---|---|
| Avant M004 | 60/60 | 28/76 (37%) | Fetch failed massifs, API non démarrée |
| 5 mai 2026 (S01) | 60/60 | 56/76 (74%) | +28 tests fixés : config BetterAuth, DB, double serveur |
| 6 mai 2026 | 60/60 | 56/76 (74%) | Stable — même baseline, serveurs manuels requis |

## Objectif M004

- ≥95% E2E (≥72/76)
- 60/60 unitaires maintenus
- Commande unique sans setup manuel
- Bug homepage (logo → /browse) corrigé

## Notes connues

- `BETTER_AUTH_SECRET` dans `.env` est court (warning BetterAuth). Suffisant pour les tests.
- Les tests E2E créent et nettoient eux-mêmes leurs données via les helpers `apps/web/e2e/helpers/auth.ts`.
- Les tests public-collections nécessitent des collections existantes en DB créées via `beforeEach`.
