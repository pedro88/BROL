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
- Credentials : dans `/opt/brol/.env` (`S3_ACCESS_KEY`, `S3_SECRET_KEY`)
- CLI sur le VPS : `s3cmd ls` (config dans `~/.s3cfg`)

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
cd apps/web && pnpm run build && cd ../..

# 2. Sync code + artefact prebuilt vers le VPS
rsync -az --delete \
  --exclude=node_modules --exclude='.next/cache' \
  --exclude='.next/types' --exclude='.next/server' \
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

### Backup Postgres (manuel)

```bash
ssh piet@91.98.87.65 'sudo -u postgres pg_dump brol | gzip > /opt/brol/backups/brol-$(date +%Y%m%d-%H%M).sql.gz'
```

### Restore

```bash
ssh piet@91.98.87.65 'gunzip -c /opt/brol/backups/brol-YYYYMMDD-HHMM.sql.gz | sudo -u postgres psql brol'
```

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

### `Cannot find Prisma Query Engine for runtime`

→ Le standalone Next n'a pas tracé les `.node` binaries Prisma. Vérifier que `next.config.js` contient :
```js
serverExternalPackages: ["@prisma/client", "@prisma/engines", "prisma"],
outputFileTracingIncludes: { "/**/*": ["../../node_modules/.pnpm/@prisma+client*/**", ...] },
```

### `useContext null` au build Next dans Docker

Bug Next 15 + Docker spécifique au prerender. Solution actuelle : on build localement et on COPY l'artefact `.next/standalone` dans une image Docker minimale (cf. `apps/web/Dockerfile`).

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

---

## 9. À faire (dette technique)

- [ ] L'API tRPC redirige vers `https://localhost:3000` au lieu de `https://app.brol.dev` (BETTER_AUTH_URL ? middleware ?)
- [ ] Ajouter un endpoint `/health` sur l'API pour réactiver le healthcheck Docker
- [ ] Ajouter `openssl` au Dockerfile API (warnings Prisma libssl)
- [ ] Cron de backup Postgres automatique
- [ ] Logs persistants (actuellement perdus quand on recycle les containers — ajouter `logging:` driver json-file avec rotation)
- [ ] Setup CI/CD avec git push au lieu de rsync manuel
- [ ] Compléter les credentials OAuth (Google/GitHub/Apple) et Resend dans `.env`
- [ ] Typer correctement le `collections.map((collection: ...))` pour pouvoir réactiver `typescript.ignoreBuildErrors: false`
