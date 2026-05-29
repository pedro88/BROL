# AUDIT BROL — 2026-05-29

> Audit synthétique du monorepo Brol.
> Périmètre : `apps/web`, `apps/mobile`, `packages/{api,db,shared}`, infra de test/déploiement.

---

## TL;DR

| Dimension                 | Score | Tendance |
| ------------------------- | :---: | :------: |
| Architecture              | 8/10  |    ↗    |
| Qualité de code           | 6/10  |    →    |
| Tests — unitaires         | 6/10  |    ↗    |
| Tests — E2E               | 7/10  |    ↗    |
| Sécurité                  | 6/10  |    →    |
| DX / outillage            | 7/10  |    →    |
| Documentation             | 8/10  |    ↗    |
| CI/CD & déploiement       | 6/10  |    →    |
| Complétude fonctionnelle  | 5/10  |    ↗    |
| Parité mobile             | 4/10  |    →    |
| **Global**                | **6.3/10** |    ↗    |

**Verdict** : produit en bonne santé, **architecture solide**, **doc au-dessus de la moyenne**, mais **dette technique** sur le typage côté API, **app mobile en retard** sur le web, et **6 routers sur 14 sans tests unitaires**.

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

## 2. Qualité de code — 6/10

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

## 3. Tests — unitaires : 6/10

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

## 4. Tests — E2E : 7/10

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

## 6. DX / outillage — 7/10

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

## 7. Documentation — 8/10

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

## 8. CI/CD & déploiement — 6/10

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

### P0 — Bloquants (1-2 sprints)

1. **Fixer les 4 bugs M008** (mot de passe, 500 emprunt, lien mort, crash ObjectCard).
2. **Bouger `prisma generate` en post-install** pour stabiliser le typecheck.
3. **Régler les 39 `any`** dans `packages/api/src` (typage Prisma propre).
4. **Trier les 18 tests E2E rouges** : skip explicite ou fix.

### P1 — Hygiène (2-3 sprints)

5. **Ajouter coverage** (`vitest --coverage`) + seuil minimal 70 %.
6. **Tester les 6 routers manquants** : `profile`, `users`, `review`, `notification`, `messages`, `community-request`.
7. **Ajouter `test` + `e2e` au workflow CI** (au moins en PR).
8. **Migrer vers `prisma migrate`** versionné.
9. **Logger structuré** (pino) pour remplacer les 37 `console.*`.

### P2 — Produit (3-5 sprints)

10. **Compléter parité mobile** : contacts, notifications, settings, profile public.
11. **Features `todo.md`** : champs par type d'objet, caution+location, photo à la création.
12. **Améliorer le dashboard** : cards cliquables, "prêts récents" correct.
13. **Système de quota côté API** (rate limiting + tier enforcement).

### P3 — Stratégique (sur la durée)

14. **Detox/Maestro pour mobile**.
15. **Staging séparé de la prod**.
16. **Migration backlog `todo.md` → Github Issues / Linear**.
17. **CONTRIBUTING.md** + diagrammes archi (Mermaid suffit).

---

## 14. Score détaillé

| Critère                    | Note  | Justification                                                              |
| -------------------------- | :---: | -------------------------------------------------------------------------- |
| Cohérence architecturale   | 9/10  | Monorepo propre, packages bien définis                                     |
| Séparation des couches     | 6/10  | Logique métier dans les routers, pas de service layer                      |
| Versioning de schéma       | 5/10  | `db push` direct, pas de migrations versionnées                            |
| Typage end-to-end          | 6/10  | tRPC OK mais `any` côté API + Prisma instable                              |
| Validation entrées         | 8/10  | Zod systématique sur tous les inputs                                       |
| Tests unitaires            | 6/10  | 8/14 routers, pas de coverage measurable                                   |
| Tests E2E                  | 7/10  | 17 specs, helpers solides, mais 18 rouges chroniques                       |
| Tests mobiles              | 0/10  | Absents                                                                    |
| Auth                       | 8/10  | BetterAuth cross-platform propre                                           |
| Sécurité applicative       | 5/10  | Bugs M008 + pas de rate limit + endpoints test exposés                     |
| Observabilité              | 3/10  | `console.error` partout, pas de logger structuré                           |
| Performance                | 7/10  | Pas mesurée, mais pas de signal d'alerte                                   |
| Documentation              | 8/10  | DECISIONS + MAINTENANCE + TESTS solides                                    |
| CI/CD                      | 5/10  | Lint+typecheck OK, mais ni tests ni deploy auto                            |
| Onboarding nouveau dev     | 7/10  | README + DECISIONS suffisent pour démarrer                                 |

---

*Audit généré le 2026-05-29.*
*Code base : ~20 500 lignes TS/TSX hors `node_modules`.*
