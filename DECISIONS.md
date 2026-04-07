# DECISIONS.md — Brol

> Registre des choix techniques et anti-patterns du projet Brol.

---

## Anti-patterns Évitée

### 1. Pas de QR code dans la DB (2026-04-07)
**Anti-pattern évité** : Stocker les QR codes en base64 ou en blob.

**Problème** : Les QR codes sont des images déterministes calculées à partir d'un ID unique. Les stocker en base polluerait la DB pour rien.

**Solution** : On génère les QR codes côté client à partir d'une URL canonique `https://brol.app/object/{objectId}`. Le QR code est un simple alias vers cette URL. Aucune donnée QR en DB.

---

## Choix Architecturaux

### 1. Monorepo avec Turborepo (2026-04-07)
**Choix** : Turborepo plutôt que Nx.

**Rationalité** :
- Configuration plus simple pour un projet de cette taille
- Cache de build natif performant
- Écosystème Vercel bien intégré pour le déploiement
- Moins de verbosité que Nx

**Inconvénients potentiels** : Moins de plugins officiels que Nx, mais les plugins essentiels (Next.js, TypeScript, ESLint) sont disponibles.

---

### 2. Structure de Packages (2026-04-07)
```
apps/
  web/          # Next.js (SSR, SEO, dashboard complet)
  mobile/       # Expo (RN, partage maximum de code)
packages/
  db/           # Prisma schema + client
  shared/       # Zod schemas, types TS, utils i18n, composants cross-platform
  api/          # tRPC routes, auth, business logic
```

**Rationalité** : Séparation claire entre apps (exposition) et packages (logique partagée). Le package `shared` est consommable par le web ET le mobile.

---

### 3. Auth avec BetterAuth (2026-04-07)
**Choix** : BetterAuth (maintenu par remix-auth).

**Rationalité** :
- Framework-agnostic (fonctionne avec Next.js et Expo)
- Support OAuth natif (Google, GitHub, etc.)
- Session management robuste
- Écosystème belge : compatible avec Belgian eID ? Non, on commence par email + OAuth. eID potentiellement en v2.

**À documenter si modifié** : Single sign-on avec account linking.

---

### 4. Base de données PostgreSQL (2026-04-07)
**Choix** : PostgreSQL via Supabase ou Hetzner Cloud.

**Schéma initial** :
- `users` — profil, préférences i18n
- `collections` — appartient à user
- `objects` — appartient à collection
- `contacts` — graphe social limité
- `loans` — prêt avec dates, statuts
- `qr_stocks` — pool de QR codes vierges

**Index recommandés** :
- `objects.collection_id`
- `loans.borrower_id`
- `loans.status`
- `loans.return_due_date`

---

### 5. Stockage S3 (2026-04-07)
**Choix** : Hetzner Object Storage (compatible S3, européen).

**Usage** : Avatars, images d'objets, PDF de QR codes générés.

**Stratégie** : URL signée pour les uploads. Pas de bucket public.

---

### 6. i18n (2026-04-07)
**Choix** : next-intl pour le web, react-i18next pour le mobile.

**Langues initiales** : FR (default), NL, EN.

**Structure** :
```
locales/
  fr.json
  nl.json
  en.json
```

---

### 7. Thème Retro VHS 80s (2026-04-07)
**Choix** : shadcn/ui + Tailwind + custom theme.

**Palette** :
- Background : noir profond (#0a0a0a)
- Primary : magenta vif (#ff00ff)
- Secondary : cyan (#00ffff)
- Accent : jaune VHS (#ffff00)
- Text : blanc cassé (#f0f0f0)

**Fonts** : Monospace typewriting (VT323 ou Press Start 2P pour les headers)

**Effets** :
- Scanlines CSS (pseudo-éléments)
- Glow effects sur les boutons
- Bordures pixelisées
- CRT curvature (subtle)

---

### 8. Validation Zod (2026-04-07)
**Choix** : Zod everywhere, systematisch.

**Pattern** :
1. Schéma Zod dans `packages/shared/src/schemas/`
2. Validation côté client (forms)
3. Validation côté API (tRPC middleware)
4. Types TypeScript inférés des schémas

**Anti-pattern évité** : Valider côté client SEUL. Toujours server-side aussi.

---

### 9. QR Codes (2026-04-07)
**Génération** : `qrcode` package côté client.

**URL canonique** : `https://brol.app/s/{objectId}` (s = scan public)

**QR de profil** : `https://brol.app/p/{userId}`

**QR de stock** : Identiques aux QR d'objets, la différence est dans le scan contextuel.

**PDF generation** : `react-pdf` ou `jspdf` pour générer un PDF des QR codes à imprimer.

---

### 10. Tests (2026-04-07)
**Choix** :
- E2E : Playwright (meilleur support TypeScript que Cypress)
- Unitaires : Vitest (plus rapide que Jest, compatible Vite)

**Coverage minimale** :
- Toutes les mutations DB via tRPC
- Tous les schémas Zod
- Flux critiques : prêt, retour, scan

**Configuration** :
- Playwright avec Chromium (desktop-first)
- Base URL configurée via `PLAYWRIGHT_BASE_URL`
- WebServer intégré pour la CI
- Tests responsives (375px mobile)

---

### 11. Expo Router pour Mobile (2026-04-07)
**Choix** : Expo Router v4 (file-based routing).

**Rationalité** :
- Navigation native avec liens
- Routes typesées (`/app/collections.tsx` → route `/collections`)
- Deep linking natif pour les QR codes (`brol://`)
- Shared code avec le package `@brol/shared`

**URL scheme** : `brol://` pour deep linking mobile.

**Routes initiales** :
- `app/index.tsx` — Home
- `app/collections.tsx` — Liste des collections
- `app/loans.tsx` — Liste des prêts
- `app/scan.tsx` — Scanner QR code

---

### 12. API Server vs Serverless (2026-04-07)
**Choix** : Développement en serveur standalone (Node.js), production en serverless (Vercel).

**Rationalité** :
- En dev : serveur HTTP simple avec `tsx watch`
- En prod : pas de serveur à maintenir, scaling automatique
- tRPC fonctionne avec les deux sans changement de code

**Décision à réévaluer** : Si les coûts serverless sont trop élevés, migrer vers un VPS avec Docker.

---

## Anti-patterns Potentiels à Surveiller

### N+1 Queries
**Risque** : Accès aux objets d'un prêt → collection → owner.

**Mitigation** : Prisma `include` avec nested selects, ou Dataloader pattern si nécessaire.

### Session Tokens dans le Frontend
**Risque** : XSS extrayant les tokens.

**Mitigation** : HttpOnly cookies uniquement pour les sessions. SameSite=Strict.

### QR Code Collision
**Risque** : Deux objets avec le même objectId.

**Mitigation** : UUIDs v7 (timestamp-ordered) pour les IDs. Pas de collision possible.

---

## Logs de Décisions Futures

<!-- Ajouter ici les décisions futures avec le format :
### X. Titre (YYYY-MM-DD)
**Contexte** :
**Choix** :
**Rationalité** :
-->
