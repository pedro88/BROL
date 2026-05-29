# Contribuer à Brol

Guide rapide pour contribuer au monorepo.

---

## Prérequis

| Outil          | Version        | Pourquoi                                      |
| -------------- | -------------- | --------------------------------------------- |
| Node           | `>= 20.18.0`   | `--env-file` flag, Next.js 15                 |
| pnpm           | `>= 9.15.0`    | workspace + `node-linker=hoisted`             |
| PostgreSQL     | `>= 16`        | Datasource Prisma                             |
| Docker         | optional       | Pour lancer postgres rapidement               |

Sur cette machine :

```bash
nvm use 24   # ou 20
```

---

## Démarrage

```bash
# 1. Cloner + installer
git clone <repo>
cd brol
pnpm install      # postinstall : prisma generate + symlink .prisma

# 2. Configurer l'env
cp .env.example .env
# Éditer DATABASE_URL si besoin

# 3. Pousser le schema sur ta DB locale
pnpm db:push

# 4. Lancer tout
pnpm dev          # API (:3001) + Web (:3000) + Mobile en parallèle
```

---

## Architecture rapide

Voir [ARCHITECTURE.md](ARCHITECTURE.md) pour les diagrammes complets (auth flow, ER, séquence prêt).

```
brol/
├── apps/
│   ├── web/          # Next.js 15 (App Router)
│   └── mobile/       # Expo SDK 54
├── packages/
│   ├── api/          # Routers tRPC + BetterAuth config
│   ├── db/           # Prisma schema + client singleton
│   └── shared/       # Schemas Zod + types TS + i18n
├── scripts/
│   └── postinstall.sh   # Prisma generate + symlink
└── .github/workflows/
    └── ci.yml         # lint + typecheck + tests + e2e
```

---

## Workflow Git

### Branches

- `main` — branche de prod, protégée
- `feature/<short-name>` — nouvelle fonctionnalité
- `fix/<short-name>` — correction de bug
- `chore/<short-name>` — outillage, doc, refactor
- `milestone/m<NNN>` — pour un lot de changements liés à une milestone

### Commits — Conventional Commits

Format : `type(scope): description courte`

Types courants :

| Type        | Quand                                         |
| ----------- | --------------------------------------------- |
| `feat`      | Nouvelle fonctionnalité                       |
| `fix`       | Correction de bug                             |
| `refactor`  | Refactor sans changement de comportement      |
| `test`      | Ajout/modification de tests                   |
| `chore`     | Outillage, doc, CI                            |
| `perf`      | Optimisation perf                             |

Exemples :

```
feat(loans): integrate QR scanner in borrower select dialog
fix(auth): unify AuthUser/AuthSession types in @brol/shared
test(e2e): borrower sees A→B loan in Empruntés tab
chore(p1): coverage, structured logger, prisma migrate sync
```

Le message doit expliquer le **pourquoi**, pas le **quoi** (le diff montre le quoi). Si la PR est non-triviale, mettre les détails dans le body du commit (cf. `git log --oneline` récent).

### Pull Requests

1. Brancher depuis `main` à jour
2. Implémenter + tests
3. Vérifier en local :
   ```bash
   pnpm lint
   pnpm typecheck
   pnpm test
   pnpm test:e2e       # facultatif si UI non touchée
   ```
4. Push + ouvrir PR sur GitHub
5. Attendre que la CI passe
6. Merge — squash par défaut

---

## Tests

Voir [TESTS.md](TESTS.md) pour le détail.

```bash
# Unit (vitest, package API)
pnpm test
pnpm --filter @brol/api test:coverage   # avec coverage HTML

# E2E (Playwright)
pnpm test:e2e                # full suite
pnpm test:e2e -- --grep XYZ  # filter
pnpm test:e2e:ui             # mode UI Playwright
```

Avant de pousser un commit qui touche l'UI ou les routers, lancer au moins `pnpm test`.

### Coverage minimal

Configuré dans `packages/api/vitest.config.ts` :

| Type        | Seuil  |
| ----------- | -----: |
| Statements  | 60%    |
| Branches    | 50%    |
| Functions   | 60%    |
| Lines       | 60%    |

Si la PR fait baisser la couverture, ajouter des tests.

---

## Style code

- **TypeScript strict** : pas de `any` non documenté (eslint-disable + commentaire si forcé).
- **Tests obligatoires** pour toute nouvelle procédure tRPC.
- **`use client`** explicite sur tout composant qui utilise des hooks (`useState`, hooks tRPC, etc.). Les pages async restent RSC.
- **Pas de `console.*`** côté API : utiliser `logger.child("module").info|warn|error`.
- **Schemas Zod** dans `packages/shared/src/schemas/` — pas de validation inline dans les routers.

---

## Base de données

### Workflow recommandé

```bash
# 1. Éditer packages/db/prisma/schema.prisma
# 2. Créer la migration
cd packages/db
npx prisma migrate dev --name <description-courte>

# 3. Commit le dossier prisma/migrations/<timestamp>_<description>/
```

**Ne JAMAIS** utiliser `prisma db push` en prod ou sur main — c'est une fast path dev qui n'enregistre rien dans `prisma/migrations/`.

Pour réconcilier une DB modifiée par `db push` avec un fichier migration :

```bash
npx prisma migrate diff \
  --from-migrations prisma/migrations \
  --to-schema-datamodel prisma/schema.prisma \
  --script \
  --shadow-database-url postgresql://postgres:password@localhost:5432/brol_shadow \
  > prisma/migrations/<ts>_<desc>/migration.sql

npx prisma migrate resolve --applied <ts>_<desc>
```

---

## Skills internes utiles

Ce repo a deux skills/CLI installés localement :

- **`/graphify`** — construit un graphe de connaissance du code (`graphify-out/graph.html`, `GRAPH_REPORT.md`). Pratique pour comprendre les ponts entre modules.
- **`rtk`** — proxy CLI qui réécrit les commandes pour économiser des tokens. Transparent : `git status` → `rtk git status` via hook. Voir `rtk gain` pour les stats.

---

## Déploiement

Voir [MAINTENANCE.md](MAINTENANCE.md) pour le runbook prod complet (VPS, nginx, certbot, S3, Cloudflare).

Pour mémoire :

| Sous-domaine        | Cible                | Code              |
| ------------------- | -------------------- | ----------------- |
| `app.brol.dev`      | `brol-web:3000`      | `apps/web`        |
| `api.brol.dev`      | `brol-api:3001`      | `packages/api`    |
| `dev.brol.dev`      | tunnel SSH `:8081`   | Metro Expo HMR    |

---

## Owners

- **Backend / API / DB** : @pedro88
- **Frontend web** : @pedro88
- **Mobile** : @pedro88
- **Infra / VPS** : @pedro88

(Solo projet aujourd'hui — la table sera mise à jour quand l'équipe grossit.)

---

## Audit du projet

Voir [AUDIT.md](AUDIT.md) pour les scores actuels par dimension et le backlog priorisé P0 → P3. À mettre à jour tous les ~3 mois ou après un gros sprint.
