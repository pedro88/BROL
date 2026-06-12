# AUDIT BROL — 2026-06-12 (rev 5)

> Audit du monorepo Brol. **Périmètre rev 5 : web uniquement**
> (`apps/web` + `packages/{api,db,shared}` + infra). Mobile exclu à la
> demande — la note "parité mobile" est gelée.
>
> **Révision 5 (2026-06-12)** — après 22 commits depuis rev 4 :
> badges v1 (109 badges + pixel art), VIDEOGAME, BGG lookup, mobile M1,
> superjson, quotas, audit trail, rate limiting, self-service, i18n
> backend, +46 tests sécurité/edge-cases en 2 passes.
>
> Méthode : 6 agents d'audit en parallèle (sécurité API, sécurité front,
> correctness, performance, qualité/DX, UX/i18n/a11y) + vérification
> manuelle de chaque finding critique + **fixes appliqués dans la foulée**
> (commits `3ac3029`, `9459867`). Tests re-run : 332/332.

---

## TL;DR

| Dimension                 | rev 4 (02/06) | **rev 5 (12/06)** | Δ    |
| ------------------------- | :-----------: | :---------------: | :--: |
| Architecture              | 8/10          | **8/10**          |  →   |
| Qualité de code           | 7.5/10        | **8/10**          |  ↑   |
| Tests — unitaires         | 8/10          | **9/10**          |  ↑   |
| Tests — E2E               | 8/10          | **7.5/10**        |  ↓   |
| Sécurité                  | 5.5/10        | **7.5/10**        |  ↑↑  |
| Performance               | —             | **6.5/10**        | new  |
| DX / outillage            | 8/10          | **8/10**          |  →   |
| Documentation             | 9/10          | **9/10**          |  →   |
| CI/CD & déploiement       | 7/10          | **7/10**          |  →   |
| Complétude fonctionnelle  | 7.5/10        | **8.5/10**        |  ↑   |
| **Global (hors mobile)**  | 7.0/10        | **7.8/10**        |  ↑   |

**Verdict** : grosse remontée sécurité — les trous de la rev 4 (rate
limiting, erreurs 500, CORS) sont fermés, et cette passe a trouvé puis
**corrigé 6 vulnérabilités authz/XSS de plus** (cf. §3). Les tests
unitaires couvrent désormais les surfaces d'attaque (IDOR, quotas,
privacy). La dette restante est concentrée sur la **performance**
(badge sync ~50 requêtes par mutation, indexes composites, polling) et
le **polish i18n/a11y** des composants récents. ⚠️ Rien de tout ça
n'est déployé : la prod tourne toujours avec les failles.

---

## 1. Sécurité — 7.5/10 (était 5.5)

### Corrigé pendant cet audit (commits `3ac3029`, `9459867`)

| Sévérité | Faille | Fix |
|---|---|---|
| P0 | **`badge.award`** : tout user connecté pouvait s'attribuer n'importe quel badge (procédure sans aucun check) | Procédure supprimée ; `syncUser` verrouillé sur le caller ; test de régression anti-réintroduction |
| P0 | **`users.getById` + `users.search`** : email de n'importe qui retourné par id/handle, et recherche email par **substring** → énumération d'emails inscrits | Email gated par `Profile.publicEmail` (ou self) ; match email exact uniquement |
| P1 | **XSS** : noms d'objets interpolés non-échappés dans le HTML `document.write` des 2 flux d'impression QR (`/qr` bulk + `qr-code-image`) | Helper `escapeHtml()` appliqué à toute donnée user des templates |
| P1 | **`notification.create`** : `userId` arbitraire accepté → spam/phishing de n'importe quel user avec titre/message libres | FORBIDDEN si `userId !== caller` |
| P1 | **IDOR `photos.reorder`** : ownership vérifié sur l'objet mais pas sur les `photoId` du payload → écriture sur les photos d'autrui | Updates filtrés sur les photos de l'objet possédé |
| P1 | **Open redirect** : `callbackUrl` de `/sign-in` poussé tel quel dans `router.push` | Restreint aux chemins internes (`/...`, pas `//...`) |

Hérité des passes précédentes (déjà en place) : rate limiting auth
5/min/IP + tRPC 60 read / 20 mut par user, quotas par tier enforced,
audit trail sign-in/out **réellement branché** (l'implémentation `on:`
était du code mort — fix `1536d63`), erreurs TRPCError typées, CORS
restreint, gates E2E prod, handle verrouillé.

### Restant (non corrigé)

- **P2 — Pas de CSP / security headers** (`next.config`) : pas de
  `Content-Security-Policy`, `X-Frame-Options`, `Referrer-Policy`.
  Une CSP stricte aurait neutralisé l'XSS print par défaut.
- **P2 — `buildTrustedOrigins`** : 4 ports localhost hardcodés présents
  aussi en prod. Restreindre par `NODE_ENV`.
- **P2 — Privacy QR print** : `/qr` print passe par `api.qrserver.com`
  → les URLs (object ids) partent chez un tiers + dépendance réseau.
  La lib `qrcode` est déjà dans les deps (utilisée par
  `qr-code-image`) — l'utiliser aussi pour le print bulk.
- **P3 — Soft gate localisation** : cookie `brol_loc_complete`
  trivialement posable à la main. Acceptable (gate UX, pas sécurité),
  mais ne jamais s'appuyer dessus côté API.
- **P3 — `window.open` sans `noopener`** : flux print (documents blancs
  → risque théorique).
- **P3 — Cookies `brol_locale`/`brol_loc_complete`** posés sans
  `Secure` dans 2 composants (le reste du code le fait).

## 2. Correctness — bugs confirmés

### Corrigé pendant cet audit

- **Badges** : `requests_fulfilled_by_count` comptait les requests
  fulfilled de **toute la DB** (2 badges seedés débloquables par tout le
  monde) → attribué via `fulfillBy.authorId`. Requête dupliquée
  on-time/late returns → late returns réels (`returnedAt >
  returnDueDate`, raw SQL).
- (passes précédentes du jour : `selfServiceMode` strippé par zod à la
  création, include `borrower` manquant → notif "Un utilisateur",
  import `Switch` manquant → crash dialog édition, VIDEOGAME absent du
  comptage badges GAMING.)

### Restant

- **P1 — Quota TOCTOU** : `enforceQuota` + `create` non transactionnels
  → 2 requêtes parallèles peuvent dépasser la limite (collections,
  objets, prêts). Impact faible (dépassement de 1), fix = transaction
  ou contrainte.
- **P2 — Cache invalidation** : après `loans.return`/`create`, les
  queries `objects.get`/`objects.all` ne sont pas invalidées → page
  objet affiche un prêt actif périmé.
- **P2 — `loans.cancel`** n'accepte que `ACTIVE` ; `loans.return`
  accepte `ACTIVE|OVERDUE`. Un prêt OVERDUE est inannulable. À trancher.
- **P3 — Handlers badges stub** (`has_avatar`, `has_bio`,
  `profile_complete_percent`, `tier_upgrades_count` retournent 0) —
  aucun badge seedé ne les utilise, dead code à nettoyer ou câbler.
- **P3 — Notification non transactionnelle** avec le prêt (best-effort
  acceptable, à logger).
- **P3 — `.catch(() => {})`** sur les syncs badges : avaler l'erreur OK,
  mais sans log → indiagnosticable. Logger.

## 3. Performance — 6.5/10 (nouvelle dimension)

Le point chaud unique : **`syncUserBadges` = ~45-50 requêtes Prisma**,
hooké dans ~10 mutations, **awaité** (bloquant la réponse) dans
contacts/photos/messages/community-request et fire-and-forget dans
loans/objects. Une création d'objet ≈ 50-70 requêtes au total.

Priorités :

1. **P1** — Uniformiser : `syncUserBadges` fire-and-forget partout
   (+ log d'erreur), ou queue différée. Remplacer les 10 counts
   `objectByType` par un seul `groupBy`. Borner les `findMany` des
   streaks (`take: 500`).
2. **P1** — `objects.getPublic` inclut **tout** l'historique loans sans
   `take` ; `messages.inbox` sans borne non plus.
3. **P2** — Indexes composites manquants : `Loan(ownerId, status)`,
   `Loan(status, returnDueDate)`, et pré-filtre pays avant Haversine
   (`User(country)` déjà indexé — l'utiliser dans la requête matching).
4. **P2** — Polling : 30 s (bell + inbox) + 15 s (thread requests).
   OK aujourd'hui, à remplacer par SSE/WebSocket si trafic.
5. P3 — Streaks calculés en mémoire sur tout l'historique.

## 4. Tests — unit 9/10, E2E 7.5/10

- **332 unit tests / 28 fichiers**, tous green. Tous les routers ET
  toutes les libs critiques couverts (quota, audit, owned-objects,
  badge-service, rate-limit, geo, loan-status). Les fixes sécurité du
  jour ont chacun leur test de régression.
- Couverture gate CI : 60/50/60/60 (stmts/branches/funcs/lines).
- **E2E : 17 specs Playwright, 6 `.skip` non triés** — la suite n'a pas
  été re-run pendant cet audit. À dépoussiérer (raison de la baisse).
- Web : 0 test unitaire composant (E2E only). Acceptable tant que la
  logique vit dans l'API.

## 5. Qualité de code / DX — 8/10

- `tsc --noEmit` **0 erreur** (web + api) — était rouge avant le 12/06.
- `any`/`as any` résiduels : ~12 (essentiellement BetterAuth config et
  le pont public/privé de `collections/[id]`). Bas.
- **CI : il manque un job `build` web** — les erreurs de compilation
  Next ne sont attrapées qu'au déploiement. À ajouter (gap principal).
- **`*.tsbuildinfo` commités** (~1.8 MB de churn) → `.gitignore` +
  `git rm --cached`.
- Duplication ciblée : `OBJECT_TYPES` + schemas inline dans
  `collections.ts` (workaround tsx watch documenté), labels
  badges/notifications locaux à 3 composants au lieu du catalogue i18n.
- 13 `console.*` côté web (pas de logger front) ; 2 TODO légitimes
  (invitations contacts).

## 6. UX / i18n / a11y

- **i18n : ~14 strings FR hardcodées dans 9 fichiers** (dialogs
  création/édition, photo-gallery, global-error, star-rating
  aria-label). Catalogue + switcher OK par ailleurs. Pass d'une heure.
- **a11y** : boutons icône sans `aria-label` (crayons d'édition, menu
  collection), `alt=""` sur covers porteuses de sens, labels sans
  `htmlFor` dans create-request-dialog, aria-labels FR hardcodés.
- **Patterns mixtes** : `confirm()` natif sur 2 suppressions (QR,
  objet) vs Dialog custom partout ailleurs ; 2 mutations sans
  `onError` toast (create-collection, edit-object) ; quelques boutons
  submit sans état disabled.
- Empty/loading states globalement bons (skeletons manquants sur les
  stats dashboard, "...").

## 7. Complétude fonctionnelle — 8.5/10

Livré depuis rev 4 : badges v1 complet (109 badges, moteur de critères,
notifs, page, profil, pixel art), self-service 4 modes, messages vs
notifications séparés, thèmes (4 presets), i18n web+backend fr/nl/en,
BGG lookup (token à provisionner), VIDEOGAME, quotas, audit trail.
Manquant notable : paiements (Mollie, hors scope), notifications de
rappel automatiques (cron), recherche full-text.

---

## Plan d'action priorisé

**Fait pendant l'audit** ✅ : 6 failles (XSS ×2, IDOR, spoofing notif,
énumération email ×2, open redirect) + badges global count + tests.

**P1 — cette semaine** :
1. **Déployer** : la prod tourne avec TOUTES les failles corrigées
   depuis le 8/06 (badge.award, getById, notification.create, XSS...).
   Migrations + seed badges en attente aussi.
2. CI : job `next build` web.
3. Perf badges : `groupBy` objectByType + fire-and-forget uniforme
   + `take` sur les streaks → ramène ~50 req/mutation à ~15 non
   bloquantes.
4. `objects.getPublic` : `take: 20` sur l'historique loans.

**P2 — prochain sprint** :
5. Security headers / CSP dans `next.config`.
6. Indexes composites `Loan(ownerId,status)` + `(status,returnDueDate)`
   + pré-filtre pays Haversine.
7. Pass i18n (14 strings) + a11y (aria-labels, alt, htmlFor).
8. `confirm()` → ConfirmDialog ; onError toasts manquants.
9. Quota TOCTOU en transaction ; invalidation cache objets après
   return ; trusted origins par env.
10. Triage des 6 E2E `.skip` + re-run suite complète.

**P3** : print QR sans api.qrserver.com, noopener, cookies Secure,
logger front, tsbuildinfo gitignorés, nettoyage handlers badges stub.

---

*Rev 4 (2026-06-02) archivée dans l'historique git (`git show
59a0864^:AUDIT.md`).*
