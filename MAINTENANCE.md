# MAINTENANCE — Brol

Runbook opérationnel pour l'infrastructure Brol (déploiement + mobile dev).

> Document de référence — toutes les commandes sont copiables.
> Mis à jour : 2026-05-20 (déploiement initial OK)

---

## 1. Architecture

| Composant | Techno | Code | Runtime |
|---|---|---|---|
| Frontend web | Next.js 15 (App Router) | `apps/web` | Container `brol-web` |
| API | tRPC + Better-auth (Node + esbuild bundle) | `packages/api` | Container `brol-api` |
| Mobile | Expo SDK 54 (RN 0.81) | `apps/mobile` | Sur le téléphone |
| Schéma DB | Prisma | `packages/db` | — |
| Base de données | Postgres 16 | — | Natif sur le VPS |
| Reverse proxy | nginx + certbot | `deploy/nginx/` | Natif sur le VPS |

### Topologie

```
                              ┌──────────────────────────────────┐
                              │   VPS Hetzner CX22 (Falkenstein) │
                              │   IP : 91.98.87.65               │
                              │                                  │
  app.brol.dev  ─ HTTPS ────▶ │ ┌──────┐  ┌─────────────────┐    │
                              │ │nginx │─▶│ brol-web :3000  │    │  Next.js
  api.brol.dev  ─ HTTPS ────▶ │ │      │─▶│ brol-api :3001  │    │  tRPC+Auth
                              │ │      │  │ postgres :5432  │    │  natif
  dev.brol.dev  ─ HTTPS ────▶ │ │      │─▶│ host :8081      │    │
                              │ └──────┘  └─────────────────┘    │
                              │                                  │
                              └──────────────────────────────────┘
                                        ▲
                                        │  ssh -R 8081:localhost:8081
                                        │
                                  Poste de dev (Metro Expo)
```

### Sous-domaines

| Sous-domaine | Cible | Cloudflare | Usage |
|---|---|---|---|
| `app.brol.dev` | brol-web (3000) | Proxy ON (orange) | App web utilisateur |
| `api.brol.dev` | brol-api (3001) | Proxy ON (orange) | API tRPC + Better-auth |
| `dev.brol.dev` | host:8081 (tunnel SSH) | DNS only (gris) | Metro pour dev mobile |

`dev.brol.dev` doit rester en DNS-only car Cloudflare ne supporte pas les WebSockets Metro HMR.

---

## 2. Accès

### VPS

```bash
ssh piet@91.98.87.65
# Clé : ~/.ssh/id_ed25519
# Sudo : NOPASSWD (config dans /etc/sudoers.d/piet-nopasswd)
```

### Cloudflare

Compte propriétaire du domaine `brol.dev` (Registrar + DNS). Dashboard : https://dash.cloudflare.com

### Hetzner

Console : https://console.hetzner.cloud — projet contenant le serveur `ubuntu-4gb-fsn1-1`.

### Object Storage S3

- Endpoint : `https://fsn1.your-objectstorage.com`
- Bucket : `brol-storage`
- Region : `eu-central-1`
- Credentials : dans `/opt/brol/.env` (`S3_ACCESS_KEY`, `S3_SECRET_KEY`).
  Génération : console Hetzner → Object Storage → S3 credentials →
  "Generate credentials" (secret n'est affiché qu'une fois).
- CLI sur le VPS : `s3cmd ls` (config dans `~/.s3cfg`). `host_bucket`
  doit pointer vers `%(bucket)s.fsn1.your-objectstorage.com` (sinon
  s3cmd tape `s3.amazonaws.com` par défaut → `InvalidAccessKeyId`).

**Configuration du bucket (policy + CORS)** — codifiée dans
[deploy/s3/](../deploy/s3/) :

- [`bucket-policy.json`](../deploy/s3/bucket-policy.json) — public-read
  sur `photos/*` (les keys sont des UUID v4, pas de risque d'énumération).
  Le frontend rend `<img src>` directement depuis l'URL publique S3.
- [`cors.xml`](../deploy/s3/cors.xml) — autorise `GET/PUT/HEAD` depuis
  `https://app.brol.dev` (presigned PUT côté navigateur).
- [`setup.sh`](../deploy/s3/setup.sh) — applique policy + CORS via
  `s3cmd`. Idempotent.

**Appliquer / réappliquer la conf** (depuis le VPS) :

```bash
ssh piet@91.98.87.65
cd /opt/brol
bash deploy/s3/setup.sh        # bucket défaut = brol-storage
```

⚠️ **Ne jamais éditer la policy ou CORS directement via la console
Hetzner ou s3cmd ad-hoc** — modifier les fichiers du repo et
ré-exécuter `setup.sh` pour garder prod ↔ repo en phase.

**Flux upload** (web) :
1. Client demande `photos.getPresignedUrl` → presigned PUT 15 min.
2. Client `PUT` directement vers S3 avec `Content-Type` correct.
3. Client appelle `photos.add` avec l'URL publique pour persister.

Le fichier est ensuite servi public depuis
`https://fsn1.your-objectstorage.com/brol-storage/photos/{objectId}/{uuid}.{ext}`.

---

## 3. Opérations courantes

> Sur le VPS, dans `/opt/brol/`. Le user `piet` est dans le groupe `docker`.

### État des services

```bash
cd /opt/brol
docker compose ps
docker compose logs --tail=100 -f         # tous les services
docker compose logs --tail=100 -f api     # un seul
```

### Redémarrer

```bash
docker compose restart api
docker compose restart web
sudo systemctl reload nginx
```

### Déployer une nouvelle version

> Le code source du VPS vit dans `/opt/brol`. Pour l'instant, sync via rsync depuis le poste de Piet.

**Depuis le poste de Piet :**
```bash
cd ~/Projets/webDev/BROL

# 1. Build web localement (le build Docker pour Next 15 a un bug de prerender,
#    on utilise donc la stratégie "prebuilt artifact")
#
#    /!\ Les `NEXT_PUBLIC_*` sont inlinés au moment du build. Sans override,
#    Next prend `apps/web/.env.local` qui pointe vers `http://localhost:3001`
#    → le bundle envoyé au navigateur fait des requêtes à localhost et le
#    sign-in échoue (ERR_CONNECTION_REFUSED). On force donc les URLs prod ici.
cd apps/web && \
  NEXT_PUBLIC_API_URL=https://api.brol.dev \
  NEXT_PUBLIC_APP_URL=https://app.brol.dev \
  NODE_ENV=production \
  pnpm run build && \
  cd ../..

# 2. Sync code + artefact prebuilt vers le VPS
#    .pnpm-store/ est exclu : inutile côté VPS (le Dockerfile API a son
#    propre store via cache mount) et créé en root sur le VPS lors d'un
#    précédent run → rsync ne peut pas l'effacer (Permission denied) si on
#    ne l'exclut pas.
#
#    /!\ Les excludes `.next/*` sont ANCRÉS (préfixe `/`). Sans ancrage,
#    rsync matche le pattern n'importe où dans le path et exclut aussi
#    `.next/standalone/apps/web/.next/server/` — qui contient le middleware
#    bundle. Résultat : le middleware ne se met JAMAIS à jour côté VPS.
rsync -az --delete \
  --exclude=node_modules \
  --exclude='/apps/web/.next/cache' \
  --exclude='/apps/web/.next/types' \
  --exclude='/apps/web/.next/server' \
  --exclude='.pnpm-store' \
  --exclude=.git --exclude=.env --exclude='**/.env' \
  ./ piet@91.98.87.65:/opt/brol/

# 3. Sur le VPS, rebuild les containers + restart
ssh piet@91.98.87.65 'cd /opt/brol && docker compose build && docker compose up -d'
```

### Migrations Prisma

```bash
ssh piet@91.98.87.65 'cd /opt/brol && docker run --rm --network host \
  -e DATABASE_URL="$(grep ^DATABASE_URL /opt/brol/.env | cut -d= -f2-)" \
  -v /opt/brol/packages/db/prisma:/prisma \
  node:24-bookworm-slim sh -c "npx -y prisma@6.19.3 migrate deploy --schema=/prisma/schema.prisma"'
```

### Backup Postgres

Le script `scripts/db-backup.sh` automatise pg_dump + rotation. Il lit
`DATABASE_URL` depuis `.env`, dump en gzip, et garde les `BACKUP_RETAIN`
derniers (défaut 14).

#### Dev local — daily cron

```bash
crontab -e
# Ajouter :
0 3 * * * cd /home/piet/Projets/webDev/BROL && bash scripts/db-backup.sh >> /var/log/brol-backup.log 2>&1
```

Test à chaud :

```bash
bash scripts/db-backup.sh
ls -lah backups/
```

#### VPS prod — hourly retention 72h

```bash
ssh piet@91.98.87.65 'sudo crontab -e'
# Ajouter :
0 * * * * cd /opt/brol && BACKUP_RETAIN=72 bash scripts/db-backup.sh /opt/brol/backups >> /var/log/brol-backup.log 2>&1
```

Vérifier les logs :

```bash
ssh piet@91.98.87.65 'tail -20 /var/log/brol-backup.log'
```

#### Backup ponctuel manuel

```bash
# Local
bash scripts/db-backup.sh

# Prod (via SSH)
ssh piet@91.98.87.65 'cd /opt/brol && bash scripts/db-backup.sh /opt/brol/backups'
```

### Restore

```bash
# Décompresser + injecter dans une DB vide
gunzip -c backups/brol-YYYYMMDD-HHMMSS.sql.gz | psql "$DATABASE_URL"

# Prod
ssh piet@91.98.87.65 \
  'gunzip -c /opt/brol/backups/brol-YYYYMMDD-HHMMSS.sql.gz | sudo -u postgres psql brol'
```

⚠️ Avant restore en prod, **arrêter le container `brol-api`** pour éviter
les écritures concurrentes pendant le replay.

### Renouvellement TLS

Certbot gère ça via cron (`/etc/cron.d/certbot`). Renouvellement manuel forcé :

```bash
sudo certbot renew
sudo systemctl reload nginx
```

---

## 4. Dev mobile via tunnel SSH

### Setup initial (à faire une fois)

Installer `autossh` sur le poste de dev :

```bash
sudo pacman -S autossh   # Arch
```

Copier le script de tunnel :

```bash
cp ~/Projets/webDev/BROL/deploy/expo-tunnel.sh ~/bin/expo-tunnel.sh
chmod +x ~/bin/expo-tunnel.sh
```

### Workflow journalier

```bash
# Terminal 1 — Metro (port 8081)
cd ~/Projets/webDev/BROL/apps/mobile
npx expo start

# Terminal 2 — Tunnel SSH (laisser tourner)
~/bin/expo-tunnel.sh
```

Sur Expo Go (ou le dev build), scanner le QR ou ouvrir : `exp://dev.brol.dev`.

### Si le tunnel ne marche pas

| Symptôme | Vérification |
|---|---|
| `dev.brol.dev` → 502 | Le tunnel SSH n'est pas actif sur le poste, relancer `~/bin/expo-tunnel.sh` |
| `dev.brol.dev` → 504 timeout | Metro est down. Vérifier que `npx expo start` tourne sur le poste |
| HMR ne se met pas à jour | Cloudflare proxy sur `dev.brol.dev` est passé en orange → repasser en gris |

---

## 5. DNS — enregistrements actuels (Cloudflare)

| Nom | Type | Cible | Proxy | TTL |
|---|---|---|---|---|
| `@` (brol.dev) | A | 91.98.87.65 | Proxied | Auto |
| `www` | A | 91.98.87.65 | Proxied | Auto |
| `app` | A | 91.98.87.65 | Proxied | Auto |
| `api` | A | 91.98.87.65 | Proxied | Auto |
| `dev` | A | 91.98.87.65 | **DNS only** | Auto |

---

## 6. Variables d'environnement

### `/opt/brol/.env` (sur le VPS)

```env
DATABASE_URL=postgresql://piet:<password>@127.0.0.1:5432/brol?schema=public
BETTER_AUTH_SECRET=<32 bytes base64>
BETTER_AUTH_URL=https://api.brol.dev
# Permet au cookie de session d'être partagé entre app.brol.dev et api.brol.dev.
# /!\ ne définir QU'EN PROD — en local, laisser vide (Better-auth utilisera le
# cookie host-only sur localhost, ce qui suffit).
BETTER_AUTH_COOKIE_DOMAIN=.brol.dev
NEXT_PUBLIC_API_URL=https://api.brol.dev
NEXT_PUBLIC_APP_URL=https://app.brol.dev
API_URL=https://api.brol.dev
NODE_ENV=production
PORT=3001

# Optionnel (à remplir selon les fonctionnalités activées)
GOOGLE_CLIENT_ID=...
GITHUB_CLIENT_ID=...
APPLE_CLIENT_ID=...
S3_ENDPOINT=https://fsn1.your-objectstorage.com
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
S3_BUCKET=brol-storage
RESEND_API_KEY=...
RESEND_FROM_EMAIL=Brol <noreply@brol.dev>
# BoardGameGeek XML API — Bearer token requis depuis oct. 2025.
# Enregistrer l'app sur https://boardgamegeek.com/using_the_xml_api
# Sans token, la recherche BGG du formulaire BOARD_GAME est masquée.
BGG_API_TOKEN=...
```

> Pour régénérer le secret Better-auth : `openssl rand -base64 32`
> Pour reset le password Postgres : `sudo -u postgres psql -c "ALTER USER piet WITH ENCRYPTED PASSWORD 'nouveau-pass';"`

### `apps/mobile/.env` (sur le poste de dev)

```env
EXPO_PUBLIC_API_URL=https://api.brol.dev
```

---

## 7. Troubleshooting

### Container `brol-web` redémarre en boucle (Cannot find module 'next')

→ Le `.dockerignore` exclut les fichiers du standalone Next. Vérifier qu'il contient les `!apps/web/.next/standalone/**` et `!apps/web/.next/static/**` en fin de fichier.

### `Cannot find Prisma Query Engine for runtime "debian-openssl-1.1.x"`

Deux causes possibles :

1. **Engine pas tracé dans le bundle Next** : vérifier que `next.config.js` contient :
```js
serverExternalPackages: ["@prisma/client", "@prisma/engines", "prisma"],
outputFileTracingIncludes: { "/**/*": ["../../node_modules/.pnpm/@prisma+client*/**", ...] },
```

2. **OpenSSL pas installé dans l'image runtime** : `node:bookworm-slim` n'inclut PAS openssl, donc Prisma ne peut pas détecter `3.0.x` au runtime, défaut sur `1.1.x`, et cherche un engine qui n'a pas été bundlé. Les deux Dockerfiles (`apps/web/Dockerfile` et `packages/api/Dockerfile`) doivent installer `openssl` :
```dockerfile
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
```

### `useContext null` au build Next dans Docker

Bug Next 15 + Docker spécifique au prerender. Solution actuelle : on build localement et on COPY l'artefact `.next/standalone` dans une image Docker minimale (cf. `apps/web/Dockerfile`).

### `/api/auth/get-session` renvoie 500 sur app.brol.dev

Better-auth tourne en **double** : une fois dans l'API (`packages/api/src/auth.ts`)
et une fois dans le web (`apps/web/src/app/api/auth/[...all]/route.ts`). Les deux
DOIVENT partager exactement la même config (secret, trustedOrigins,
crossSubDomainCookies, defaultCookieAttributes) pour que le cookie posé par l'une
soit reconnu par l'autre. Si tu modifies l'une, vérifie l'autre.

À terme, factoriser la config dans `@brol/api` et l'importer côté web (cf. la
fonction `createAuthWithPlugins` déjà exportée).

### tRPC crashe avec `The table public.<name> does not exist`

Le code Prisma utilise un modèle (`prisma.profile.findUnique()`, etc.) dont la
table n'existe pas en prod. Cause classique : le `schema.prisma` a été modifié
en dev (ajout de modèles) sans `prisma migrate dev` pour créer la migration.

Vérif rapide de l'état des migrations en prod :
```bash
ssh piet@91.98.87.65 'sudo -u postgres psql brol -c "SELECT migration_name, finished_at FROM _prisma_migrations ORDER BY started_at;"'
ssh piet@91.98.87.65 'ls /opt/brol/packages/db/prisma/migrations/'   # ce qui est déployé
ls packages/db/prisma/migrations/                                     # ce qui est local
```

Fix : générer une migration qui rattrape le delta entre la DB et le schéma
(via tunnel SSH postgres → `prisma migrate diff`), la rsync, puis
`migrate deploy` :

```bash
# 1. Tunnel SSH temporaire vers postgres (port local 15432 → 5432 sur VPS)
ssh -L 15432:127.0.0.1:5432 piet@91.98.87.65 -N -f

# 2. Générer le SQL via migrate diff (DB url depuis /opt/brol/.env sur le VPS)
DBURL="postgresql://piet:<password>@127.0.0.1:15432/brol?schema=public"
npx -y prisma@6.19.3 migrate diff \
  --from-url "$DBURL" \
  --to-schema-datamodel packages/db/prisma/schema.prisma \
  --script > /tmp/delta.sql
# Retirer les éventuels `npm warn ...` qui se glissent en tête du fichier

# 3. Créer le dossier de migration et le syncer
NAME=20260522060000_descriptive_name
mkdir -p packages/db/prisma/migrations/$NAME
cp /tmp/delta.sql packages/db/prisma/migrations/$NAME/migration.sql
rsync -az packages/db/prisma/migrations/$NAME/ \
  piet@91.98.87.65:/opt/brol/packages/db/prisma/migrations/$NAME/

# 4. Apply (cf. section "Migrations Prisma")
ssh piet@91.98.87.65 'cd /opt/brol && docker run --rm --network host \
  -e DATABASE_URL="$(grep ^DATABASE_URL /opt/brol/.env | cut -d= -f2-)" \
  -v /opt/brol/packages/db/prisma:/prisma \
  node:24-bookworm-slim sh -c "npx -y prisma@6.19.3 migrate deploy --schema=/prisma/schema.prisma"'

# 5. Fermer le tunnel
pkill -f "ssh -L 15432"
```

À terme : enforcer `prisma migrate dev` dès qu'on modifie `schema.prisma`, et
ne JAMAIS faire `prisma db push` même en dev (sinon on n'a pas l'historique).

### Le sign-in fait `ERR_CONNECTION_REFUSED` sur `localhost:3001`

Le navigateur essaie de joindre `http://localhost:3001/api/auth/sign-in/email`
au lieu de `https://api.brol.dev/...`. Cause : `NEXT_PUBLIC_API_URL` est
inliné dans le bundle JS au moment du `pnpm run build`. Si la build a lu
`apps/web/.env.local` (qui pointe vers `localhost` pour le dev), tous les
appels du client le feront aussi en prod.

Vérif :
```bash
grep -o "localhost:3001\|api.brol.dev" apps/web/.next/static/chunks/*.js | sort | uniq -c
```

Fix : rebuild avec les bons `NEXT_PUBLIC_*` en variables d'environnement
(cf. section "Déployer une nouvelle version"). Ne pas commiter ces URLs dans
`.env.local` — ce fichier reste réservé au dev.

### Les modifs du middleware ne s'appliquent pas sur le VPS

Symptôme : tu modifies `apps/web/src/middleware.ts`, tu rebuild, tu rsync, tu
rebuild docker, mais le comportement ne change pas — comme si le container
servait toujours l'ancienne version.

Cause : ton `rsync` exclut `.next/server` sans ancrage. Comme rsync matche les
patterns relatifs **n'importe où** dans le path, il exclut aussi
`apps/web/.next/standalone/apps/web/.next/server/`, qui contient le bundle du
middleware. Du coup le code dans le standalone reste figé à la version qu'il
avait quand le dossier a été créé pour la première fois.

Vérif :
```bash
ssh piet@91.98.87.65 'ls -la /opt/brol/apps/web/.next/standalone/apps/web/.next/'
# Si `server/` a une date plus vieille que les autres fichiers, c'est ça.
```

Fix : ancrer les excludes avec `/` initial (cf. section "Déployer une nouvelle
version"). `--exclude='/apps/web/.next/server'` ne matchera que le `server/`
à la racine d'`apps/web/.next/` et laissera passer le sous-chemin imbriqué.

### Redirection infinie après sign-in

Diagnostic : ouvre Devtools → Application → Cookies sur `app.brol.dev`. Cherche
`__Secure-better-auth.session_token` (ou `better-auth.session_token` en dev).

- Si absent : le cookie n'est pas posé. Vérifie `BETTER_AUTH_COOKIE_DOMAIN=.brol.dev`
  dans `/opt/brol/.env`, et que la config Better-auth (api ET web) contient
  `advanced.crossSubDomainCookies.enabled = true`.
- Si présent : le middleware ne le détecte pas. Vérifie que `getSessionCookie`
  dans `apps/web/src/middleware.ts` essaie bien les trois variantes
  (`__Secure-`, `__Host-`, brut).

### nginx ne se reload pas

```bash
sudo nginx -t      # vérifier la syntaxe
sudo systemctl status nginx
```

### J'ai uploadé un vhost et HTTPS ne marche plus / app.* redirige vers localhost

Certbot ajoute le bloc `listen 443 ssl` directement dans `/etc/nginx/sites-enabled/<vhost>`. Si tu réuploades le fichier depuis `deploy/nginx/`, tu écrases ses modifs. Pour rétablir :

```bash
sudo certbot install --cert-name <vhost> --nginx -d <vhost>
sudo systemctl reload nginx
```

À terme, conserver les vhosts dans `deploy/nginx/` **après modifications certbot** (les copier depuis le VPS vers le repo).

### Certificat Let's Encrypt qui expire

Le cron de certbot devrait gérer ça. Vérifier :
```bash
sudo certbot certificates       # voit les certifs et leur date d'expiration
sudo systemctl status certbot.timer
```

---

## 8. Historique des décisions

| Date | Décision | Raison |
|---|---|---|
| 2026-05-11 | VPS Hetzner CX22 + setup Ubuntu + nginx + Postgres + S3 | Démarrage de l'infra |
| 2026-05-20 | Migration Expo SDK 51 → 54 | SDK 51 plus chargeable dans Expo Go store |
| 2026-05-20 | Ajout `apps/mobile/metro.config.js` | Résolution monorepo pnpm pour Metro |
| 2026-05-20 | Suppression `babel-plugin-module-resolver` | Dépendance fantôme, alias inutilisés |
| 2026-05-20 | `.npmrc` avec `node-linker=hoisted` | Expo incompatible avec store isolé pnpm |
| 2026-05-20 | Setup déploiement VPS : Docker + nginx + reverse tunnel SSH | Indépendance vis-à-vis du hotspot et de ngrok |
| 2026-05-20 | Stratégie "prebuilt artifact" pour Next.js (build local + COPY) | Bug Next 15 useContext lors du prerender Docker |
| 2026-05-20 | `output: 'standalone'` + `serverExternalPackages` Prisma | Image Docker minimale incluant les binaires Prisma |
| 2026-05-21 | Better-auth `trustedOrigins` + `crossSubDomainCookies` (domain `.brol.dev`) | Sign-in/sign-up entre app.* et api.* (CSRF check + cookie partagé) |
| 2026-05-21 | Middleware Next lit `__Secure-` / `__Host-` / brut pour le cookie session | En prod HTTPS Better-auth préfixe le cookie, le middleware doit suivre |
| 2026-05-21 | Web Better-auth aligné sur la config de l'API | Les deux instances partagent le même cookie : configs doivent matcher |
| 2026-05-21 | Install `openssl` dans les images runtime web + api | Prisma défaut sur engine 1.1.x sans openssl → crash, get-session 500 |
| 2026-05-22 | Ancrage `/apps/web/.next/{server,cache,types}` dans les excludes rsync | Sans ancrage, le pattern matchait aussi `.next/standalone/apps/web/.next/server/` → middleware jamais re-sync sur le VPS |
| 2026-05-22 | Override `NEXT_PUBLIC_*` à la commande build (au lieu de se reposer sur `.env.local`) | `.env.local` du dev pointe vers `localhost:3001`, et `NEXT_PUBLIC_*` est inliné au build → le bundle prod aurait des appels à localhost |
| 2026-05-22 | Migration `20260522060000_add_social_and_rental_fields` (profiles, reviews, badges, requests, notifications + champs rental/clothing/tool sur objects) | Le dev avait modifié `schema.prisma` sans créer de migration → tRPC `collections.create` crashait en prod sur `prisma.profile.findUnique()` (table absente). Migration générée via `prisma migrate diff --from-url <prod> --to-schema-datamodel` |
| 2026-05-30 | `pnpm install --ignore-scripts` dans le stage `deps` du Dockerfile API + symlink `.prisma` inliné dans le stage `builder` | Le `postinstall` racine (ajouté commit `3382fae`) appelle `bash scripts/postinstall.sh`. Le dossier `scripts/` n'est pas copié dans le stage `deps` → `pnpm install` échouait au moment du build. Solution : ignorer les scripts à l'install (le `prisma generate` est déjà explicite dans `builder`) et reproduire le symlink hoisted-linker inline, sans dépendre du fichier |
| 2026-05-30 | Application des migrations `20260529160000_add_handle_and_messages` + `20260530100000_add_brand_and_tool_power_source` en prod (rsync + `prisma migrate deploy`) | Après deploy code, sign-in renvoyait 500 — Better-auth crashait sur `prisma.user.findFirst()` avec `column users.handle does not exist`. Les deux migrations existaient déjà dans le repo (commits `d2cbdd0` + un suivant) mais n'avaient jamais été appliquées sur le VPS faute de redeploy depuis. Penser à `prisma migrate deploy` à chaque deploy code qui contient une nouvelle migration |

---

## 9. À faire (dette technique)

- [ ] Ajouter un endpoint `/health` sur l'API pour réactiver le healthcheck Docker
- [x] ~~Cron de backup Postgres automatique~~ — `scripts/db-backup.sh` + cron documenté §3
- [ ] Logs persistants (actuellement perdus quand on recycle les containers — ajouter `logging:` driver json-file avec rotation)
- [ ] Setup CI/CD avec git push au lieu de rsync manuel
- [ ] Compléter les credentials OAuth (Google/GitHub/Apple) et Resend dans `.env`
- [ ] Typer correctement le `collections.map((collection: ...))` pour pouvoir réactiver `typescript.ignoreBuildErrors: false`
