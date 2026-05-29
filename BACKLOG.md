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

## 🔥 P0 — Restants après l'audit du 2026-05-29

Items P0 résolus dans les commits `3382fae`, `2dad4c9`. Ce qui reste de
réellement bloquant :

- [ ] **Bug** — `api/test/cleanup-user` + `api/test/get-token` ne sont pas
  gatés par `NODE_ENV !== "production"`. Risque expo en prod. Gater le
  bloc dans `packages/api/src/server.ts` lignes 179 et 200.
  *Source : AUDIT §5 / ARCHITECTURE §7.*
- [ ] **Bug** — 11 tests E2E rouges chroniques restants (contacts ×5,
  loans ×4, profile ×1, requests ×1). Triage par fichier. Cf. `test-results/`.

---

## 🟠 P1 — Hygiène en cours

Items P1 résolus dans `e6de769`. Ce qui reste :

- [ ] **Tech** — Tester les 3 derniers routers : `community-request`,
  `messages`, `notification`. Pattern : voir
  `packages/api/src/routers/__tests__/users.test.ts` pour le setup tRPC
  caller.
- [ ] **Tech** — 2 tests collections rouges (`get UNAUTHORIZED for other`,
  `getPublic throws for private`). Pré-existants, à investiguer.
- [ ] **Tech** — CI : ajouter un job `coverage-gate` qui fail si
  `pnpm test:coverage` exit ≠ 0 (les seuils 60/50/60/60 sont déjà
  configurés dans `vitest.config.ts`).

---

## 🟡 P2 — Produit / mobile

### Dashboard

- [ ] **Feat** — Card "Objets" : déjà liée à `/objects`. Vérifier que
  `/objects` propose un tableau filtrable [nom, collection, état,
  statut].
- [ ] **Feat** — Card "Prêtés" : pointe sur `/loans?tab=lent`. OK.
  Ajouter `?status=overdue` dans l'URL si `activeLoans > 0` et en retard.
- [ ] **Feat** — Section "Prêts récents" — déjà renommée et câblée
  (cf. `apps/web/src/app/page.tsx:117-171`). Vérifier que la date de
  retour s'affiche bien et que le lien renvoie vers `/objects/{id}`.

### Création d'objet — par type

Schema actuel : pas de fields par type. Ajouter dans
`packages/db/prisma/schema.prisma` modèle `Object` :

- [ ] **Feat** — Type CLOTHING : champs `size`, `gender`, `color`,
  `material`, `brand`.
- [ ] **Feat** — Type TOOL : renommer le tag vers "Outils" + champs
  `powerSource` (`MANUAL` / `MAINS` / `BATTERY`), `brand`.
- [ ] **Feat** — Tout type : champ `deposit` (caution, decimal) +
  `rentalPriceDay`, `rentalPriceHour`, `rentalPriceWeek` (decimal,
  optionnels).

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

- [ ] **Feat** — Modal de prêt : dropdown contacts avec recherche
  (au lieu de borrower-select-dialog actuel sur certains flows).
- [ ] **Feat** — Modal de prêt : créer un contact directement depuis le
  formulaire (déjà partiel : onglet "Nouveau" dans BorrowerSelectDialog
  — vérifier la cohérence sur tous les flows).

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
