# S04: Tests unitaires et E2E

**Goal:** Couverture complète de la feature QR par des tests automatisés : unitaires côté API et E2E côté browser.

**Milestone:** M006

**Slice Definition of Done**
- [ ] Les routes qr.listStock, qr.generateStock, qr.deleteStock, qr.assignToObject, qr.getByCode sont couvertes par des tests unitaires (Vitest)
- [ ] Le test e2e qr.spec.ts couvre le flow complet : générer → assigner → afficher → download
- [ ] Tous les tests passent (`pnpm test` unitaires + `pnpm test:e2e`)

## Tasks

- [ ] **T01: Tests unitaires API (Vitest)**
  `est:2h`
  Lire les tests existants dans packages/api/src/routers/__tests__/qr.test.ts. Ajouter des tests pour les cas manquants: generateStock (count=1, count>1, count max), deleteStock (code utilisé → erreur), assignToObject (objet déjà taggué → erreur, double assign → conflit). Tous les tests tournent avec DATABASE_URL from .env.

- [ ] **T02: Tests E2E Playwright (qr.spec.ts)**
  `est:3h`
  Créer apps/web/e2e/qr.spec.ts. Scénarios: 1) générer 3 QR codes et vérifier qu'ils apparaissent dans la liste ; 2) supprimer un code et vérifier qu'il disparait ; 3) assigner un QR à un objet et vérifier qu'il apparait sur la page détail ; 4) vérifier que le QR s'affiche visuellement ; 5) vérifier le download PNG. Utiliser helpers/auth.ts pour l'auth. Suivre le pattern des tests existants (helpers/page.ts).
