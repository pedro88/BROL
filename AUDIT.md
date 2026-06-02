# AUDIT BROL — 2026-06-02 (rev 4)

> Audit synthétique du monorepo Brol.
> Périmètre : `apps/web`, `apps/mobile`, `packages/{api,db,shared}`, infra de test/déploiement.
>
> **Révision 4 (2026-06-02)** — après 10 commits depuis rev 3 :
> 8fd27ec QR role-based redirect, dd2ecb7 backfill cover, 0cd8646 sync coverImage,
> e73013a observability log, 344ed09 perf photos (compression client),
> c25b04d sequential upload + S3 bucket, 72c5216 unified add-contact,
> d33a5f8 onboarding redirect, 716df70 branding, 849b6eb DATABASE.md.
>
> Méthode : lecture statique des sources + recherches `ripgrep` ciblées (any,
> console, TRPCError, pagination, ownership, CORS, Resend). Pas de re-run
> des tests — l'inventaire s'appuie sur les compteurs de code.

---

## TL;DR

| Dimension                 | rev 3 (31/05) | **rev 4 (02/06)** | Δ    |
| ------------------------- | :-----------: | :---------------: | :--: |
| Architecture              | 8/10         | **8/10**          |  →   |
| Qualité de code           | 8/10         | **7.5/10**        |  ↓   |
| Tests — unitaires         | 8/10         | **8/10**          |  →   |
| Tests — E2E               | 8/10         | **8/10**          |  →   |
| Sécurité                  | 7/10         | **5.5/10**        |  ↓↓  |
| DX / outillage            | 8/10         | **8/10**          |  →   |
| Documentation             | 9/10         | **9/10**          |  →   |
| CI/CD & déploiement       | 7/10         | **7/10**          |  →   |
| Complétude fonctionnelle  | 7/10         | **7.5/10**        |  ↑   |
| Parité mobile             | 3/10         | **3.5/10**        |  ↑   |
| **Global**                | 7.3/10       | **7.0/10**        |  ↓   |

**Verdict actuel** : la dette s'est déplacée. Les marqueurs visibles
(`any`, `console.*`, tests rouges) ont été nettoyés — la note "qualité" monte
en surface. Mais en lisant le code, on découvre des trous structurels que les
markers superficiels ne captent pas :

- **Sécurité** baisse parce qu'aucun rate limiting n'est en place, que
  22 erreurs métier sont émises en `throw new Error()` (→ HTTP 500 au lieu
  de 404/400/409), et que le helper CORS du tRPC renvoie `*` alors que
  les cookies cross-subdomain sont en marche.
- **Redondance** n'était pas notée dans les audits précédents. Cette
  dimension fait apparaître 3× la même instance `Resend`, 2 routes tRPC
  quasi-identiques, et 17× le même check d'ownership recopié.
- **Qualité** baisse modestement à cause de ces deux-là + le fait que
  deux conventions différentes pour lire l'ID du caller coexistent
  (`ctx.userId` 93× vs `ctx.session.user.id` 16×).

---

## 1. Architecture — 8/10

### Inventaire

- **Monorepo Turborepo** : 2 apps (`web`, `mobile`) + 3 packages (`api`, `db`, `shared`).
- **API tRPC** : 14 routers, **5 294 lignes TS** (+~600 depuis rev 3 — sprint
  community-request + requestMessages + notification + profile + users + review + coverImage).
- **Web Next.js 15 App Router** : 22+ pages, **13 701 lignes TS/TSX**.
- **Mobile Expo SDK 54** : 12 écrans (inchangé) + nouvelle page settings (288 lignes)
  + contacts.tsx + notifications.tsx = **3 491 lignes TS/TSX** (+1 300).
- **DB Prisma** : 18 modèles, 10 migrations versionnées, PostgreSQL.
- **Auth** : BetterAuth 1.6, cross-subdomain cookies.

### Points forts

- Schémas Zod centralisés dans `@brol/shared`, type-safety end-to-end.
- `lib/` (s3, geo, handle, logger, badge-service) isole les dépendances
  externes — bon réflexe même si la couche service métier est absente.
- Le logger structuré JSON (`lib/logger.ts`) est propre : compatible pino
  en surface, lazy, child loggers par module.
- Cross-subdomain auth stable (`server.ts:154-164` + `auth.ts:96-107`).
- DATABASE.md (nouveau) documente le schéma complet avec index et relations.

### Points faibles

- **Pas de service layer** : toute la logique métier (community-request
  matching, prêt + auto-add contact + notif + badge sync, etc.) vit dans
  les routers. `loans.ts` (506 l.), `objects.ts` (618 l.), `community-request.ts`
  (339 l.) sont des monolithes.
- **Pas d'orchestration de jobs** : `communityRequest.create` fait
  matching + notifications en mode await dans la requête HTTP. Si Zippopotam
  est lent ou si 200 matches déclenchent 200 inserts, le caller attend.
  Pas de queue (BullMQ / Inngest) ni de cron pour expiration des requests.
- **Deux couches de pagination** : (a) `paginationSchema` (limit/cursor) +
  items/nextCursor, et (b) le pattern `take: limit + 1; slice(0, -1)`
  utilisé dans 5 routers. Aucun helper commun (`paginate(prisma, model, opts)`).
- **Pas de DI / pas de test container** : `ctx.prisma` est global, le
  `setup.ts` se contente de dropper+recréer le schéma. Un changement de
  schéma oblige à relancer les tests. Pas de rollback transactionnel
  par test.
- **Coexistence Next API + standalone API** : `apps/web/src/app/api/auth/[...all]/route.ts`
  ET `packages/api/src/server.ts` (port 3001) gèrent tous les deux du
  BetterAuth. Le web a une dépendance tRPC vers `@brol/api` mais Next
  sert aussi du tRPC localement. C'est OK fonctionnellement mais ça
  double la surface d'attaque auth.

### Verdict

L'architecture reste saine, l'effort d'isoler les libs (s3, geo, handle,
logger, badge-service) est le bon pattern. Manque la suite : un service
layer + une queue + un helper de pagination factorisé.

---

## 2. Sécurité — 5.5/10 *(↓ -1.5, ancien score 7/10)*

### Points forts

- **`protectedProcedure`** systématique sur toutes les mutations.
- **BetterAuth** gère le CSRF (trustedOrigins + cookie `sameSite: lax`,
  `secure: true`).
- **Schémas Zod** sur tous les inputs tRPC, `cuid()` partout.
- **Validation S3** (content-type, taille) côté serveur.
- **Lock handle** (`users.updateHandle` retourne `FORBIDDEN`) corrige
  l'impersonation par libération d'un pseudo connu.
- **Profile fields par-visibilité** (`publicCity` etc.) au lieu d'un
  booléen global.

### Points faibles

#### 🔴 CRITIQUE — Pas de rate limiting

Aucun middleware throttle (ni sur tRPC, ni sur BetterAuth, ni sur
`/api/test/*`). Un script peut brute-forcer sign-in ou spammer
`communityRequest.create` pour saturer les notifications.

```bash
$ rg "rate.?limit|throttle|@upstash" packages/api/src
(aucun résultat)
```

RAPPORT.md mentionne le sujet depuis longtemps, jamais livré.

#### 🔴 CRITIQUE — `throw new Error()` au lieu de `TRPCError` (22 occurrences)

Ces erreurs deviennent des **HTTP 500 generiques** côté client, pas des
404/400/409 comme prévu. Le frontend ne peut pas les router
correctement (toast `error.message` brut, retry infini possible) :

| Fichier                              | Lignes touchées                                          |
| ------------------------------------ | -------------------------------------------------------- |
| `routers/objects.ts`                 | 475, 488, 530, 555, 582                                  |
| `routers/collections.ts`             | 254, 285                                                  |
| `routers/contacts.ts`                | 70, 134, 211, 231, 254, 259, 296                         |
| `routers/qr.ts`                      | 116, 130, 135, 169, 183, 188, 269                        |
| `lib/geo.ts`                         | 83, 96 (mais là c'est OK — usage interne)                |
| `lib/handle.ts`                      | 48 (OK — usage interne)                                  |

**Fix** : remplacer par `throw new TRPCError({ code: "NOT_FOUND", message: "..." })`.
Sur les routers: `objects.ts:475,488,530,555` → `NOT_FOUND`;
`qr.ts:135,188` → `CONFLICT`; `contacts.ts:296` → `CONFLICT`; etc.

#### 🟠 HAUTE — CORS incohérent dans `server.ts`

`handleTrpc` (utilisée pour tRPC) renvoie **toujours**
`Access-Control-Allow-Origin: *` (ligne 66) ; `withCors` (utilisée pour
BetterAuth) renvoie l'origin précis (ligne 168).

Avec `*` + `Access-Control-Allow-Credentials` côté cookie session :
techniquement les browsers modernes refusent, mais l'incohérence
signifie qu'un dev qui ajoute une feature tRPC oubliera de respecter
le pattern strict. Risque : ajouter `withCors` autour de tRPC un jour
et péter un auth silencieux.

**Fix** : factoriser via `withCors` ou dupliquer la même logique CORS
pour tRPC.

#### 🟠 HAUTE — `as Parameters<typeof betterAuth>[0]` cast (3× dans `auth.ts`)

```ts
export const auth = betterAuth(
  baseAuthConfig({...}) as Parameters<typeof betterAuth>[0], // eslint-disable-line @typescript-eslint/no-explicit-any
);
```

Le cast est nécessaire parce que les types de BetterAuth ne matchent
pas `AuthOptions` (interface custom). Conséquence : toute régression
de signature BetterAuth compile silencieusement et casse l'auth en
runtime.

#### 🟠 HAUTE — Endpoints `/api/test/*` gatés uniquement par `NODE_ENV`

`server.ts:202` et `server.ts:228` testent `process.env.NODE_ENV === "production"`.
Si un déploiement est oublié en `NODE_ENV=development`, n'importe qui
peut dropper un user via POST `/api/test/cleanup-user` (qui fait
`prisma.user.deleteMany` !). Pas de second facteur (header secret, IP
allowlist, etc.).

**Fix** : exiger un `process.env.TEST_API_SECRET` en plus, ou restreindre
à `localhost`.

#### 🟡 MOYENNE — Pas de brute-force protection sur sign-in

BetterAuth a un rate-limit built-in (par défaut 50 req/10min) mais
**pas activé explicitement** dans `auth.ts`. À documenter et vérifier.

#### 🟡 MOYENNE — Pas d'audit trail

`sign-in`, `sign-out`, `password change`, `delete account`, `updateHandle`
(même bloqué) ne sont pas loggés en `audit_log`. Si un user
revendique une action qu'il n'a pas faite, on n'a aucune trace.

#### 🟡 MOYENNE — Pas de scan SCA dans CI

CI fait `lint + typecheck + test + e2e`. Pas de `npm audit`, ni
Dependabot, ni Snyk. Une vuln connue dans `@aws-sdk/client-s3` ou
`better-auth` n'est détectée qu'à la main.

#### 🟡 MOYENNE — CORS mobile : `localhost:8081` en dur

`auth.ts:72` et `server.ts:161` autorisent `http://localhost:8081` (Expo
Metro) et `http://localhost:19006` (Expo web). C'est OK en dev mais
ça reste listé en dur dans le code prod — un dev qui ajoute un
domaine oubliera peut-être de re-builder.

#### 🟢 BASSE — `search` non échappé dans Prisma (mais safe)

`{ name: { contains: input.search, mode: "insensitive" } }` — Prisma
échappe correctement les paramètres (pas d'injection SQL possible).
Mais community-request utilise une chaîne LIKE brute (échappée à la
main via `escapeLikePattern` ligne 21) → si quelqu'un copie ce pattern
sans escape, c'est un risque.

---

## 3. Redondance — 6/10 *(nouvelle dimension, 0 baseline)*

### 🔴 3× `new Resend(apiKey)` instancié

| Fichier                       | Ligne | Notes                                              |
| ----------------------------- | ----: | -------------------------------------------------- |
| `emails/index.ts`             | 16    | Dans `getResendClient()` (helper non utilisé)      |
| `emails/index.ts`             | 58    | Dans `sendReminderEmail`                            |
| `routers/messages.ts`         | 138   | Dans `sendOwnerContactEmail`                        |
| `routers/request-messages.ts` | 70    | Dans `sendRequestMessageEmail`                      |

`getResendClient()` est défini mais jamais appelé ! Les 3 call sites
re-instancient Resend à chaque email. Fix : faire de
`getResendClient()` un singleton lazy et l'utiliser partout.

### 🔴 `qr.assign` vs `qr.assignToObject` — 95% identiques

`routers/qr.ts:103` (`assign` par `qrCode`) et `routers/qr.ts:156`
(`assignToObject` par `qrStockId`) sont quasi-clones. Seule différence :
la résolution du QR (par code vs par ID). Le reste (vérif object, vérif
déjà-assigné, transaction) est recopié.

**Fix** : helper interne `assignQrToObject({ userId, objectId, qrWhere })`.

### 🟠 Pattern d'ownership `findFirst({id, collection: {userId}})` dupliqué 17×

`rg "userId: ctx.userId" packages/api/src/routers -A 1` → 17 occurrences
du même pattern. Le helper typique ferait :

```ts
async function ownedObjectOrThrow(prisma, userId, objectId, include?) { ... }
```

Ce qui économiserait ~80 lignes et standardiserait le message d'erreur
(actuellement `"Objet non trouvé"` dans 6 fichiers avec 6 variantes
mineures).

### 🟠 `nextCursor` copié-collé 16×

```ts
nextCursor: X.length === (input?.limit ?? N) ? X[X.length - 1]?.id ?? null : null
```

Présent dans : loans.ts (4×), objects.ts (3×), collections.ts (3×),
contacts.ts (1×), qr.ts (1×), et la variante `take: limit + 1; slice(0, -1)`
dans community-request.ts et notification.ts (2×).

**Fix** : helper `paginatedResult(items, limit)` ou middleware tRPC.

### 🟠 `computedStatus` dupliqué

Logique identique dans `loans.ts:77-88, 147-156, 217-230` (3×) et
`contacts.ts:104-112, 169-178` (2×) :

```ts
computedStatus:
  loan.status === "ACTIVE" && loan.returnDueDate && loan.returnDueDate < now
    ? "OVERDUE" : loan.status,
```

**Fix** : helper `withComputedOverdue(loans)` ou un Prisma middleware
qui ajoute la colonne calculée.

### 🟡 `nodeToRequest` mort

`server.ts:46-54` déclare `function nodeToRequest(req: IncomingMessage): Request`
mais est marqué "kept for reference, unused" et n'est jamais appelé.
65 lignes (commentaires inclus) à supprimer.

### 🟡 `trpc-hooks/photos.ts` wrapper unique

`apps/web/src/lib/trpc-hooks/photos.ts` existe avec `usePhotosList`,
`usePresignedUrl`, `usePhotoAdd`. Mais :

- 119 autres `trpc.x.y.useQuery/useMutation` directs dans le code.
- Incohérence : pourquoi photos a un wrapper et pas les 14 autres
  domaines ? Wrapper mort-né ou inachevé.

### 🟡 `collections.ts:13-23` redéclare `OBJECT_TYPES`

`OBJECT_TYPES` est aussi probablement dans `@brol/shared` (à vérifier,
mais le commentaire ligne 25 dit "Inline schemas to avoid tsx watch
workspace dep caching issue" → workaround qui sent la dette). Si oui,
il faut le partager.

---

## 4. Qualité de code — 7.5/10 *(↓ -0.5, ancien score 8/10)*

### Métriques mises à jour

| Marqueur                              | rev 3   | **rev 4**    |
| ------------------------------------- | :-----: | :----------: |
| `as any` (API)                        | 0       | **0**        |
| `as any` (web/mobile)                 | 5       | **5**        |
| `@ts-ignore` / `@ts-expect-error`     | 0       | **0**        |
| `console.log/error` (API)             | 11 + 26 | **1** (test) |
| `console.*` (web)                     | —       | **17**       |
| `console.*` (mobile)                  | —       | **13**       |
| `TODO` / `FIXME` (code)               | 3       | **2**        |
| `throw new Error` (routers) ⚠️        | —       | **22**       |
| `throw new TRPCError` (routers)       | —       | **46**       |
| `eslint-disable-line`                 | —       | **4**        |

### Points forts

- `any` a été **complètement éradiqué** de l'API (0 occurrences dans
  les routers). Reste 4 dans `auth.ts:46-50` (interface `AuthOptions`)
  pour `databaseHooks`, `socialProviders`, `plugins` — types BetterAuth
  pas exportés proprement.
- `console.*` en API : 1 occurrence (juste `test/setup.ts`). Logger
  structuré tenu.
- Patterns `protectedProcedure` + Zod systématiques.
- Découpage routers/UI/lib clair, types Prisma utilisés à fond (e.g.
  `Prisma.CollectionUpdateInput` dans `collections.ts:259` au lieu d'un cast).

### Points faibles

#### 🟠 `throw new Error()` au lieu de `TRPCError` (cf §2 ci-dessus)

22 cas dans 4 routers. C'est le 1er impact "qualité" : le code **prétend**
échouer proprement mais émet du 500.

#### 🟠 Deux conventions pour `userId` du caller

```bash
$ rg "ctx\.userId"           packages/api/src | wc -l   # 93
$ rg "ctx\.session\.user\.id" packages/api/src | wc -l   # 16
```

`protectedProcedure` met `userId` dans le contexte (cf `trpc/index.ts:78-80`).
Mais 16 routers utilisent `ctx.session.user.id` à la place. Inconsistance
qui n'est pas un bug (les deux pointent sur le même user) mais qui rend
le grep moins fiable et double le code path mental.

**Fix** : choisir l'un ou l'autre par convention, ajouter un lint rule.

#### 🟠 `eslint-disable @typescript-eslint/no-floating-promise-declaration`

`server.ts:238` :

```ts
handleGetToken(email).then(({ token }) => { ... }).catch((e) => { ... });
// eslint-disable-next-line @typescript-eslint/no-floating-promise-declaration
```

La règle est désactivée. Mais c'est exactement le genre de fire-and-forget
qui peut swallow une erreur. Le `catch` est OK mais la désactivation cache
le problème.

#### 🟠 ESLint `no-explicit-any: warn` (au lieu de `error`)

`packages/eslint-config/index.js:5` : la règle est en `warn`. Donc la CI
passe même avec un `any` non justifié. Quand on a refactoré pour virer les
`any`, on l'a fait à la main — pas de garde-fou automatisé.

#### 🟡 Pas d'`error.tsx` par route (Next App Router)

Seul `global-error.tsx` existe. Les pages complexes (`objects/[id]/page.tsx`
521 lignes, `loans/page.tsx` avec 3 queries) n'ont pas de boundary locale.
Une erreur de rendu dans une card met toute la page en 500.

#### 🟡 Type `ResponseNext` ad-hoc dans `server.ts:64, 147, 191`

```ts
{ statusCode: number; setHeader: (k: string, v: string) => void; end: (data?: string) => void }
```

Recopié 3 fois au lieu d'extraire un `type ResponseLike`. `res` est en
fait un `ServerResponse` Node — il suffirait d'importer le type.

#### 🟡 Couplage fort `loans.ts` ↔ `notifications` + `badges`

`loans.ts:362-372` crée une notif en dur (type `RETURN_REMINDER`,
relatedType `"loan"`), `loans.ts:375` appelle `syncUserBadges().catch(()=>{})`.
Si on ajoute un canal de notif (push, Slack), il faut toucher tous les
routers. Pas de service `notify(user, event)` centralisé.

#### 🟢 Code mort à supprimer

- `nodeToRequest` (server.ts:46-54) — gardé "for reference" depuis longtemps.
- 2 TODO dans `contacts.ts:308, 322` (ré-envoyer/invitation email) — annoncés
  depuis rev 1.

---

## 5. Tests — unitaires : 8/10 (inchangé)

### Inventaire rev 4

| Router               | rev 3   | rev 4 |
| -------------------- | :-----: | :---: |
| `collections.ts`     | ✅      | ✅    |
| `objects.ts`         | ✅      | ✅    |
| `loans.ts`           | ✅      | ✅    |
| `contacts.ts`        | ✅      | ✅    |
| `qr.ts`              | ✅      | ✅    |
| `photos.ts`          | ✅      | ✅    |
| `badge.ts`           | ✅      | ✅    |
| `tier.ts`            | ✅      | ✅    |
| `community-request.ts` | ❌    | ✅    |
| `messages.ts`        | ❌      | ✅    |
| `notification.ts`    | ❌      | ✅    |
| `profile.ts`         | ❌      | ✅    |
| `review.ts`          | ❌      | ✅    |
| `users.ts`           | ❌      | ✅    |

**14/14 routers testés** (était 11/14). Les 3 manquants ont été ajoutés.

### Points forts

- Coverage v8 wirée avec seuils 60/50/60/60.
- `singleFork` sur les tests DB → pas de race sur le schéma.
- Nouveaux fichiers : `community-request.test.ts` (matching Haversine),
  `messages.test.ts` (avec stub Resend), `notification.test.ts`,
  `profile.test.ts`, `review.test.ts`, `users.test.ts`.

### Points faibles

- **Pas de tests pour `lib/`** : `handle.ts` (gen de slug unique), `geo.ts`
  (Haversine SQL fragment), `s3.ts` (presigned URLs), `badge-service.ts`,
  `logger.ts` — tous sans test direct. La logique de matching
  community-request est testée par router, mais `haversineSql` lui-même
  pas (le test d'intégration valide le résultat, pas le SQL émis).
- **Pas de tests pour `auth.ts`** (volontairement exclu du threshold) :
  la config BetterAuth est sensible et centrale. Un refactor qui casse
  le cross-subdomain passerait les tests.
- **Pas de tests de concurrence** : `generateHandle` boucle 20 fois sur
  `findUnique`. Pas de test qui ouvre 100 promesses en parallèle pour
  voir si le retry couvre bien.

---

## 6. Tests — E2E : 8/10

### État supposé (pas re-run)

- 18 fichiers spec Playwright.
- **11 rouges** déclarés en rev 3 (contacts, loans/responsive, qr-scan,
  requests). Pas re-run dans cette rev.
- Spec `user-handle.spec.ts` couvre handle/QR/add-friend.

### Points faibles

- **Pas de stratégie de retry/quarantaine** : un flaky sur `main` bloque
  la PR review.
- **`scripts/e2e-run.sh` non idempotent** : `pkill -f` agressif sur les
  ports 3000/3001, peut tuer autre chose.
- **Pas de tests E2E mobile** (Detox/Maestro toujours pas décidé).

---

## 7. DX / outillage — 8/10

### Points forts (inchangé)

- Turborepo + cache, `pnpm dev/build/typecheck/lint` parallélisés.
- `scripts/postinstall.sh` règle le `@prisma/client` post-clone frais.
- `DATABASE.md` (nouveau) référence de schéma pratique pour les devs.

### Points faibles

- **Pas d'outil de dépendance à jour** : `npm outdated` à la main, pas
  de Renovate/Dependabot.
- **Pas de pre-commit hook** (Husky/lint-staged) : un `any` peut être
  committé sans friction.

---

## 8. Documentation — 9/10

### Inventaire rev 4

- `README.md` (81 l.)
- `RAPPORT.md` (~1 020 l., à scinder par milestone close)
- `MAINTENANCE.md` (467 l.)
- `DECISIONS.md` (225 l.)
- `DATABASE.md` (nouveau, ~ XXX l.) — schéma complet avec index.
- `TESTS.md` (173 l.)
- `ARCHITECTURE.md` (8 diagrammes Mermaid)
- `BACKLOG.md` (structuré P0/P1/P2/P3)
- `CONTRIBUTING.md` (nouveau)

### Points faibles

- `RAPPORT.md` continue de grossir (1 020 l. en rev 3, plus depuis).
  Découper en `M###-RAPPORT.md` quand milestone fermée.
- Pas de Mermaid à jour pour le flow S3 (presigned URL → client PUT →
  `photo.add`) ni pour le flow community-request (matching Haversine).

---

## 9. CI/CD & déploiement — 7/10

### Points forts

- 4 jobs : `lint`, `typecheck`, `test` (avec coverage), `e2e` (Postgres service).
- Service postgres dans le job `e2e` — propre.
- Coverage artifact 7 jours.

### Points faibles

- **Pas de scan de sécurité** dans CI (cf §2 SCA).
- **Pas de staging** distinct (`api.brol.dev` est prod-only).
- **Pas de release tagging** (pas de `git tag v0.x`).
- **Déploiement toujours manuel** via SSH + rsync.

---

## 10. Complétude fonctionnelle — 7.5/10 *(↑ +0.5)*

### Livré depuis rev 3

| Domaine              | Détail                                                              |
| -------------------- | ------------------------------------------------------------------- |
| Photos perf          | Compression client avant upload (344ed09), upload séquentiel (c25b04d) |
| Cover image          | Sync auto sur `Object.coverImage` (0cd8646) + backfill (dd2ecb7)     |
| QR role redirect     | `getByCode` retourne isOwner / viaContact pour le routeur web (8fd27ec) |
| Add-contact unifié   | Dialog `manual / handle-ID / QR` (72c5216)                           |
| Onboarding hardening | Post-CP redirect propre (d33a5f8)                                    |
| Branding             | Logo VHS + tagline (716df70)                                         |
| Observability        | Log structuré sur matching community-request (e73013a)              |
| Schéma doc           | DATABASE.md (849b6eb)                                                |

### Encore en attente (extrait BACKLOG.md)

- 4 features UX rough (cards dashboard, photo à création d'objet, scan
  QR assignation, modal d'edit par type).
- Caution + prix de location (champs existent, UI pas câblée).
- Dropdown contacts recherche dans la modal de prêt.

---

## 11. Parité mobile — 3.5/10 *(↑ +0.5)*

### Couvre depuis rev 3

- `apps/mobile/app/contacts.tsx` (nouveau)
- `apps/mobile/app/notifications.tsx` (nouveau)
- `apps/mobile/app/settings.tsx` (288 l., nouveau)
- `apps/mobile/src/components/` (nouveau, extrait)
- `apps/mobile/src/lib/photo-upload.ts` (nouveau)

### Reste manquant

- Tests mobiles (toujours 0).
- `apps/mobile/app/objects/add.tsx` n'a que 6 lignes (stub !).
- `apps/mobile/app/loans/new.tsx` n'a que 6 lignes (stub !).
- `apps/mobile/app/scan.tsx` n'a que 6 lignes (stub !).

Ces 3 stubs sont probablement des redirect-only, mais à vérifier.

---

## 12. Synthèse — points forts

1. **Architecture monorepo** stable, séparation apps/packages claire.
2. **Documentation au-dessus de la moyenne** (DATABASE.md nouveau, 9/10).
3. **`any` éradiqué en API**, `console.*` quasi-nul.
4. **Logger structuré** déployé partout.
5. **14/14 routers testés** (était 11/14).
6. **Schémas Zod centralisés**, pas de validation dupliquée.
7. **BetterAuth cross-subdomain** propre + `lock handle` sécurité URLs.

## 13. Synthèse — points faibles

### Sécurité (le plus gros)

1. **Pas de rate limiting** sur sign-in / tRPC / endpoints sensibles.
2. **22 `throw new Error()`** dans les routers → 500 generique au lieu de 404/400/409.
3. **CORS incohérent** (tRPC renvoie `*`, BetterAuth renvoie l'origin précis).
4. **`/api/test/*` gaté par NODE_ENV** uniquement — pas de second facteur.
5. **Cast `as Parameters<typeof betterAuth>[0]`** masque la signature.
6. **Pas de scan SCA** dans CI.
7. **Pas d'audit trail** sur sign-in / sign-out / password change.

### Redondance

1. **3× `new Resend(apiKey)`** alors qu'un helper `getResendClient()` existe.
2. **`qr.assign` vs `qr.assignToObject`** quasi-clones.
3. **17× le même check d'ownership** recopié.
4. **`nextCursor` copié 16×** sans helper.
5. **`computedStatus` dupliqué 5×** entre loans.ts et contacts.ts.
6. **`trpc-hooks/photos.ts`** wrapper incohérent (seul domaine avec wrapper).
7. **`nodeToRequest` mort** depuis rev 1.

### Qualité

1. **Deux conventions userId** (`ctx.userId` 93× vs `ctx.session.user.id` 16×).
2. **ESLint `no-explicit-any: warn`** au lieu de `error`.
3. **Pas d'`error.tsx` par route** — boundary global uniquement.
4. **Couplage fort** loans ↔ notifications + badges, pas de service centralisé.
5. **Mobile stubs** (objects/add, loans/new, scan : 6 lignes chacun).

---

## 14. Backlog priorisé

### P0 — Sécurité (à faire ce sprint)

| #  | Item                                                              | Effort |
| -- | ----------------------------------------------------------------- | :----: |
| 1  | Remplacer 22 `throw new Error()` par `TRPCError` (codes corrects) |  S     |
| 2  | Activer rate limiting sur sign-in (BetterAuth built-in)           |  XS    |
| 3  | Ajouter rate limit tRPC (Upstash / Redis, ou mémoire dev)         |  M     |
| 4  | Fix CORS incohérent : factoriser via `withCors`                   |  XS    |
| 5  | `/api/test/*` : exiger `TEST_API_SECRET` header en plus de NODE_ENV | XS   |
| 6  | Ajouter scan SCA (`npm audit --audit-level=high` dans CI)         |  S     |

### P1 — Hygiène

| #  | Item                                                              | Effort |
| -- | ----------------------------------------------------------------- | :----: |
| 7  | Refactor `qr.assign` + `qr.assignToObject` en un helper commun     |  S     |
| 8  | Singleton `getResendClient()` + utiliser dans les 3 call sites     |  XS    |
| 9  | Helper `ownedObjectOrThrow(prisma, userId, objectId)`              |  S     |
| 10 | Helper `paginatedResult(items, limit)` ou middleware tRPC         |  S     |
| 11 | Helper `withComputedOverdue(loans)` (factoriser 5× la logique)    |  XS    |
| 12 | Supprimer `nodeToRequest` (server.ts:46-54) + 2 TODO `contacts.ts` |  XS    |
| 13 | Standardiser `ctx.userId` partout (linter rule ou codemod)        |  S     |
| 14 | ESLint `no-explicit-any: error` au lieu de `warn`                  |  XS    |
| 15 | Tests unitaires pour `lib/handle.ts`, `lib/geo.ts`, `lib/logger.ts` | S    |

### P2 — Produit / Mobile

Voir [BACKLOG.md §P2](BACKLOG.md#-p2--produit--mobile). Notamment :
- Implémenter les stubs mobile (objects/add, loans/new, scan).
- Detox ou Maestro pour tests mobiles.

### P3 — Stratégique

- Staging séparé.
- Pipeline de déploiement auto (GitHub Actions → VPS).
- Sentry / OpenTelemetry pour observabilité.

---

## 15. Score détaillé

| Critère                    | rev 3  | rev 4  | Justification                                                              |
| -------------------------- | :----: | :----: | -------------------------------------------------------------------------- |
| Cohérence architecturale   | 9/10   | 9/10   | Monorepo propre, packages bien définis                                     |
| Séparation des couches     | 6/10   | 6/10   | Pas de service layer ; logique dans routers (toujours)                     |
| Versioning de schéma       | 8/10   | 8/10   | 10 migrations Prisma + DATABASE.md                                         |
| Typage end-to-end          | 7/10   | 7.5/10 | `as any` 0 ; cast `betterAuth` reste 1 zone grise                          |
| Validation entrées         | 8/10   | 8/10   | Zod systématique                                                            |
| Tests unitaires            | 8/10   | 8/10   | 14/14 routers, lib/ non couvertes                                          |
| Tests E2E                  | 8/10   | 8/10   | Pas re-run, baseline 11 rouges                                             |
| Tests mobiles              | 0/10   | 0/10   | Toujours absents                                                            |
| Auth                       | 8/10   | 8/10   | BetterAuth cross-platform, lock handle OK                                  |
| Sécurité applicative       | 6/10   | 5.5/10 | ↓ : pas de rate limit + 22 `throw new Error` + CORS incohérent             |
| Observabilité              | 6/10   | 6.5/10 | Logger structuré + log community-request matching, pas de Sentry/OTel      |
| Performance                | 7/10   | 7.5/10 | Compression photos client, upload séquentiel                               |
| Redondance                 | —      | 6/10   | Nouvelle dimension : 3× Resend, qr.assign/assignToObject, ownership × 17   |
| Documentation              | 9/10   | 9/10   | + DATABASE.md                                                              |
| CI/CD                      | 7/10   | 7/10   | 4 jobs OK, pas de SCA, pas de staging                                       |
| Onboarding nouveau dev     | 9/10   | 9/10   | postinstall + doc set complet                                               |

---

*Audit initial : 2026-05-29 (rev 1).*
*Rev 2 : 2026-05-29 soir après 9 commits P0+P1+P3+ops.*
*Rev 3 : 2026-05-31 après mega-sprint community-request + notifs + profile.*
*Rev 4 : 2026-06-02 — focus dette invisible (sécurité + redondance). Code base :
~22 500 lignes TS/TSX hors `node_modules`.*
