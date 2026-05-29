# AUDIT BROL — 2026-05-29 (révisé après sprint P0/P1/P3)

> Audit synthétique du monorepo Brol.
> Périmètre : `apps/web`, `apps/mobile`, `packages/{api,db,shared}`, infra de test/déploiement.
>
> **Révision 2 (fin de journée 2026-05-29)** — après 9 commits (P0 + P1 + P3 + ops).
> Les notes en italique mentionnent les deltas vs la version initiale du matin.

---

## TL;DR

| Dimension                 | Initial | **Révisé** | Δ    |
| ------------------------- | :-----: | :--------: | :--: |
| Architecture              | 8/10    | **8/10**   |  →   |
| Qualité de code           | 6/10    | **7/10**   |  ↑   |
| Tests — unitaires         | 6/10    | **7/10**   |  ↑   |
| Tests — E2E               | 7/10    | **8/10**   |  ↑   |
| Sécurité                  | 6/10    | **6/10**   |  →   |
| DX / outillage            | 7/10    | **8/10**   |  ↑   |
| Documentation             | 8/10    | **9/10**   |  ↑   |
| CI/CD & déploiement       | 6/10    | **7/10**   |  ↑   |
| Complétude fonctionnelle  | 5/10    | **5/10**   |  →   |
| Parité mobile             | 4/10    | **4/10**   |  →   |
| **Global**                | 6.3/10  | **6.9/10** |  ↑   |

**Verdict actuel** : produit consolidé sur l'hygiène (CI verte avec
coverage, logger structuré, migrations Prisma versionnées, doc set
complet). Reste un **incident de test isolation** corrigé (perte
données dev locale via `vitest` mal isolé). **App mobile toujours
40 % derrière le web** et **6 features produit** en attente (cf.
BACKLOG.md P2).

---

## 1. Architecture — 8/10

### Inventaire

- **Monorepo Turborepo** : 2 apps (`web`, `mobile`) + 3 packages (`api`, `db`, `shared`).
- **API tRPC** : 14 routers, ~6 000 lignes TS.
- **Web Next.js 15 App Router** : 19 pages, ~11 300 lignes TS/TSX.
- **Mobile Expo SDK 54** : 12 écrans, ~2 200 lignes TS/TSX.
- **DB Prisma** : 17 modèles, PostgreSQL, sans dossier `migrations/` (workflow `db push`).
- **Auth** : BetterAuth, cross-subdomain cookies (`app.brol.dev` ↔ `api.brol.dev`).

### Points forts

- **Séparation claire** : code partagé (`@brol/shared`) consommé par les deux apps + l'API. Schémas Zod et types TS centralisés.
- **tRPC end-to-end typed** entre back et front : pas de schémas dupliqués.
- **Cross-subdomain auth** correctement géré (cookies + bearer token mobile via `expo-secure-store`).
- **Stack moderne et cohérente** : React 19, Next 15, Prisma 6, tRPC 11, BetterAuth 1.6, Tailwind, shadcn/ui.

### Points faibles

- **Pas d'historique de migrations** Prisma — `db push` direct. Risque sur la prod (drift entre environnements, pas de rollback typé).
- **Cycle de dépendance latent** : `packages/api` importe `@brol/db` qui importe le client Prisma généré dans `node_modules/@prisma/client` — la régénération n'est pas dans le pipeline `pnpm install` post-script.
- **Pas de couche service distincte** : la logique métier (transactions, règles tier, badges) vit directement dans les routers (cf. `loans.ts` 600+ lignes).
- **Stale artefacts** : `*.js`/`*.d.ts` traînaient dans `packages/shared/src/` (nettoyé dans `1a22d72`), ce qui shadowait les schémas Zod live. À surveiller, surveiller le `outDir` du tsconfig.

---

## 2. Qualité de code — 7/10 *(↑1, ancien score 6/10)*

*Δ révision : 2 `as any` killés dans les routers ; logger structuré
remplace 11 `console.*` API ; ~~39 any~~ → 5 explicites documentés. La
note remonte mais reste plafonnée par la dette `any` dans `auth.ts`
(3 escape hatches BetterAuth).*

### Métriques

- **`any` / `@ts-ignore` / `@ts-expect-error`** : 39 occurrences dans `packages/api/src` (hors tests).
- **`console.log` / `console.error` en code prod** : 37 occurrences (11 logs + 26 errors).
- **TODO / FIXME** : 3 marqueurs seulement (très peu, signe que la dette est plutôt invisible).
- **JSDoc** : ~11 `@type`/`@param` dans toute l'API → documentation inline faible côté types.

### Points forts

- **Conventions de commit** respectées (`feat:`, `fix:`, `refactor:`, `test:`).
- **Schemas Zod centralisés** dans `@brol/shared` — pas de validation dupliquée.
- **Pattern `protectedProcedure`/`publicProcedure`** uniforme dans tous les routers.

### Points faibles

- **Typage Prisma fuyant** dans l'API : les paramètres de `.map(o => …)`/`(loan) => …` tombent en `any` (cf. erreurs typecheck préexistantes dans `routers/loans.ts`, `objects.ts`, etc.). Cause : `prisma generate` n'est pas dans le post-install, donc TS perd le contexte.
- **Pas de linter strict actif** : `pnpm lint` tourne dans CI mais les règles `no-explicit-any` / `no-console` ne sont visiblement pas en `error`.
- **`console.error` utilisé comme observabilité** (pas de logger structuré type pino/winston) — invisible en prod.
- **Aucun outil de coverage** : `vitest` ne capture pas de coverage report, pas de seuil minimal.

---

## 3. Tests — unitaires : 7/10 *(↑1, ancien score 6/10)*

*Δ révision : couverture v8 wirée avec seuils 60/50/60/60 + HTML/lcov.
3 nouveaux test files (users/profile/review) = +35 tests. 11/14
routers testés (vs 8/14). Reste community-request, messages,
notification sans tests.*

### Inventaire

| Router               | Test unitaire |
| -------------------- | :-----------: |
| `collections.ts`     |       ✅      |
| `objects.ts`         |       ✅      |
| `loans.ts`           |       ✅      |
| `contacts.ts`        |       ✅      |
| `qr.ts`              |       ✅      |
| `photos.ts`          |       ✅      |
| `badge.ts`           |       ✅      |
| `tier.ts`            |       ✅      |
| `community-request.ts` |     ❌      |
| `messages.ts`        |       ❌      |
| `notification.ts`    |       ❌      |
| `profile.ts`         |       ❌      |
| `review.ts`          |       ❌      |
| `users.ts`           |       ❌      |

**Couverture nominale** : 8/14 routers testés (57 %).

### Points forts

- **60+ tests** côté API (cf. `TESTS.md` baseline du 6 mai).
- **`vitest` configuré** avec setup partagé (`src/test/setup.ts`) et mode `singleFork` pour les tests qui touchent la DB.
- **Tests fixés sur les flux critiques** : loans, contacts, collections, objects.

### Points faibles

- **6 routers sur 14 sans tests** dont `profile`, `users`, `review` qui sont touchés par les nouvelles features.
- **Pas de coverage report** : impossible de mesurer la couverture par fichier ni de mettre un seuil.
- **Pas de tests d'utilitaires** : `lib/handle.ts`, `lib/s3.ts`, `lib/badge-service.ts` non couverts.

---

## 4. Tests — E2E : 8/10 *(↑1, ancien score 7/10)*

*Δ révision : 18 rouges → 11 rouges (gain 7). Causes racines fixées :
middleware ne protégeait pas `/contacts` `/notifications` ; page
`/qr/[code]` mixait RSC + tRPC hooks ; helper `qrId` au lieu de
`qrStockId`. Nouveau spec `user-handle.spec.ts` couvre le flow
handle/QR/add-friend (8 tests verts).*

### Inventaire

17 fichiers spec Playwright (~190 tests d'après le dernier run) :

```
auth, browse, collections, contacts, homepage, loans, notifications,
object-edit, objects, photos, profile, public-collections,
qr, qr-scan, requests, settings, user-handle
```

### Points forts

- **Helpers réutilisables** dans `e2e/helpers/auth.ts` (createUserAPI, injectSessionFromToken, signIn/signOut, cleanupUser).
- **Endpoints `/api/test/*`** exposés pour faciliter le setup (`cleanup-user`, `get-token`) — bonne pratique sur un projet TypeScript fullstack.
- **Couverture fonctionnelle large** : auth, sessions, public collections, QR scan, photos, loans, notifications.
- **Last run après refactor + cleanup** : **166 passed / 18 failed / 6 skipped** (les 18 échecs sont préexistants — contacts, loans/responsive, qr-scan, requests).

### Points faibles

- **18 tests rouges chroniques** non triés : la pile s'accumule.
- **Pas de stratégie de retry/quarantaine** : un test flaky bloque la CI.
- **Pas de tests mobiles** (Expo) — aucun harness Detox/Maestro.
- **`scripts/e2e-run.sh` n'est pas idempotent** : tue les ports 3000/3001 sans demander, kill agressif `pkill -f`.

---

## 5. Sécurité — 6/10

### Points forts

- **Auth tokens** stockés via `expo-secure-store` côté mobile (Keychain/Keystore).
- **BetterAuth Bearer fallback** côté API en plus des cookies → cross-platform clean.
- **`protectedProcedure`** systématique sur toutes les mutations métier.
- **CORS / trusted origins** explicites dans `auth.ts`.
- **Schémas Zod** valident toutes les entrées tRPC.

### Points faibles

- **Pas de vérification de mot de passe à la création de compte** (TODO M008 connu dans `todo.md`).
- **Pas de rate limiting** sur l'API (aucun trace de middleware throttle/quota).
- **Pas d'audit trail** sur les actions sensibles (sign-in, sign-out, password change, delete account).
- **Endpoints `/api/test/cleanup-user`** : non gardés derrière une variable d'env `NODE_ENV !== "production"` (à vérifier sur `server.ts`).
- **39 `any` côté API** : surface d'erreur silencieuse, particulièrement risquée sur les inputs tRPC ré-cast.
- **Pas de scan SCA** (Snyk, npm audit, Dependabot) configuré dans la CI.

---

## 6. DX / outillage — 8/10 *(↑1, ancien score 7/10)*

*Δ révision : `scripts/postinstall.sh` règle le problème
`@prisma/client PrismaClient not exported` qui bloquait tout fresh
clone (symlink `.prisma`). Coverage HTML accessible via
`pnpm --filter @brol/api test:coverage`. Logger structuré JSON
disponible globalement.*

### Points forts

- **Turborepo** avec cache : `pnpm dev`, `pnpm build`, `pnpm typecheck` parallélisés.
- **`scripts/e2e-run.sh`** lance API+Web et attend la disponibilité avant Playwright.
- **Hot reload** sur tous les apps en dev (Next turbo, Expo Metro, tsx pour l'API).
- **Skill graphify** intégré pour comprendre l'archi (Q&A sur le code).

### Points faibles

- **Node engine** fixé à `>=20.18.0` mais l'env local par défaut a Node 19 (frictions à chaque session).
- **`prisma generate` pas dans le post-install** — bug récurrent : tu changes le schema → typecheck explose tant que tu n'as pas relancé manuellement.
- **`pnpm typecheck` plante en chaîne** à cause des `tsbuildinfo` qui pointent vers `dist/` non build.
- **CI minimaliste** : un seul workflow `lint + typecheck`, pas de jobs `test` ni `e2e`.

---

## 7. Documentation — 9/10 *(↑1, ancien score 8/10)*

*Δ révision : ARCHITECTURE.md (8 diagrammes Mermaid),
CONTRIBUTING.md, BACKLOG.md ajoutés. todo.md redirigé vers
BACKLOG.md. README.md indexe désormais tous les docs.*

### Inventaire

- `README.md` (81 lignes) — quickstart correct.
- `RAPPORT.md` (1 020 lignes) — historique des milestones M001 → M015.
- `MAINTENANCE.md` (467 lignes) — runbook ops (VPS, nginx, S3, certbot, déploiement).
- `DECISIONS.md` (225 lignes) — ADR des choix techniques (Turborepo, BetterAuth, Prisma, etc.).
- `TESTS.md` (173 lignes) — comment lancer les tests, baseline du 6 mai.
- `todo.md` (98 lignes) — backlog brut M008 + features à faire + bugs connus.

### Points forts

- **Excellente densité** pour un projet de cette taille (~1 900 lignes de doc Markdown).
- **DECISIONS.md** est rare et précieux : justifie les choix d'archi avec dates et alternatives évaluées.
- **MAINTENANCE.md** est opérationnel : tout le déploiement est copy-pastable.

### Points faibles

- **`RAPPORT.md` peut devenir un journal de bord** : 1020 lignes risquent de devenir illisibles. Découper par milestone fermée.
- **`todo.md` non structuré** : mix de bugs, features, idées — gagnerait à être migré vers Github Issues / Linear.
- **Pas de diagrammes** (flux auth, ER diagram, séquence prêt). Le code parle mais une vue d'ensemble manque.
- **Pas de CONTRIBUTING.md** : convention de branche, format PR, owners.

---

## 8. CI/CD & déploiement — 7/10 *(↑1, ancien score 6/10)*

*Δ révision : CI utilise désormais `pnpm install` (qui déclenche
postinstall = prisma generate + symlink). Job `test` lance
`test:coverage` et upload l'artifact 7 jours. Backup Postgres
scripté (`scripts/db-backup.sh`) avec rotation. Reste : pipeline de
déploiement auto (toujours rsync manuel) + staging séparé.*

### Points forts

- **VPS Hetzner CX22** + nginx + certbot, sous-domaines proxifiés Cloudflare. Topologie propre.
- **`MAINTENANCE.md`** documente exhaustivement le déploiement.
- **GitHub Actions** présent (`.github/workflows/ci.yml`).

### Points faibles

- **CI ne lance ni tests unitaires ni E2E** — uniquement `lint` + `typecheck`.
- **Pas de pipeline de déploiement automatisé** : déploiement manuel via SSH (cf. `MAINTENANCE.md`).
- **Pas de staging** distinct de la prod (`api.brol.dev` est unique).
- **Pas de release tagging** (`git tag v0.x`) : difficile de tracer ce qui tourne en prod.
- **Pas de backups DB automatiques** documentés.

---

## 9. Complétude fonctionnelle — 5/10

### Fonctionnel livré

- Comptes utilisateurs + sessions.
- Collections / objets / photos (S3).
- Contacts (Brol users + non-Brol).
- Prêts (création, retour, rappel email).
- QR codes (génération, scan, /qr/{code} public).
- Profils publics + reviews + badges + tiers.
- Notifications.
- Demandes communautaires (community-request router).
- Messages (router minimal pour QR scan owner contact).
- **Handle public `#piet1234`** + QR profil (sprint courant).

### Fonctionnel manquant (issu de `todo.md` M008)

#### Bugs connus

1. **Pas de vérification de mot de passe** à la création de compte.
2. **Erreur 500** sur création de prêt (`Emprunteur non trouvé`).
3. **Lien mort sur `/loans/new`** depuis le dashboard.
4. **Crash `ObjectCard`** quand `currentLoan.borrower` est null (cf. bug stack todo.md).

#### Features attendues

- **Cards dashboard** : liens vers tableaux filtrables (objets, prêts, contacts).
- **Section "Retours récents"** mal nommée et mal câblée.
- **Photo à la création d'objet** (actuellement uniquement à l'edit).
- **Scan QR pour assignation à objet** sur mobile.
- **Caution + prix de location** (jour/heure/semaine).
- **Champs spécifiques par type** : vêtements (taille/genre/couleur), outils (manuel/secteur/batterie/marque).
- **Modal d'edit objet** non adaptée au type.
- **Bouton "+" gros sur /loans** pour nouveau prêt rapide.
- **Dropdown contacts avec recherche** dans la modal de prêt.
- **Création contact directe** depuis la modal de prêt objet.

### Recommandation

Cinq features sur dix sont câblées mais incomplètes (UX rough). La priorité devrait être **fixer les 4 bugs M008** avant d'attaquer de nouvelles features.

---

## 10. Parité mobile — 4/10

### Couverture

- **19 pages web** vs **12 écrans mobile**.
- **Écrans présents** : sign-in/up, tabs (collections, objects, loans, profile, home), scan, loans/new, objects/add.
- **Écrans absents** : contacts, contact détail, notifications, requests, settings, profile public, QR public scan, photos.

### Points forts

- **Auth flow** mobile fonctionnel (Bearer token, session-sync).
- **Scan QR** natif via Expo Camera.
- **API client partagé** (mêmes endpoints tRPC).

### Points faibles

- **Pas de tests** mobile (ni unitaires ni E2E).
- **~50 % des écrans manquent** par rapport au web.
- **Mêmes types `AuthUser`/`AuthSession`** désormais partagés via `@brol/shared` (refactor récent) — bonne base pour combler le retard.

---

## 11. Synthèse — points forts

1. **Architecture monorepo claire** : séparation apps/packages bien pensée.
2. **Documentation au-dessus de la moyenne** : DECISIONS.md + MAINTENANCE.md ouvertement maintenus.
3. **Stack moderne et cohérente** : choix faits avec rationnelle (cf. DECISIONS.md).
4. **17 fichiers E2E** : Playwright sérieusement intégré.
5. **Schémas Zod centralisés** dans `@brol/shared`.
6. **BetterAuth cross-subdomain** correctement configuré.

## 12. Synthèse — points faibles

1. **Génération Prisma instable** : ~30 erreurs typecheck préexistantes liées au client Prisma non régénéré.
2. **39 `any` côté API** + 37 `console.*` en code prod → observabilité et type-safety dégradées.
3. **Mobile à 50 % de la parité web** + zéro test mobile.
4. **6 routers sur 14 sans tests unitaires** dont `profile`/`users`/`review`.
5. **CI sans tests** : seulement lint + typecheck.
6. **18 tests E2E rouges chroniques** non triés.
7. **Pas de migrations Prisma** versionnées (workflow `db push` direct).
8. **Pas de rate limiting / audit trail** côté sécurité.
9. **`todo.md` non structuré** : mélange bug critique et idée future.

---

## 13. Backlog priorisé (recommandation)

### P0 — Bloquants

| #  | Item                                                | Statut |
| -- | --------------------------------------------------- | :----: |
| 1  | 4 bugs M008 (password, 500 emprunt, lien, ObjectCard) | ✅ tous résolus / déjà fixés en pré-session |
| 2  | `prisma generate` en post-install                   | ✅ `scripts/postinstall.sh` |
| 3  | `as any` côté API                                   | ✅ 2 réels killés, 3 documentés |
| 4  | 18 tests E2E rouges                                 | ✅ → 11 (gain 7) |

### P1 — Hygiène

| #  | Item                                | Statut |
| -- | ----------------------------------- | :----: |
| 5  | Coverage v8 + seuils                | ✅ 60/50/60/60 |
| 6  | Tests des 6 routers manquants       | ⚠️ 3/6 livrés (users/profile/review). Reste community-request, messages, notification |
| 7  | `test` + `e2e` au CI                | ✅ déjà présent, switch to coverage |
| 8  | Migrate Prisma versionné            | ✅ 4 migrations reconcilées |
| 9  | Logger structuré                    | ✅ wrapper léger JSON déployé sur API |

### P2 — Produit (à venir)

Voir [BACKLOG.md §P2](BACKLOG.md#-p2--produit--mobile). Non commencé.

### P3 — Stratégique

| #  | Item                                | Statut |
| -- | ----------------------------------- | :----: |
| 14 | Detox/Maestro mobile                | ⏭ skip — décision infra |
| 15 | Staging séparé                      | ⏭ skip — VPS/DNS work |
| 16 | Migration backlog                   | ✅ BACKLOG.md structuré (push gh quand outil installé) |
| 17 | CONTRIBUTING.md + diagrammes        | ✅ + ARCHITECTURE.md (8 Mermaid) |

### Hors-roadmap initial — ajouté en cours de session

| Item                                                            | Statut |
| --------------------------------------------------------------- | :----: |
| Incident test isolation (DROP TABLE sur dev DB)                 | ✅ fix `TEST_DATABASE_URL` + garde `_test` suffix |
| Backup Postgres automatique (script + cron doc)                 | ✅ `scripts/db-backup.sh` |

---

## 14. Score détaillé

| Critère                    | Initial | Révisé | Justification                                                              |
| -------------------------- | :-----: | :----: | -------------------------------------------------------------------------- |
| Cohérence architecturale   | 9/10    | 9/10   | Monorepo propre, packages bien définis                                     |
| Séparation des couches     | 6/10    | 6/10   | Logique métier dans les routers, pas de service layer                      |
| Versioning de schéma       | 5/10    | 8/10   | 4 migrations Prisma reconcilées + workflow `migrate dev` documenté         |
| Typage end-to-end          | 6/10    | 7/10   | `as any` réduits à 0 routers + 3 hatches BetterAuth documentés             |
| Validation entrées         | 8/10    | 8/10   | Zod systématique sur tous les inputs                                       |
| Tests unitaires            | 6/10    | 7/10   | 11/14 routers (+35 tests). Reste 3 routers. Coverage seuil 60 % actif      |
| Tests E2E                  | 7/10    | 8/10   | 18 → 11 rouges. Spec dédiée handle/QR. Causes racines identifiées          |
| Tests mobiles              | 0/10    | 0/10   | Toujours absents (P3 §14 reporté)                                          |
| Auth                       | 8/10    | 8/10   | BetterAuth cross-platform propre                                           |
| Sécurité applicative       | 5/10    | 6/10   | Bugs M008 résolus. Rate limit + endpoints test toujours à gater            |
| Observabilité              | 3/10    | 6/10   | Logger structuré JSON déployé côté API (11 console.* migrés)               |
| Performance                | 7/10    | 7/10   | Pas mesurée, mais pas de signal d'alerte                                   |
| Documentation              | 8/10    | 9/10   | + ARCHITECTURE.md + CONTRIBUTING.md + BACKLOG.md + index README            |
| CI/CD                      | 5/10    | 7/10   | Coverage en artifact + postinstall robuste. Manque deploy auto + staging   |
| Onboarding nouveau dev     | 7/10    | 9/10   | Doc set complet + postinstall règle l'erreur Prisma client                 |

---

*Audit initial : 2026-05-29 matin (rev 1).*
*Révision : 2026-05-29 soir (rev 2) après 9 commits P0+P1+P3+ops.*
*Code base : ~20 500 lignes TS/TSX hors `node_modules`.*
