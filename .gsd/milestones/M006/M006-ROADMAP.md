# M006: QR Codes — stock, assignation et affichage

**Vision:** L'utilisateur génère un stock de QR codes vierges, les assigne à ses objets physiques, et peut ensuite imprimer ou télécharger chaque QR pour l'appliquer sur l'objet. La boucle est complète : scan → identification → prêt.

## Success Criteria

- L'utilisateur peut générer un batch de QR codes et les voir dans une liste
- L'utilisateur peut assigner un QR de stock à un objet existant
- Le formulaire de création d'objet permet de sélectionner ou créer un QR
- L'objet tagué affiche son QR visuellement avec download PNG et impression
- Export batch ZIP des QR PNG depuis la page de gestion

## Key Risks / Unknowns

- Intégration de la lib `qrcode` (déjà présente en deps) côté client — vérifier compatibilité React 19
- Gestion de l'état de mutation (loading, error) sur les dialogs sans flash de spinner
- L'assignation QR → objet nécessite une transaction DB (2 updates) — s'assurer que la race condition est impossible

## Proof Strategy

- QR codes fourmillent → retire le risque "la lib qrcode ne fonctionne pas en browser"
- Assignation complète → retire le risque "le dialog n'est pas bien intégré au flow"
- PNG download → retire le risque "l'image générée n'est pas valide"

## Verification Classes

- Contract verification: tests unitaires dans packages/api/src/routers/__tests__/qr.test.ts + nouveaux tests pour generateStock, deleteStock, assignToObject
- Integration verification: chaîne tRPC qr.listStock → generateStock → deleteStock → assignToObject → objects.get exercée par E2E
- Operational verification: N/A — pas de daemon ni de tâches planifiées
- UAT / human verification: Ouvrir /qr, générer 5 codes, supprimer un code, aller sur un objet, assigner un QR, télécharger le PNG

## Milestone Definition of Done

- [ ] Les 3 slices sont complètes et leurs critères respectifs sont remplis
- [ ] Les tests unitaires existants passent (qr.test.ts) + nouveaux tests pour S01-S03
- [ ] Les tests E2E Playwright passent (qr.spec.ts)
- [ ] Le flow QR complet est testable en browser (pas de mock)
- [ ] Les critères de succès sont re-vérifiés en conditions réelles

## Requirement Coverage

- R### QR stock management: couvert par S01
- R### QR assignment: couvert par S02
- R### QR display/download: couvert par S03

## Slices

- [ ] **S01: Stock QR — génération, liste, suppression** `risk:medium` `depends:[]`
  > After this: L'utilisateur peut générer N codes vierges, voir la liste avec leur statut (utilisé/libre), et supprimer un code non assigné.

- [ ] **S02: Assignation QR → Objet** `risk:medium` `depends:[S01]`
  > After this: Depuis la page d'un objet, on peut assigner un QR disponible. Le formulaire de création d'objet propose aussi de sélectionner ou créer un QR.

- [ ] **S03: Affichage et download QR** `risk:low` `depends:[S02]`
  > After this: Le QR code est affiché visuellement sur la page objet avec bouton Télécharger (PNG) et Imprimer. Export batch ZIP depuis /qr.

- [ ] **S04: Tests unitaires et E2E** `risk:medium` `depends:[S03]`
  > After this: Les routes QR sont couvertes par des tests unitaires. Le flow complet (générer → assigner → afficher → download) est couvert par des tests E2E Playwright.

## Boundary Map

### S01 → S02

Produces:
- `qr.listStock`: retourne la liste des QR `{ items: QrStock[], nextCursor }`
- `qr.generateStock`: crée N codes et les retourne
- `qr.deleteStock`: supprime un code non utilisé

Consumes:
- rien (première slice)

### S01 → S03

Produces:
- `qr.listStock`: même API que S01

Consumes:
- rien (première slice)

### S02 → S03

Produces:
- `object.qrStock`: retourne le QR assigné à l'objet `{ id, code, used, usedAt }`
- `qr.assignToObject`: lie un code à un objet

Consumes:
- `qr.listStock` (pour lister les QR disponibles dans le dialog)
- `object.qrStock` (pour vérifier si l'objet a déjà un QR)
