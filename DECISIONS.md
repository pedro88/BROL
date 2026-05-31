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

### Geocoding postal codes via Zippopotam.us, pas de cache DB (2026-05-31)

**Contexte** : la feature *community-request* matche les voisins par
rayon km. Besoin de mapper `(country, postalCode)` → `(lat, lng)`.
Initialement prévu : seeder une table `PostalCode` depuis geonames.org
(~500k rows pour BE/FR/NL/LU/DE).

**Choix** : pivot vers l'API publique **Zippopotam.us**
(`api.zippopotam.us/{country}/{postalCode}`). Pas de table de cache —
les coords sont persistées **sur `User`** au save (1 appel API par
update de localisation, jamais à la lecture). Couverture ~60 pays.

**Rationalité** : zéro maintenance des données (vs seed CSV ~80 Mo à
rafraîchir). Latence acceptable côté UX car appelé uniquement à
l'onboarding + edit settings (~1 appel/user/mois). Resend pattern
similaire pour email — éviter d'engager une dépendance DB volumineuse
pour un cold path. Risque : disponibilité Zippopotam — fallback retry
1× + 404 = null (UX bloque submit avec message).

### Handle immuable post-signup (2026-05-31)

**Contexte** : `users.updateHandle` permettait de modifier son pseudo
depuis `/settings`. Le handle apparaît dans des URLs publiques
(`/profile/[handle]`) et dans des QR codes partagés ("Scannez pour
m'ajouter").

**Choix** : verrouiller le handle après attribution au signup.
`users.updateHandle` retourne `FORBIDDEN`. Bouton "Modifier pseudo"
retiré du UI settings. Message explicatif : "Votre pseudo est
définitif — il est utilisé dans les liens partagés."

**Rationalité** : les modifications cassent les liens externes
(impossible de tracker quand). Pire : un handle libéré peut être
repris par un autre user → impersonation triviale d'une identité
connue. La rigidité est acceptable car le handle est auto-généré au
signup (`slug + 4 random digits`) — on ne demande pas au user de le
choisir manuellement. Si on rouvre plus tard, autoriser 1 changement
unique avec flag `handleChangedAt` non-null bloquant les suivants +
audit log.

### Cookie `brol_loc_complete` non-signé pour soft gate (2026-05-31)

**Contexte** : middleware Next doit savoir si l'utilisateur a complété
sa localisation pour décider de rediriger vers `/onboarding/location`.
Pas d'accès DB depuis Edge runtime.

**Choix** : cookie applicatif `brol_loc_complete=1` posé client-side
après submit du form onboarding (et au load si `users.me.postalCode`
déjà set). Purgé sur visite `/sign-in` pour gérer les sessions
multi-user dans le même browser.

**Rationalité** : c'est une **gate UX, pas une frontière de
sécurité** — bypass = juste skip onboarding une fois. Les procédures
API qui exigent `User.lat/lng` (ex: `communityRequest.create`)
appliquent leur propre validation. Cookie httpOnly inutile ici, et
poser un cookie httpOnly depuis tRPC nécessite de passer par
`responseMeta` + une couche de plomberie. ROI faible.

### Cache React Query : `removeQueries` sur token change (2026-05-31)

**Contexte** : bug constaté pendant le sprint — au logout/login
(notamment lors du test du soft gate), la page `/onboarding/location`
voyait brièvement l'ancien utilisateur (`users.me` cached) et faisait
un redirect parasite home avant l'arrivée des données fraîches.

**Choix** : `queryClient.removeQueries()` au lieu de
`queryClient.invalidateQueries()` dans `trpc-provider.tsx` quand
`sessionTokenStore` change.

**Rationalité** : `invalidate` marque stale mais sert toujours la data
cachée pendant le refetch en background. Pour un cache scopé à un user,
ce comportement est dangereux entre utilisateurs : on doit ne **rien**
afficher avant la nouvelle data. `removeQueries` purge la cache → les
queries subscribed repassent en `isLoading`.

### Privacy granulaire sur profil (toggles publicXxx) (2026-05-31)

**Contexte** : extension Profile avec birthYear/gender/phone. Question :
exposer ces champs par défaut sur le profil public ?

**Choix** : tout est **privé par défaut** sauf `publicCity` (true) —
la ville est déjà utilisée pour le matching de demandes. Toggles
par champ (`publicEmail`, `publicPhone`, `publicBirthYear`,
`publicGender`, `publicCity`) gérés dans settings.

**Rationalité** : RGPD + cohérence avec l'éthique de l'app
(emprunt local entre voisins, pas réseau social). Le serveur masque
les champs à null dans `profile.get` pour les viewers anonymes —
impossible de fuiter en oubliant un `if (visibility.foo)` côté
frontend.
