# BACKLOG — Brol

> Source unique de vérité pour le backlog produit + technique.
> Remplace l'ancien `todo.md` (mélangeait bugs, features et notes).
>
> Convention :
> - **Bug** : régression ou comportement cassé en prod.
> - **Feat** : nouvelle fonctionnalité.
> - **Tech** : refactor, hygiène, infra.
> - **Doc** : documentation.
>
> Chaque item est exportable tel quel vers Github Issues / Linear quand
> on installera `gh` ou un MCP server Linear.

---

## 🔥 P0 — Bloquants

**0 item ouvert.** (Tous clos au 2026-06-01.)

- [x] **Bug** — ~~Dashboard "Demander à la communauté" : toast
  "undefined voisin notifié"~~ — fix défensif livré 2026-05-31 (cf.
  Historique).
- [x] **Bug** — ~~Pas de notification créée même quand un voisin
  possède un objet matching~~ — vérifié 2026-06-01. **Pas de bug
  code** : 23 tests unitaires `community-request.test.ts` couvrent
  matching radius + ILIKE name/author + auto-exclusion caller +
  hors-rayon → tous green. Le scénario reporté 2026-05-31 était un
  test single-user (matching exclut le caller par design). Log
  structuré `log.info("community request matching", {...})` ajouté
  dans `create` pour observabilité prod (radius, lat/lng auteur,
  matchCount) — facilite diagnostic si le bug est reporté à nouveau.

---

## 🟠 P1 — Hygiène en cours

**Issus de l'audit rev 5 (2026-06-12, cf. AUDIT.md)** :

- [ ] **Infra** — **Déployer en prod** : toutes les failles corrigées
  (badge.award, getById/search email, notification.create, XSS print,
  photos.reorder, open redirect) + 3 migrations + seed badges attendent
  sur le VPS. La prod tourne avec les vulnérabilités.
- [ ] **Tech** — CI : ajouter un job `next build` web (les erreurs de
  compilation ne sont attrapées qu'au déploiement).
- [ ] **Perf** — `syncUserBadges` : remplacer les 10 counts
  `objectByType` par un `groupBy`, fire-and-forget uniforme (+ log),
  `take: 500` sur les streaks. Aujourd'hui ~50 requêtes par mutation,
  awaité (bloquant) sur contacts/photos/messages/community-request.
- [ ] **Perf** — `objects.getPublic` : `take: 20` sur l'historique
  loans (non borné) ; `messages.inbox` non borné.
- [ ] **Tech** — Security headers / CSP dans `next.config.js`
  (X-Frame-Options, Referrer-Policy, CSP stricte).
- [ ] **Perf** — Indexes composites `Loan(ownerId, status)` +
  `Loan(status, returnDueDate)` ; pré-filtre `country` avant Haversine
  dans le matching community-request.
- [ ] **Feat** — Pass i18n : ~14 strings FR hardcodées dans 9 fichiers
  (create-collection-dialog, edit-object-dialog, photo-gallery,
  global-error, star-rating aria-label...).
- [ ] **Feat** — Pass a11y : aria-labels boutons icône, `alt` covers,
  `htmlFor` create-request-dialog, `confirm()` natif → ConfirmDialog
  (QR + objet), onError toasts manquants (2 mutations).
- [ ] **Tech** — Quota TOCTOU (enforceQuota + create non
  transactionnels), invalidation cache `objects.*` après
  `loans.return`, `loans.cancel` doit-il accepter OVERDUE ?
- [ ] **Tech** — Triage des 6 E2E `.skip` + re-run suite complète.
- [ ] **Tech** — `.gitignore` les `*.tsbuildinfo` + `git rm --cached`.


- [x] **Feat** — ~~Uniformiser l'ajout de contact (`/contacts`
  ↔ flux de prêt)~~ — livré 2026-06-01. Nouveau composant
  `apps/web/src/components/contacts/add-contact-dialog.tsx` avec 3
  onglets : Manuel (`contacts.create`), ID/Handle (`users.getById` +
  `contacts.addFromScan`), QR code (scan profil Brol). Wire dans
  `/contacts/page.tsx`. Edit reste sur l'ancien `ContactDialog`.

- [x] **Tech (dette)** — ~~Ajouter le transformer **superjson** au lien tRPC.~~
  livré 2026-06-04 (api + web). Les `Date` traversent maintenant le fil en
  `Date` (plus de string). `transformer: superjson` posé dans
  `initTRPC...create()` (api) + `httpBatchLink` (web). Types frontend
  corrigés là où superjson révélait l'hypothèse string (NotifData,
  ReviewCard, RequestCard, profil `formatMemberSince` → `Date | string`).
  Contournements `new Date(...)` laissés en place (inoffensifs, tolèrent
  Date). Tests api OK (createCaller non affecté).
  - ~~**Reste mobile** : `transformer: superjson` + dep~~ — commité
    2026-06-12 avec le chantier mobile M1 (cf. Historique).

## 🟡 P2 — Produit / mobile

### Dashboard

- [x] **Feat** — ~~Actions rapides : format carrousel cards (carré)
  comme les stats, sans le descriptif (titre seul + icône). Supprimer
  `description` du composant `QuickAction` (`apps/web/src/app/page.tsx`).~~
  — livré 2026-06-08.
- [x] **Feat** — ~~Card "Objets" / `/objects` tableau filtrable~~ —
  vérifié 2026-05-30. Colonnes desktop [Nom / Collection / État /
  Status] présentes (`apps/web/src/app/objects/page.tsx:213-219`),
  filtres search + collection + status (all/available/lent/borrowed).
- [x] **Feat** — ~~Card "Prêtés" : ajouter `?status=overdue` si
  overdue > 0~~ — livré 2026-05-30. Dashboard dérive `overdueLoans`
  via `computedStatus === "OVERDUE"`, href devient
  `/loans?tab=lent&status=overdue` quand > 0 (label inclut le
  count). `/loans` consomme `?tab` + `?status=overdue` via
  `useSearchParams` (wrappé Suspense), chip "Filtre : en retard"
  avec bouton "Effacer".
- [x] **Feat** — ~~Section "Prêts récents" : date + lien~~ —
  vérifié 2026-05-30. `loan.returnDueDate` formatté fr-BE,
  `href={\`/objects/${loan.object.id}\`}`
  (`apps/web/src/app/page.tsx:147-149, 159-168`).
- [x] **Bug** — ~~Card "Objets" hauteur incohérente~~ — fix
  2026-05-30. `StatCard` réserve maintenant un slot `trend`
  permanent (espace insécable si vide) + `h-full` + `flex flex-col`
  sur la card et `h-full` sur le `Link` wrapper. Toutes les cards
  s'alignent (`apps/web/src/app/page.tsx:222-238, 244`).

### Création d'objet — par type

- [x] **Feat** — ~~Type CLOTHING : size/gender/color/material/brand~~ —
  livré 2026-05-30. `size`/`gender`/`color`/`material` existaient
  déjà ; ajout `brand String?` partagé (CLOTHING + TOOL) au schema +
  Zod schemas + UI form (create + edit).
- [x] **Feat** — ~~Type TOOL : label "Outils" + powerSource + brand~~ —
  livré 2026-05-30. Label "Outils" déjà mappé dans `typeLabels`
  (`object-form.tsx:25-34`). Nouvel enum `ToolPowerSource`
  (`MANUAL`/`MAINS`/`BATTERY`) sur `Object`. Migration SQL backfill
  les anciens booléens (`toolManual=true → MANUAL`, `toolBattery=true
  → BATTERY`, TOOLs restants → `MAINS`). `toolManual` + `toolBattery`
  marqués deprecated mais gardés pour rétro-compat. `brand` partagé.
  UI : select Alimentation + input Marque sur TOOL form (create + edit).
- [x] **Feat** — ~~deposit + rentalPriceDay/Hour/Week sur tout type~~ —
  déjà présents avant ce sprint (`cautionAmount` + `rentalPriceDay`/
  `Hour`/`Week`/`Km` sur `Object`).
- [x] **Bug** — ~~Champ "Marque" doublé sur TOOL (et CLOTHING)~~ —
  fix 2026-05-30. Le champ `author` était labellisé "Marque /
  Fabricant" par `authorLabels[TOOL]`, en plus du nouveau `brand`
  dédié. Solution : masquer `author` pour CLOTHING + TOOL, ne
  garder que `brand`. Idem dans `edit-object-dialog.tsx`. Migration
  data `author → brand` pour les anciens objets : à faire séparément
  (cf. **Idées non-priorisées**).
- [x] **Feat** — ~~Câbler la catégorie **BOARDGAME** avec
  **BoardGameGeek XML API v2**~~ — livré 2026-06-12.
  `objects.searchBgg` (top 10, nom + année) + `objects.lookupBgg`
  (titre, designers, joueurs min/max, durée, âge min, cover) mappés
  sur le form BOARD_GAME (UX identique au lookup ISBN : input debounce
  → liste → click → autofill). Parsing XML par regex, sans dépendance.
  ⚠️ **La spec "pas d'API key" est périmée** : depuis oct. 2025 BGG
  exige un Bearer token (enregistrer l'app sur
  `boardgamegeek.com/using_the_xml_api`) → env `BGG_API_TOKEN`
  (documenté MAINTENANCE.md). Sans token l'UI affiche "non configuré".
  **Action requise** : créer le compte/token BGG et le poser dans
  `/opt/brol/.env`.
- [ ] **Feat** — Élargir le prefill aux autres types : IGDB pour
  VIDEOGAME, TMDB pour MOVIE (OpenLibrary déjà câblé pour BOOK via
  `objects.lookupIsbn`). Les deux demandent une API key.
- [x] **Tech** — ~~Retirer le champ « Code-barres » du formulaire de
  création d'objet (`object-form.tsx`). Garder en DB (`barcode`) mais
  hors UI de création.~~ livré 2026-06-04. Bloc input retiré ; `barcode`
  conservé dans le form state (default "") et en DB.

### Flux UX d'ajout d'objet

- [x] **Bug** — ~~Si aucune collection n'existe, l'action rapide
  "AJOUTER UN OBJET" redirige vers `/objects/add` (sans `collectionId`).
  Le formulaire tente d'auto-sélectionner la première collection mais
  échoue silencieusement (0 collection → rien à sélectionner). L'utilisateur
  peut soumettre un form avec `collectionId` vide → erreur 400/404 du
  backend.~~ Fix 2026-06-10 :
  - Page `/objects/add` : vérifie `collections.list` → si vide, affiche
    empty state avec CTA "Créer une collection" → `/collections/new`.
  - `object-form.tsx` : bouton submit disabled si `!collectionId && !watchedCollectionId`
    (empêche submit avant sélection de collection).
  - Traductions ajoutées (`collections.noCollections`,
    `objects.addRequiresCollection`) en fr/en/nl.
- [x] **Feat** — ~~Upload de photo dès la création~~ — vérifié
  2026-05-30. `PhotoPicker` câblé dans `object-form.tsx:372-381`,
  upload via S3 presigned URL après création
  (`object-form.tsx:257-267`).
- [x] **Bug** — ~~Pas de redirect modal d'édit après création~~ —
  vérifié 2026-05-30. `apps/web/src/app/objects/add/page.tsx:48`
  redirige vers `/collections/{collectionId}`. Test E2E
  "object add — no redirect after creation" passe.
- [x] **Feat** — ~~Modal d'édit objet adaptée au type~~ — vérifié
  2026-05-30. `EditObjectDialog` rend les sections type-spécifiques
  (`showBoardGameFields`, `showElectricFields`, `showClothingFields`,
  `showToolFields`, `showCustomFields` à
  `edit-object-dialog.tsx:91-95`).
- [ ] **Feat mobile** — Scanner QR pour assigner à l'objet créé.
  Composant `apps/mobile/src/components/qr-scanner.tsx` + écran
  `objects/add.tsx`. Bloqué par parité mobile (cf. section dédiée).
- [x] **Bug** — ~~Action rapide "AJOUTER UN OBJET" toujours BOOK~~ —
  fix 2026-05-30. `ObjectForm` ne dérivait `objectType` qu'à partir
  du prop `collectionId` ; quand l'auto-sélection (premier item de
  `collections.list`) mettait à jour le champ form, la query
  `collections.get` ne se relançait pas. Maintenant la query suit
  `watch("collectionId")` via `effectiveCollectionId` =
  `collectionId ?? watchedCollectionId`, et l'`objectType` se met à
  jour quand l'utilisateur change de collection dans le dropdown.
  (`object-form.tsx:103-128`)

### Affichage / accès objet

- [x] **Feat** — ~~Page `/objects/[id]` toujours accessible~~ — livré
  2026-05-30. Nouvelle procédure `objects.getPublic` (publicProcedure)
  qui retourne 3 niveaux d'accès :
  - **owner** : toutes les infos (équivalent ancien `get`) + `loans`
    + `qrStock` + flags `isOwner=true`.
  - **viaContact** (caller a un `Contact` lié au `User` propriétaire) :
    vue enrichie read-only (notes, brand, type-spécifiques, caution
    + prix de location). Pas de `loans` ni `qrStock` (réservés
    owner). Flag `viaContact=true`.
  - **anonyme** : champs publics seuls (nom, auteur, condition,
    photos, collection name + owner name/handle). Pas de notes,
    pricing, ni infos privées.
  - `objects.get` modifié : retourne `null` au lieu de throw quand
    caller ≠ owner (graceful fallback côté frontend).
  - Page `/objects/[id]` consomme **les 2 queries en parallèle** :
    `get` (protégée, owner-only ; retry au cas où le token n'est pas
    encore sync) → si data, vue owner complète ; sinon fallback sur
    `getPublic`. Cette stratégie évite que la version anonyme de
    `getPublic` reste en cache pendant la course init session.
  - Badge "Via votre contact" / "Objet partagé" en haut quand
    `!isOwner`. Boutons Modifier / Supprimer / Prêter / QR
    assign masqués hors owner. Action "Demander à la communauté"
    reste accessible.
  - `trpc-provider` : invalide aussi le `QueryClient` quand
    `sessionTokenStore` change, pour purger les responses anonymes
    cachées au premier render.
  - Tests unit : 5 cas pour `getPublic` (anonyme, owner, viaContact,
    unauthenticated, null id).
- [x] **Bug** — ~~Page d'un objet prêté : on ne voit pas à qui il est
  prêté.~~ livré 2026-06-04. Bloc emprunteur (nom + date retour) sur
  `/objects/[id]` quand un prêt ACTIVE/OVERDUE existe, + badge "En retard"
  si `computedStatus === OVERDUE`. Sélection explicite du prêt en cours
  (pas `loans[0]`, qui peut être CANCELLED/RETURNED).
- [x] **Bug** — ~~Page d'un objet prêté : le bouton « Prêter » reste
  visible → l'objet peut être prêté 2×.~~ livré 2026-06-04. Bouton
  « Prêter » désactivé (`disabled`) + libellé "Prêt en cours" si un prêt
  actif existe.

### Loans / contacts

- [x] **Feat** — ~~Modal de prêt : dropdown contacts avec recherche~~ —
  vérifié 2026-05-30. Les 2 flux d'entrée (`/loans` NOUVEAU PRÊT +
  `/objects/[id]` "Prêter") passent déjà par `CreateLoanDialog` →
  `BorrowerSelectDialog` qui a une recherche live sur contacts +
  utilisateurs Brol (`borrower-select-dialog.tsx:183-277`). Aucun
  flux divergent à harmoniser.
- [x] **Bug** — ~~Historique owner/borrower~~ — fix 2026-05-30.
  `loans.history` expose maintenant `viewAs: "owner" | "borrower"`
  par item (dérivé de `loan.ownerId === ctx.userId`). `LoanCard`
  utilise ce flag, affiche "Emprunté le X" au lieu de "Prêté le X"
  côté borrower, et masque le bouton "Marquer rendu" (déjà gardé
  par `viewAs === "owner"`). 2 tests unit ajoutés.
- [x] **Feat** — ~~Cards objets cliquables sur `/loans`~~ — livré
  2026-05-30. `LoanCard` enveloppe cover + nom + statut dans un
  `<Link href="/objects/{id}">`. Hover opacity. (`ObjectPickerDialog`
  laissé tel quel — click = sélection pour prêt.)
- [x] **Feat** — ~~Auto-ajout du borrower en contact~~ — livré
  2026-05-30. `loans.create` lookup `Contact` existant
  (`userId=caller, borrowerId=user.id`). Si absent, crée le contact
  avec `name` + `email` hydratés du `User`. Best-effort (try/catch
  silencieux). 2 tests unit (création + idempotent).
- [x] **Feat** — ~~Créer contact depuis modal de prêt + cohérence
  champs~~ — livré 2026-05-30. Onglet "Nouveau" du
  `BorrowerSelectDialog` accepte maintenant aussi le champ `note`
  (manquait par rapport au `ContactDialog` standalone). Parité
  Nom/Email/Téléphone/Note avec `/contacts`.
- [x] **Bug (notable)** — ~~Après avoir prêté un objet d'une collection,
  retourner sur la collection → erreur.~~ livré 2026-06-04. Cause : le
  client tRPC n'a pas de transformer superjson → les dates arrivent en
  `string`, mais `transformPrivateObject` appelait
  `returnDueDate?.toISOString()` (le `?.` ne protège que du null, pas du
  type) → crash au render dès qu'un objet a un prêt actif **avec date de
  retour**. Fix : `new Date(returnDueDate).toISOString()` (tolère
  string|Date) dans `collections/[id]/page.tsx`. À re-vérifier en
  reproduisant (prêt avec échéance → retour collection).

### QR codes / impression

- [x] **Feat** — ~~`/qr` affiche l'objet associé~~ — livré 2026-05-30.
  `qr.listStock` inclut la relation `objects` (cuid + name + cover
  + collection name/type), aplatie en `object` (1-1). UI : cards
  utilisées affichent thumbnail + nom + collection, clic → page
  détail objet. Cards libres montrent le code brut.
- [x] **Feat** — ~~Multi-sélection + PDF avec choix de taille~~ —
  livré 2026-05-30. Checkbox par card + bouton "Tout sélectionner /
  Effacer". Select "Taille des QR" (20/30/40/60 mm). Bouton
  "Imprimer / PDF" ouvre une fenêtre HTML imprimable avec grille
  CSS (auto-fill + page-break-inside avoid). Pas de dépendance
  jsPDF — utilise le dialog d'impression du navigateur pour générer
  le PDF.
- [x] **Bug** — ~~Les QR créés à la création d'un objet n'apparaissent pas
  sur `/qr` → impossible de les imprimer. Vérifier le lien
  objet↔qrStock à la création (`objects.create` + `qr.listStock`).~~
  — fix 2026-06-08. Wrapped QR update + object create dans une même
  transaction `$transaction` pour garantir l'atomicité. Avant : 2
  opérations séparées (QR marqué used, puis objet créé) — si create
  échouait, QR restait `used: true` sans lien objet.
- [x] **Feat** — ~~Filtrer les QR assignés par collection + recherche par
  nom d'objet sur `/qr`.~~ — livré 2026-06-08. Ajout `collectionId` +
  `search` dans `qr.listStock` input + filtre Prisma sur `objects.name`.
  Frontend : input recherche + select collection + bouton clear.
- [x] **Feat** — ~~Afficher le nom de l'objet sur le QR assigné (à l'écran
  + sur le PDF d'impression) pour savoir où coller chaque étiquette.~~
  — déjà implémenté. Écran : `qr.object.name` dans la card (`qr/page.tsx:406-418`).
  PDF : `objectName` dans `selectedCodes` + label du template HTML
  (`qr/page.tsx:79,95`).

Web a 19 pages, mobile a 12 écrans.

**Milestone 1 mobile livré 2026-05-30** :
- UI kit minimal mobile (`apps/mobile/src/components/ui/` :
  button / card / input / header / empty-state / spinner / badge).
- QR display via `api.qrserver.com` (sans dépendance native).
- PhotoPicker + helper `photo-upload.ts` (foundation pour M2 ; non
  branché aux 3 écrans M1).
- 3 écrans portés :

- [x] **Feat mobile** — ~~`/contacts` (liste)~~ — recherche +
  FlatList + badge "Brol" pour les contacts liés. Création + détail
  stubbed → Milestone 2.
- [ ] **Feat mobile** — `/contacts/[id]` (détail contact) → M2.
- [x] **Feat mobile** — ~~`/notifications`~~ — list + markRead +
  markAllRead + badge "Nouveau" sur cards unread.
- [x] **Feat mobile** — ~~`/settings` (handle + QR + tier)~~ —
  read-only ce milestone. Édition handle → M2.
- [ ] **Feat mobile** — `/profile/[handle]` (profil public d'un user) → M2.
- [ ] **Feat mobile** — `/qr/[code]` (scan QR public) → M2.
- [ ] **Feat mobile** — `/requests` (demandes communauté) → M2.

### Community requests

Spec figée 2026-05-30. Repositionner "Demander à la communauté" sur
dashboard + matching géolocalisé par rayon km. Le router
`community-request` existe déjà (`packages/api/src/routers/
community-request.ts`) mais l'UX et le matching sont à construire.

**Décisions** :
- Couverture **internationale** → ajout `country` + `postalCode` sur User.
- **Rayon configurable** : slider 5/10/25/50/100 km, défaut 25.
- **Soft gate post-signup** : signup inchangé (email/password). Au 1er
  login (et pour existing users sans CP), écran obligatoire "Complétez
  votre profil" avant accès dashboard.
- **Géocodage** : API externe **Zippopotam.us** (`api.zippopotam.us/
  {country}/{postalCode}`). Gratuit, no-auth, ~60 pays couverts. **Pas
  de cache DB** — chaque save de CP appelle l'API et hydrate
  `User.lat/lng/city`. Lookups suivants évités car lat/lng sont
  persistés sur User. Match par formule Haversine en SQL.
- **Validation** : autocomplete ville en live (debounce 400ms) sur
  formulaire onboarding/settings. Bloque submit si CP non résolu.

**Tâches** :

- [x] **Tech** — ~~Schema : `User.country/postalCode/city/lat/lng`~~ —
  livré 2026-05-31. Migration `20260530120000_add_user_location_and_
  postal_codes` + index `(country, postalCode)`.
- [x] **Tech** — ~~Helper `lib/geo.ts`~~ — livré.
  `geocodePostalCode` + `haversineSql` + `haversineKm`. 12 tests.
- [x] **Feat** — ~~`users.updateLocation` + `previewLocation`~~ —
  livré. Procédures protégées (preview pour debounce, update pour
  persist). 5 tests.
- [x] **Feat** — ~~Soft gate "complete-profile"~~ — livré. Cookie
  `brol_loc_complete` géré par middleware + page client
  `/onboarding/location` (clear cookie sur sign-in pour purger
  cross-session).
- [x] **Feat** — ~~Étendre `communityRequest.create`~~ — livré.
  Matching Haversine + ILIKE + fan-out notifications. Réutilise
  l'enum existant `NotificationType.COMMUNITY_REQUEST` (pas besoin
  d'un nouveau).
- [x] **Feat** — ~~Dashboard modal "Demander à la communauté"~~ —
  livré. Slider radius + toast matchCount.
- [x] **Bug** — ~~Retirer bouton sur `/objects/[id]`~~ — livré.
- [x] **Feat** — ~~Page `/requests`~~ — la page existait déjà
  (router `communityRequest.list`). Plus la page `/requests/[id]`
  ajoutée 2026-05-31 avec thread `requestMessages` complet.
- [ ] **Feat mobile** — Modal équivalent sur dashboard mobile → M2/M3.
- [x] **Bug/Security** — ~~Verrouiller la modification du pseudo
  (`handle`)~~ — livré 2026-05-31. Bouton "Modifier" retiré du UI
  settings + `users.updateHandle` retourne `FORBIDDEN`
  ("Le pseudo est définitif…"). 4 tests obsolètes supprimés,
  remplacés par 1 test verrouillage. Si on rouvre plus tard pour
  autoriser 1 changement, voir comment réactiver dans le router.
- [x] **Feat** — ~~Extension profil utilisateur~~ — livré 2026-05-31.
  - Schema `Profile` enrichi avec `birthYear/gender/phone` +
    toggles `publicEmail/Phone/BirthYear/Gender/City`
    (`publicCity` default true, les autres false).
  - Migration `20260531110000_profile_personal_info`.
  - `profile.update` accepte tous ces champs avec validation zod.
  - `profile.get` masque les champs sensibles sauf si flag public OU
    caller = self. Self récupère `visibility` pour piloter UI.
  - Settings : section "INFORMATIONS PERSONNELLES" avec inputs +
    toggle switch "Public" par champ.
  - `/profile/[id]` : composant `PublicInfoBlock` rend city/email/
    phone/birthYear/gender uniquement si visible. Bloc masqué si rien
    de public.
  - 6 nouveaux tests profile (16 total pour le router).
  - Section "Localisation" sur settings : pas faite séparément —
    déjà gérée via `/onboarding/location` + toggle `publicCity`.
- [x] **Tech** — ~~Tests unit~~ — livré 2026-05-31. 12 geo + 5 location
  + 5 matching + 9 requestMessages + 6 profile = 37 nouveaux tests.
  245/245 pass au total.
- [ ] **Tech** — E2E : signup → forced onboarding → CP → dashboard →
  créer demande → owner reçoit notif → click notif → envoyer message.

**UX gaps constatés à l'usage (2026-05-31) — tous livrés** :

- [x] **Feat** — ~~Visibilité de la demande post-submit~~ — livré
  2026-05-31. Dashboard expose section "MES DEMANDES" (5 plus
  récentes, masquée si vide) avec lien direct vers `/requests/[id]`.
  Backend : `communityRequest.myRequests` enrichi avec `messageCount`
  + `unreadCount` (groupBy SQL). Badge rouge sur la card si
  `unreadCount > 0`.
- [x] **Feat** — ~~Badge "nouvelles notifications" sur l'icône Bell~~
  — livré 2026-05-31. Header desktop + mobile menu affichent un badge
  rouge avec le compteur (max "9+"), polling 30s via
  `trpc.notification.unreadCount`. Pas de SSE/WebSocket pour V1.
- [x] **Feat** — ~~Click sur notification COMMUNITY_REQUEST → contact
  direct~~ — livré 2026-05-31 mais via flow alternatif :
  - Notif désormais cliquable (`/notifications` + click → markRead +
    router.push selon `relatedType`).
  - Plutôt qu'un bouton "Proposer cet objet" tiré du match, page
    `/requests/[id]` expose un thread in-app (modèle `RequestMessage`
    + router `requestMessages.send`/`list`). Pas besoin de stocker
    `relatedObjectId` sur Notification — owner choisit librement son
    propos dans une textarea.
  - Privacy : handle + nom seuls, email/phone selon flags Profile.
  - Email out-of-band via Resend (preview 120 chars + CTA vers
    `/requests/[id]`). Skipped si `RESEND_API_KEY` absent.

**V2 (hors scope initial)** :
- Full-text search Postgres `tsvector` au lieu de `ILIKE`.
- Réponses owner → message direct (router `messages` existe).
- Demande publique listée sur `/requests` (browsable par autres
  users).

### Sécurité applicative

- [x] **Tech** — ~~Rate limiting sur les routes auth (`sign-in`,
  `sign-up`).~~ livré 2026-06-08. Wrapper HTTP dans `server.ts` :
  5/min/IP sur `/api/auth/sign-in/*` et `/api/auth/sign-up/*`. tRPC :
  60/min/read + 20/min/mutation par user.
- [x] **Tech** — ~~Quota enforcement par tier (FREE/T2/T3).~~ livré
  2026-06-08. Helper `enforceQuota(ctx, resource)` dans `lib/quota.ts`.
  Centralise les limites (plus de duplication inline). Appliqué à
  `collections.create`, `objects.create`, `loans.create`.
- [x] **Tech** — ~~Audit trail sur actions sensibles (sign-in/out,
  collection_delete, object_delete).~~ livré 2026-06-08. Table
  `AuditLog` + helper `logAudit()` dans `lib/audit.ts`. Hooks
  BetterAuth `signIn`/`signOut` dans `auth.ts`. Audit sur
  `collections.delete` et `objects.delete`.
- [x] **Tech** — ~~Backup Postgres automatique~~ — `scripts/db-backup.sh`
  livré 2026-05-29. À déployer sur VPS via crontab (cf. MAINTENANCE §3).

### Internationalisation

- [~] **Feat** — i18n web + mobile. Locales cibles : `fr-BE`
  (défaut), `en`, `nl-BE` (Belgique néerlandophone).
  - [x] Web : ~~`next-intl` sans préfixe d'URL, locale via cookie
    `brol_locale` + Accept-Language. Catalogue partagé `@brol/shared`
    (`src/i18n/index.ts`). Switcher de langue.~~ livré 2026-06 (`dce8a90`,
    `cb7ea6d`).
  - [x] Backend : ~~erreurs tRPC, emails Resend et notifications
    localisés (fr/nl/en) via `ctx.locale` + `User.locale`.~~ livré
    2026-06 (`1b98a6a`).
  - [ ] Mobile : i18n **scaffoldé mais non câblé** —
    `apps/mobile/src/i18n/index.ts` initialise i18next mais **aucun
    écran n'utilise `useTranslation()`**, et il duplique les strings
    inline au lieu de consommer `getI18nextResources()` de `@brol/shared`.
    Reste : brancher sur le catalogue partagé + traduire les écrans.

### Messaging & notifications

- [x] **Feat** — ~~Distinguer **messages** vs **notifications**.~~ livré
  2026-06-04 (approche incrémentale, **sans migration DB**) :
  - Cloche dépolluée : `requestMessages.send` ne crée plus de
    `Notification` — les messages alimentent désormais le badge Mail.
  - Router `messages` étendu : `inbox` (threads `RequestMessage` agrégés
    par demande + messages QR anonymes `Message` en lecture seule),
    `unreadCount` (somme des 2 sources), `markQrRead`.
  - Header : 2 icônes (Bell + Mail) avec compteurs séparés. Page dédiée
    `/messages` (conversations → `/requests/[id]`, contacts QR → carte
    lecture seule + `mailto`).
  - Tests adaptés (`request-messages.test.ts` : plus de notif, unread Mail).
  - Évolution future possible : modèle `Conversation`/`Message` générique
    si besoin de threads hors-demande (pas nécessaire pour l'instant).

### Self-service

- [x] **Feat** — ~~Mode **self-service** sur objet ou collection.~~
  livré 2026-06-08 (complété 2026-06-08, simplifié 2026-06-08).
  - Schema : `SelfServiceMode` enum (`OFF`/`CONTACTS`/`RADIUS`/`PUBLIC`)
    + `Object.selfServiceMode` + `Collection.selfServiceMode`.
    `User.maxSelfBorrowPerWeek` (défaut 3) + `selfServiceRadiusKm`.
    NotificationType `SELF_BORROW`.
  - Backend : `loans.selfBorrow` (protectedProcedure) avec vérification
    éligibilité (mode CONTACTS → contact check, RADIUS → Haversine km,
    PUBLIC → any user), limite hebdomadaire, notification owner.
  - Cascade : `effectiveMode` dans `selfBorrow` = objet > collection
    (inheritance runtime). `collections.update` cascade vers objets enfants
    avec `selfServiceMode === "OFF"`.
  - UI simplifié : toggle unique CONTACTS/OFF dans `EditObjectDialog`,
    `object-form.tsx`, `create-collection-dialog.tsx`,
    `collections/[id]/edit/page.tsx`.
  - UI : bandeau "Auto-prêt" (Zap icon) sur object card et dans la liste
    `/objects` quand l'objet est disponible en mode self-service.

### Thème / apparence

- [x] **Feat** — ~~Switcher de thème graphique.~~ livré 2026-06-04. 4 presets
  via CSS variables (`[data-theme]` sur `<html>`) : Magenta (défaut) / Cyan /
  CRT ambre / Classique (mode clair "chiant", désactive les effets VHS).
  Sélecteur dans Paramètres (section Apparence, dispo mobile). Persistance :
  cookie `brol_theme` (lu côté serveur → pas de FOUC) + `User.theme` (suit
  l'utilisateur entre appareils via `users.updateTheme` + `ThemeSyncer`).
  Pistes initiales conservées ci-dessous pour mémoire :
  - **Cyan-dominant** : `--primary` = cyan `#00ffff`, magenta relégué en
    accent rare. Garde la vibe néon sans l'agression rose.
  - **CRT phosphore** : monochrome vert (`#33ff66`) ou ambre (`#ffb000`)
    sur fond noir — terminal 80s, très lisible, le plus « safe ».
  - **Synthwave** : violet/indigo (`#7b2ff7`) + cyan, dégradés sunset.
    Néon mais froid, moins criard que le magenta pur.
  - **Outrun** : orange/teal coucher de soleil (`#ff6b35` + `#00b3a4`).
  Reco : livrer 3 presets (Magenta actuel / Cyan / CRT ambre) + le
  switcher, garder Magenta par défaut.

### Vues bibliothèque

- [ ] **Feat** — Switch de visualisation pour `/collections/[id]` et
  `/objects`. Représenter chaque item via une icône type-spécifique
  inspirée du média physique :
  - **BOOK** : tranche de livre (bookshelf style).
  - **BOARDGAME** : boîte de jeu de côté.
  - **TOOL** : outil accroché à un mur perforé.
  - **VIDEOGAME** : boîtier DVD/cartouche.
  - **CLOTHING** : cintre.
  - **MOVIE** : VHS / DVD.
  Assets : SVG depuis **The Noun Project** (license CC, à vérifier
  par icône) ou Heroicons custom. Toggle UI : grid classique
  vs "shelf view". State persistant via `localStorage`.

### Infra & uploads

**Pipe S3 web livrée 2026-06-01** (cf. Historique). Provider :
**Hetzner Object Storage** (`fsn1.your-objectstorage.com`, bucket
`brol-storage`, region `eu-central-1`).

- [x] **Tech** — ~~Credentials prod + doc `MAINTENANCE.md`~~ — livré
  2026-06-01. Section "Object Storage S3" enrichie (génération
  credentials Hetzner, `host_bucket` s3cmd, flux upload).
- [x] **Tech** — ~~Bucket policy + CORS codifiés (IaC)~~ — livré
  2026-06-01. `deploy/s3/bucket-policy.json` (public-read sur
  `photos/*`), `deploy/s3/cors.xml` (GET/PUT/HEAD depuis
  `app.brol.dev`), `deploy/s3/setup.sh` (idempotent). Anti-drift
  prod ↔ repo.
- [x] **Tech/Bug** — ~~Sequencement upload `getPresignedUrl → PUT →
  photos.add`~~ — fix 2026-06-01. Avant : étapes 2+3 lancées en
  fire-and-forget dans `onSuccess` de la mutation → abortées par le
  redirect → photo perdue côté DB. Maintenant séquentiel awaité dans
  `onSubmit` (`object-form.tsx`) et `PhotoCapture` (déjà séquentiel).
- [x] **Tech/Bug** — ~~Logger tRPC en prod~~ — fix 2026-06-01.
  `server.ts onError` était `undefined` en prod → erreurs muettes.
  Maintenant warn (TRPCError fonctionnels) / error (reste + stack).
- [x] **Perf** — ~~Compression côté client avant upload~~ — livré
  2026-06-01. `apps/web/src/lib/image-compress.ts` (Canvas natif,
  pas de dep). Resize 2000px max + JPEG q=0.85. Câblé dans
  `object-form.tsx` (création) + `photo-capture.tsx` (ajout).
  Gain mesuré : 3.3 MB → 320–500 KB (~ -90 %).
- [ ] **Tech mobile** — Câbler `apps/mobile/src/lib/photo-upload.ts`
  + compression `expo-image-manipulator` dans un écran réel. Bloqué :
  `apps/mobile/app/objects/add.tsx` est un placeholder vide.
- [ ] **Infra** — CDN devant le bucket (latency BE/EU acceptable
  aujourd'hui, à reconsidérer si trafic). Alternatives : Cloudflare
  devant Hetzner via rewrite, ou migration vers R2 (egress gratuit).
- [ ] **Tech** — Lifecycle rules : auto-delete des photos orphelines
  (objets supprimés). À ajouter dans `deploy/s3/`.

---

## 🟢 P3 — Stratégique

- [ ] **Tech** — E2E mobile : choisir Detox ou Maestro. Maestro est plus
  léger à installer.
- [ ] **Infra** — Staging séparé de la prod (`stg.brol.dev` →
  `brol-web-stg:3010`, etc.). Voir MAINTENANCE.md pour cloner la
  topologie nginx.
- [ ] **Doc** — Diagrammes archi déjà rédigés (ARCHITECTURE.md). À
  maintenir à chaque migration majeure.
- [x] **Doc** — CONTRIBUTING.md créé.
- [x] **Doc** — AUDIT.md créé.
- [ ] **Doc** — Migrer ce fichier vers Github Issues quand `gh` sera
  installé : un issue par checkbox, avec les labels P0/P1/P2/P3 et
  Bug/Feat/Tech/Doc.

---

## ⚪ Idées non-priorisées

### Paiements (Mollie)

- [ ] **Feat** — Pipeline de paiement complet via **Mollie**
  (PSP belge, SEPA/Bancontact/cartes). 3 flux distincts :
  1. **Abonnements** — tiers FREE/T2/T3 (cf. section pricing
     ci-dessous). Mollie subscriptions API, webhook pour upgrade/
     downgrade/expiration. Mapping `User.tier` + `User.tierExpiresAt`.
  2. **Cautions** — bloquer le montant `Object.cautionAmount` au
     moment du prêt (autorisation Mollie sans capture), libérer
     au retour OK, capturer si non-retour / dégât. Modèle
     `LoanDeposit` (status: HELD / RELEASED / CAPTURED).
  3. **Locations** — paiement `rentalPriceDay/Hour/Week` à la
     création du prêt, redistribution au propriétaire (Mollie
     Connect / split payments). Commission Brol configurable.
  Tech : nouvelles tables `Payment`, `PaymentEvent`, `Payout`.
  Webhook signé Mollie. UI : page `/billing` pour abonnement,
  flux d'autorisation caution + facture sur création de prêt.
  Compliance : KYC vendeurs si redistribution Mollie Connect.

### Badges & gamification

- [x] **Feat** — ~~Système de badges fonctionnels~~ — **v1 livrée
  2026-06-12** (commit `feat(badges)`). 109 badges / 8 catégories
  rétro-geek / 5 tiers de rareté. `BadgeDefinition` enrichi
  (rarity/category/unlockHint/svgAsset), moteur de critères dans
  `packages/api/src/lib/badge-service.ts` (`syncUserBadges` hooké dans
  contacts/messages/photos/community-request + loans/objects),
  `NotificationType.BADGE_UNLOCKED`, seed 109 définitions, 120 SVG
  dans `apps/web/public/badges/`, page `/badges` (filtres catégorie +
  rareté, progress), badges sur profil public. Docs : `BADGES.md` +
  `BADGE_DESIGN_SPEC.md`.
  - [ ] **Reste** : cron pour conditions cumulatives (streaks,
    ancienneté) si les hooks event-based ne suffisent pas ; badges
    mobile (M2+).
- Spec d'origine (pour mémoire) : système de badges (déblocage sur
  événements : 1er objet ajouté, 10 prêts honorés, premier QR
  scanné, etc.) + cosmétiques sur thème **rétro geek**.
  Cible : ~100 badges. Pistes de thèmes :
  - **Cinéma/VHS** : Back to the Future, Blade Runner, Akira,
    Tron, Ghostbusters, Goonies, E.T., Princess Bride, Matrix.
  - **Littérature** : Seigneur des Anneaux (trilogie + Hobbit),
    Foundation, Dune, Hitchhiker's Guide, Discworld, Sandman.
  - **Jeux vidéo rétro** : Zelda, Mario, Sonic, Metroid, Final
    Fantasy, Castlevania, Street Fighter, Tetris, Mega Man.
  - **TV/séries** : X-Files, Twin Peaks, Buffy, Star Trek,
    Doctor Who, Cowboy Bebop, Stranger Things.
  - **Hardware/computing** : Commodore 64, Amiga, Game Boy,
    Walkman, floppy disk, dial-up modem, BBS, IRC.
  - **Tabletop/RPG** : D&D, Magic the Gathering, Warhammer,
    Catan, Risk.
  Modèles : `Badge` (slug, name, description, icon, theme,
  trigger), `UserBadge` (userId, badgeId, unlockedAt). Triggers
  : event-based (hook dans procs concernées) + cron pour
  conditions cumulatives. UI : page `/badges` (collection
  perso + globaux), notif on unlock, intégration profil public.

### Branding

- [x] **Feat** — ~~Logo de l'app (VHS néon `brol.`)~~ — livré
  2026-06-01. Asset fourni par le user : cassette VHS néon rose,
  fond rendu transparent via `magick -fuzz 8% -transparent white`,
  trimmé à 881×594. Master : `apps/web/public/brand/logo.png` +
  `apps/mobile/assets/brand/logo.png`. Variantes 512/256/96.
  Composant React `apps/web/src/components/logo.tsx` (`LogoMark`
  utilise `next/image`, `Wordmark` empile logo + tagline). Header
  web + `/sign-in` + `/sign-up` consomment le composant. Mobile :
  `<Image source={require('../assets/brand/logo.png')}>` dans
  sign-in + sign-up.
- [x] **Feat** — ~~Favicons + icônes app à partir du nouveau logo~~ —
  livré 2026-06-01. Web : `favicon.png` (512), `favicon-192.png`,
  `favicon-32.png`, `apple-touch-icon.png` (180) régénérés. Mobile
  Expo : `icon.png` + `adaptive-icon.png` (1024² sur fond
  `#0a0a0a`), `splash.png` (1284×2778 avec logo centré + tagline
  rendue en bas), `favicon.png` (48²). Anciens fichiers sauvegardés
  avec suffixe `.legacy.png`.
- [x] **Feat** — ~~Tagline "Beautiful Real Object Library"~~ —
  livré 2026-06-01. Web : Header (sous logo, masquée < `sm`),
  sign-in (`Wordmark showTagline`), `metadata.title` + OG +
  Twitter, `manifest.json`. Mobile : sign-in + sign-up screens,
  splash PNG, `app.json.expo.description`.

### Infra

> Finalisation S3 promue à P2 → cf. `### Infra & uploads`.

- [ ] **Feat** — Possibilité de faire une demande à la communauté pour
  emprunter un objet absent du catalogue. (Le router
  `community-request` existe déjà — il manque probablement l'UX.)
- [ ] **Bug/Feat** — Repositionner "Demander à la communauté" sur
  dashboard + matching géolocalisé. Spec figée 2026-05-30, sortie de
  "Idées" → P2 ci-dessous (`### Community requests`).
- [ ] **Feat** — Système de notifications complet [rappel retour,
  rappel retard, demande communauté, commentaire et note laissés].
- [ ] **Feat** — Tier d'utilisation pricing :
  - FREE : 5 collections / 50 objets / 10 prêts simultanés
  - T2 (3€/mois) : 10 / 500 / 50
  - T3 (20€/mois) : illimité

---

## 📊 Historique des sprints

Tenir un journal par milestone fermée pour ne pas balloner ce fichier.

- **2026-06-12 (après-midi)** — Sprint *VIDEOGAME + BGG + badges polish*.
  - **VIDEOGAME câblé UI** : typeLabel/authorLabel ("Studio / Éditeur")/
    placeholders/editionLabel ("Plateforme") fr/nl/en, champs playersMax +
    ageMin sur le form, unions TS des pickers remplacées par
    `(typeof OBJECT_TYPES)[number]`. **Bug badge** : VIDEOGAME absent du
    comptage `objectByType` → tous les badges GAMING indébloquables. Fixé.
  - **BGG** : recherche + préremplissage BOARD_GAME (cf. item P2).
    ⚠️ token requis depuis oct. 2025 → `BGG_API_TOKEN` à provisionner.
  - **Bugs trouvés au typecheck** (web `tsc --noEmit` était rouge, 0 erreur
    maintenant) :
    - `selfServiceMode` strippé par zod sur `collections.create` ET
      `objects.create` → toggle auto-prêt silencieusement ignoré à la
      création. Schemas corrigés.
    - Hooks audit sign-in/sign-out **morts** : `on: {...} as any` n'existe
      pas dans better-auth 1.x → jamais loggés. Remplacés par
      `databaseHooks.session.create.after` (sign_in) + `hooks.before` sur
      `/sign-out` (`getSessionFromCtx`).
    - `edit-object-dialog` : import `Switch` manquant (crash à l'ouverture).
    - `loans.selfBorrow` : notification owner disait toujours
      "Un utilisateur" (include `borrower` manquant).
    - Divers type-debt (Header title, keepPrevious, Prisma.Client...).
  - **Badges polish** : lien Trophy header (desktop + menu mobile), notif
    BADGE_UNLOCKED cliquable → `/badges`, BADGES.md à jour.
  - Tests : 286/286 (+5 BGG, fetch mocké).
  - **Passe sécurité + tests (soir)** : 2 failles corrigées —
    `badge.award` (tout user connecté pouvait s'attribuer n'importe quel
    badge ; procédure supprimée, `syncUser` verrouillé sur le caller) et
    `users.getById` (retournait l'email de n'importe qui par id/handle,
    bypass du flag `publicEmail` → énumération d'emails ; email masqué
    sauf self/opt-in). +43 tests : quota par tier, audit trail,
    anti-IDOR `owned-objects`, moteur badges (régression VIDEOGAME,
    idempotence), matrice complète `selfBorrow` (4 modes + rayon +
    limite hebdo), authz return/cancel, privacy getById.
    **329/329 unit tests.**
  - **Audit complet rev 5 (après-midi)** : 6 agents parallèles +
    vérification manuelle. **6 failles de plus corrigées** (XSS print
    QR ×2, spoofing notification.create, IDOR photos.reorder,
    énumération email users.search, open redirect callbackUrl) + badge
    `requests_fulfilled_by_count` global. AUDIT.md rev 5 rédigé (global
    7.0 → 7.8). 332/332 tests. Reliquat priorisé en P1 ci-dessus.
- **2026-06-12** — Découpage du working tree accumulé (~6 chantiers
  entremêlés, +5 900 lignes) en 6 commits propres :
  1. `fix(web)` — `/objects/add` sans collection : empty state + CTA,
     submit disabled, import `Switch` manquant (HEAD ne compilait pas
     depuis le commit self-service).
  2. `feat(db)` — type **VIDEOGAME** (enum + migration + OBJECT_TYPES
     partagé + router collections).
  3. `feat(badges)` — système de badges v1 (cf. section Badges).
     1 test ajusté (`badge.syncUser` ne retourne plus `stats` après
     refactor vers `syncUserBadges`). 281/281 unit tests green.
  4. `feat(web)` — quick actions dashboard en grille de cards carrées
     (item P2 marqué livré 06-08 mais jamais commité).
  5. `feat(qr)` — filtres collection + recherche sur `/qr` (idem,
     livré 06-08 mais jamais commité).
  6. `feat(mobile)` — M1 (contacts/notifications/settings + UI kit +
     superjson + stats dashboard live via `tier.getLimits`).
- **2026-06-01** — Sprint *branding + S3 + contacts + observabilité*.
  - 6 commits : `716df70` (branding), `d33a5f8` (onboarding redirect),
    `72c5216` (AddContactDialog), `c25b04d` (S3 sequential + IaC +
    logger tRPC), `344ed09` (compression client).
  - **Branding** :
    - Logo VHS néon `brol.` (asset fourni user) : trim + transparence
      → master 881×594. Variantes 512/256/96.
    - Composant `apps/web/src/components/logo.tsx` (`LogoMark` via
      `next/image`, `Wordmark` + tagline optionnelle).
    - Header + `/sign-in` + `/sign-up` (web + mobile) consomment.
    - Favicons régénérés fond blanc (lisibles onglet) : `favicon.ico`
      multi-tailles + `favicon-{32,192}.png` + `apple-touch-icon.png`.
      Next App convention : `app/icon.png` + `app/apple-icon.png`.
    - Mobile Expo : `icon.png` + `adaptive-icon.png` (1024² blanc),
      `splash.png` (1284×2778 logo + tagline rose).
    - Tagline **"Beautiful Real Object Library"** dans metadata,
      OG/Twitter, manifest, `app.json.expo.description`, sign-in/up
      web + mobile, header desktop.
  - **Onboarding location** :
    - `router.replace("/")` → `window.location.assign("/")` après
      submit CP. Hard nav force le middleware Next à relire le cookie
      `brol_loc_complete` fraîchement posé.
    - `await utils.users.me.invalidate()` après update.
    - Cookie `Secure` en HTTPS prod.
  - **Contacts** :
    - `AddContactDialog` unifié (3 onglets : Manuel / ID-Handle / QR).
      Réutilise `users.getById` (cuid OU handle) + `contacts.
      addFromScan` (idempotent). Wire dans `/contacts/page.tsx`.
    - L'édition reste sur l'ancien `ContactDialog`.
  - **S3 (Hetzner Object Storage)** :
    - **Bug critique** : `S3_ACCESS_KEY` / `S3_SECRET_KEY` vides
      dans `/opt/brol/.env` prod → `S3 non configuré`. Resolu.
    - **Bug critique** : 4 migrations Prisma jamais déployées en
      prod (cf. sprint 2026-05-31) → `users.country` absent → toute
      query auth + onboarding throw P2022. `prisma migrate deploy`
      lancé sur VPS.
    - **Bug observabilité** : `server.ts onError` était `undefined`
      en prod → erreurs tRPC muettes. Maintenant warn / error
      structurés.
    - **Bug séquencement upload** : presigned → PUT → `photos.add`
      faits en fire-and-forget dans `onSuccess` mutation → abortés
      par redirect → 0 row en DB. Refactor en séquentiel awaité
      dans `onSubmit`.
    - **IaC** : `deploy/s3/bucket-policy.json` (public-read sur
      `photos/*`, keys = UUID v4) + `cors.xml` (GET/PUT/HEAD depuis
      `app.brol.dev`) + `setup.sh` (idempotent). Anti-drift
      prod ↔ repo, doc MAINTENANCE.md.
    - **Compression** : `lib/image-compress.ts` (Canvas natif,
      resize 2000px + JPEG q=0.85). Gain ~ -90 % (3.3 MB → ~400 KB).
  - **Bugs corrigés** :
    - Onboarding `/onboarding/location` : chargement infini sur
      session stale → resolved après login frais (cause initiale
      `users.country` missing).
    - "Service indisponible" sur fetch CP → resolved par migrations
      deploy.
  - **Backlog** : 6 nouveaux items ajoutés (paiements Mollie, badges
    rétro geek, BoardGameGeek API, i18n, messaging vs notifications,
    self-service, vues bibliothèque, infra S3 promue de P3 à P2).
- **2026-05-31** — Mega-sprint *community-request + notifs + profile*.
  - 8 commits cohérents (`dd34c0c`, `33df85c`, `ae2ba9f`, `d349455`,
    + dashboard/profile/email/handle-lock).
  - **Backend** :
    - 4 nouvelles migrations Prisma (add user location, drop scratched
      PostalCode, add request_messages, profile personal info).
    - 5 nouveaux modèles/relations : User loc fields,
      `RequestMessage`, Profile perso fields + visibility toggles.
    - 2 nouveaux routers : `requestMessages` (send + list),
      `lib/geo.ts` (geocode Zippopotam + Haversine).
    - Procédures ajoutées : `users.updateLocation` /
      `previewLocation`, `communityRequest.create` étendue
      (matching radius), `communityRequest.myRequests` enrichi
      (messageCount + unreadCount), `profile.update` étendu (perso +
      visibility), `profile.get` filtre par flags publicXxx.
    - Email out-of-band via Resend sur nouveau `RequestMessage`
      (skipped si pas de clé API).
    - 37 nouveaux tests unit (245/245 total).
    - **`users.updateHandle` désactivé** : retourne `FORBIDDEN`
      ("Le pseudo est définitif…"). Préserve URLs publiques + QR.
  - **Frontend** :
    - Soft gate localisation : middleware Next + page
      `/onboarding/location` avec autocomplete debounced.
    - Dashboard : action "Demander à la communauté" + section
      "MES DEMANDES" avec badge unread.
    - Bell badge unread dans Header (polling 30s).
    - Notifications cliquables avec routing par `relatedType`.
    - Page `/requests/[id]` : header demande + thread + form envoi.
    - Settings : section "Informations personnelles" + toggles
      visibilité.
    - `/profile/[id]` : bloc public conditionnel.
    - Bouton "Modifier pseudo" retiré.
  - **Bugs corrigés** :
    - Cookie `brol_loc_complete` cross-session : purge sur visite
      `/sign-in`.
    - React Query cache stale entre users : `removeQueries` au lieu
      de `invalidateQueries` sur token change.
    - Toast "undefined voisin" : fallback défensif si matchCount
      manque (tsx watch parfois stale).
- **2026-05-30** — Sprint clôture P0 + P1.
  - **P0** :
    - Gate `/api/test/cleanup-user` + `/api/test/get-token` sur
      `NODE_ENV === "production"` → `404`
      (`packages/api/src/server.ts:182, 207`).
    - 11 → **0 E2E rouges**. A11y (`role="tab"` /loans,
      `aria-label="Marquer comme retourné"`, bouton "Modifier"
      `/contacts/[id]` + dialog inline), fix API
      `contacts.get`/`loansForContact` (filtraient pas sur
      `borrowerContactId` → historique vide pour contacts non-Brol),
      correctifs sélecteurs/typos specs. Suite full E2E :
      **193 pass / 0 fail / 6 skip**.
    - Onglet "Empruntés" sur `/objects` : branche `borrowed`
      sur `objects.all` + UI filtre + card dashboard "Empruntés"
      → `/objects?status=borrowed`.
    - Unicité handle (pseudo) : `users.checkHandleAvailability`
      + `users.updateHandle` (mapping Prisma `P2002` → `TRPCError
      CONFLICT` FR). Validation format `[a-z0-9]{3,20}` + liste
      réservés. UI settings : bouton "Modifier" + input inline
      avec feedback debouncé (400ms). Signup pas câblé (handle
      auto-généré server-side via BetterAuth hook `auth.ts:125`).
  - **P1** :
    - Tests pour `community-request` (17), `notification` (11),
      `messages` (8) — pattern caller `{ prisma, userId,
      session: { user: { id } }, headers: {} }`.
    - 2 fails collections résolus : tests attendaient un throw mais
      les procs `get`/`getPublic` renvoient `null` **intentionnellement**
      pour le fallback privé → public dans
      `apps/web/src/app/collections/[id]/page.tsx`. Tests alignés
      sur `toBeNull`.
    - CI coverage-gate : `.github/workflows/ci.yml` (job `test`)
      utilise `brol_test` + `TEST_DATABASE_URL`. `vitest.config.ts`
      exclut infra (`auth.ts`, `s3.ts`, `trpc/index.ts`, `index.ts`).
      Tests `lib/handle.test.ts` (slugifyName + generateHandle).
      Couverture finale **87 / 64 / 73 / 87** (stmts/branches/funcs/
      lines, seuils 60/50/60/60). **193 unit tests pass.**
- **2026-05-29** — Audit + P0 + P1 + P3 : 8 commits (3382fae, 2dad4c9,
  cf34b91, 1a22d72, e6de769, 10d6508, c74d921, ce ci). 18 → 11 E2E rouges.
  +35 unit tests. Logger structuré déployé. Migrations Prisma
  reconciliées. **Incident** : test setup a wipé la dev DB (DATABASE_URL
  pris au lieu de TEST_DATABASE_URL) — restauration via `migrate deploy`,
  données utilisateurs perdues. Garde-fou ajouté + script
  `db-backup.sh` livré.
- **2026-05-28** — Handle public `#piet1234` + QR profil (commits
  `a96739c`, `d2cbdd0`).
- **2026-05-20** — Déploiement initial OK (cf. MAINTENANCE §1).

Pour le détail antérieur, voir `RAPPORT.md` (1 020 lignes — à scinder
par milestone fermée à terme).
