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

**0 item ouvert.** Sprint 2026-05-30 a tout clos (cf. Historique).

---

## 🟠 P1 — Hygiène en cours

**0 item ouvert.** Sprint 2026-05-30 a tout clos (cf. Historique).

---

## 🟡 P2 — Produit / mobile

### Dashboard

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

### Flux UX d'ajout d'objet

- [ ] **Feat** — Permettre l'upload de photo dès la **création** (pas
  uniquement à l'édit). Toucher `apps/web/src/components/objects/object-form.tsx`.
- [ ] **Feat** — Mobile : scanner QR pour assigner à l'objet créé.
  Composant `apps/mobile/src/components/qr-scanner.tsx` + écran
  `objects/add.tsx`.
- [ ] **Bug** — Après création, ne PAS rediriger sur la modal d'édit.
- [ ] **Feat** — Modal d'édit objet adaptée au type (afficher les champs
  CLOTHING / TOOL spécifiques).

### Loans / contacts

- [x] **Feat** — ~~Modal de prêt : dropdown contacts avec recherche~~ —
  vérifié 2026-05-30. Les 2 flux d'entrée (`/loans` NOUVEAU PRÊT +
  `/objects/[id]` "Prêter") passent déjà par `CreateLoanDialog` →
  `BorrowerSelectDialog` qui a une recherche live sur contacts +
  utilisateurs Brol (`borrower-select-dialog.tsx:183-277`). Aucun
  flux divergent à harmoniser.
- [x] **Feat** — ~~Créer contact depuis modal de prêt + cohérence
  champs~~ — livré 2026-05-30. Onglet "Nouveau" du
  `BorrowerSelectDialog` accepte maintenant aussi le champ `note`
  (manquait par rapport au `ContactDialog` standalone). Parité
  Nom/Email/Téléphone/Note avec `/contacts`.

### Parité mobile

Web a 19 pages, mobile a 12 écrans. Écrans à porter :

- [ ] **Feat mobile** — `/contacts` (liste contacts).
- [ ] **Feat mobile** — `/contacts/[id]` (détail contact).
- [ ] **Feat mobile** — `/notifications` (liste notifs).
- [ ] **Feat mobile** — `/settings` (handle + QR + tier).
- [ ] **Feat mobile** — `/profile/[handle]` (profil public d'un user).
- [ ] **Feat mobile** — `/qr/[code]` (scan QR public).
- [ ] **Feat mobile** — `/requests` (demandes communauté).

### Sécurité applicative

- [ ] **Tech** — Rate limiting sur les routes auth (`sign-in`,
  `sign-up`, `reset-password`). Middleware tRPC ou nginx.
- [ ] **Tech** — Quota enforcement par tier (FREE/T2/T3). Actuellement
  `packages/api/src/routers/tier.ts` lit les limites mais ne bloque
  pas. Ajouter une middleware procedure qui throw `FORBIDDEN` si quota
  dépassé.
- [ ] **Tech** — Audit trail sur actions sensibles (sign-in/out, delete
  account, password change). Table `AuditLog` simple.
- [x] **Tech** — ~~Backup Postgres automatique~~ — `scripts/db-backup.sh`
  livré 2026-05-29. À déployer sur VPS via crontab (cf. MAINTENANCE §3).

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

- [ ] **Feat** — Possibilité de faire une demande à la communauté pour
  emprunter un objet absent du catalogue. (Le router
  `community-request` existe déjà — il manque probablement l'UX.)
- [ ] **Feat** — Système de notifications complet [rappel retour,
  rappel retard, demande communauté, commentaire et note laissés].
- [ ] **Feat** — Tier d'utilisation pricing :
  - FREE : 5 collections / 50 objets / 10 prêts simultanés
  - T2 (3€/mois) : 10 / 500 / 50
  - T3 (20€/mois) : illimité

---

## 📊 Historique des sprints

Tenir un journal par milestone fermée pour ne pas balloner ce fichier.

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
