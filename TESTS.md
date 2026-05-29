# Guide des tests BROL

## Prérequis

PostgreSQL doit tourner localement sur le port 5432 avec le rôle `postgres:password`.

Une base **`brol_test`** dédiée aux tests unitaires doit exister. Si
elle n'existe pas :

```bash
PGPASSWORD=password psql -h localhost -U postgres -d postgres \
  -c "CREATE DATABASE brol_test;"
```

⚠️ **Important** — Vitest **n'utilise jamais** `DATABASE_URL`. Il
lit uniquement `TEST_DATABASE_URL`, ou tombe sur `brol_test` par
défaut. Le teardown drop toutes les tables : un garde-fou refuse de
tourner si le nom de DB ne finit pas par `_test`. Voir
`packages/api/src/test/setup.ts`.

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
# Depuis la racine
pnpm test

# Avec coverage HTML + lcov (CI utilise ça)
pnpm --filter @brol/api test:coverage

# Sur un fichier précis
cd packages/api && npx vitest run src/routers/__tests__/users.test.ts

# Mode watch
pnpm --filter @brol/api test:watch
```

#### Seuils de coverage actifs

| Type        | Seuil  |
| ----------- | -----: |
| Statements  | 60%    |
| Branches    | 50%    |
| Functions   | 60%    |
| Lines       | 60%    |

Configurés dans `packages/api/vitest.config.ts`. Si la PR fait
descendre la couverture sous ces seuils, le job CI fail.

Rapport HTML après `test:coverage` : `packages/api/coverage/index.html`.

### Tests E2E (Playwright)

```bash
# Lance API + Web puis tous les tests
pnpm test:e2e

# Filtrer
pnpm test:e2e -- --grep "user-handle"

# Mode UI interactif
pnpm test:e2e:ui
```

Le script `scripts/e2e-run.sh` démarre l'API (`tsx src/server.ts`) sur
:3001 et le web (`next dev`) sur :3000, attend leur disponibilité,
puis lance Playwright. Cleanup à la fin (kill ports 3000/3001).

## Baseline actuelle — 29 mai 2026 (post-P1)

### Tests unitaires : 132/134 (98 %)

| Fichier                  | Tests | Statut |
| ------------------------ | ----: | :----: |
| `badge.test.ts`          |     5 |   ✅   |
| `collections.test.ts`    |    14 |   ⚠️ 2 rouges (auth UNAUTHORIZED) |
| `contacts.test.ts`       |    12 |   ✅   |
| `loans.test.ts`          |    11 |   ✅   |
| `objects.test.ts`        |    11 |   ✅   |
| `photos.test.ts`         |    13 |   ✅   |
| **`profile.test.ts`**    |    10 |   ✅ *nouveau (P1)* |
| `qr.test.ts`             |    12 |   ✅   |
| **`review.test.ts`**     |    12 |   ✅ *nouveau (P1)* |
| `tier.test.ts`           |    21 |   ✅   |
| **`users.test.ts`**      |    13 |   ✅ *nouveau (P1)* |

11/14 routers ont un fichier de tests. Manquants : `community-request`,
`messages`, `notification`.

### Tests E2E : 182/193 (94 %)

11 rouges chroniques restants (contacts ×5, loans ×4, profile ×1,
requests ×1). Voir BACKLOG.md §P0 pour le triage individuel.

Spec récente : `user-handle.spec.ts` — 8 tests couvrant le flux
handle public + QR add-friend + propagation A→B sur `/loans`.

### Historique

| Date            | Unit             | E2E              | Notes |
| --------------- | ---------------- | ---------------- | ----- |
| Avant M004      | 60/60            | 28/76 (37 %)     | Fetch failed massifs, API non démarrée |
| 5 mai 2026 (S01)| 60/60            | 56/76 (74 %)     | +28 fixés : config BetterAuth, DB, double serveur |
| 6 mai 2026      | 60/60            | 56/76 (74 %)     | Stable |
| **29 mai 2026** | **132/134 (98%)** | **182/193 (94%)** | P0+P1 : +35 unit tests, middleware fixé, RSC split QR, coverage v8 |

## Écrire un test unitaire

Pattern actuel (cf. `users.test.ts` / `profile.test.ts`) :

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "../../router";
import { prisma, createTestUser } from "../../test/setup";

function callerFor(userId: string) {
  return appRouter.createCaller({
    prisma,
    userId,
    session: { user: { id: userId } },   // requis si la procédure lit ctx.session
    headers: {},
  });
}

function publicCaller() {
  return appRouter.createCaller({
    prisma, userId: null, session: null, headers: {},
  });
}

describe("monRouter", () => {
  beforeEach(async () => {
    // Cleanup tables touchées (l'ordre compte à cause des FK).
    await prisma.review.deleteMany();
    await prisma.user.deleteMany();
  });

  it("retourne le user", async () => {
    const u = await createTestUser({ name: "Alice" });
    const res = await callerFor(u.id).users.me();
    expect(res?.id).toBe(u.id);
  });
});
```

## Écrire un test E2E

Pattern dans `apps/web/e2e/user-handle.spec.ts`. Helpers utiles :

| Helper                             | Quoi                                                  |
| ---------------------------------- | ----------------------------------------------------- |
| `createUserAPI(email, pw, name)`   | Crée un user via `/api/auth/sign-up/email`, retourne `{ token, user }` |
| `signIn(page, email, password)`    | Form-submit + attend la redirection                   |
| `clearSession(page)`               | Wipe cookies + storage avant test cross-user          |
| `cleanupUser(email)`               | Supprime user + données via `/api/test/cleanup-user`  |
| `uniqueEmail()`                    | Email unique horodaté (évite les collisions parallèles) |

Pour multi-user (A prête à B) : `cleanupUser` les deux dans
`afterEach`.

## Notes

- `BETTER_AUTH_SECRET` dans `.env` est court (warning BetterAuth) —
  suffisant pour les tests.
- Endpoints `/api/test/*` (cleanup-user, get-token) sont publics et
  doivent être gatés derrière `NODE_ENV !== "production"` avant tout
  déploiement (cf. AUDIT.md §5).
