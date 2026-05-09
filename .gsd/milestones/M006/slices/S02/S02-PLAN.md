# S02: Assignation QR → Objet

**Goal:** Permettre d'assigner un QR de stock à un objet existant, ou de sélectionner un QR lors de la création d'un nouvel objet.

**Milestone:** M006

**Slice Definition of Done**
- [ ] Dialog sur `/objects/[id]` liste les QR disponibles (non utilisés)
- [ ] Assignation met à jour `object.qrStockId` et `qrStock.used=true` en transaction
- [ ] Page détail objet affiche le QR après assignation
- [ ] Le formulaire `/objects/add` propose un select des QR disponibles + option 'créer nouveau'
- [ ] Un objet déjà taggué ne peut pas recevoir un second QR (erreur visible)
- [ ] `utils.objects.get` est invalidé après assignation

## Tasks

- [ ] **T01: Dialog assignation QR sur page objet**
  `est:2h`
  Créer `components/qr/assign-qr-dialog.tsx`. Dialogenabled depuis un bouton "Assigner un QR" sur la page détail objet. Liste les QR disponibles (non utilisés). Appelle qr.assignToObject. Affiche les erreurs (objet déjà taggué, code non disponible).

- [ ] **T02: Intégration dialog sur /objects/[id]**
  `est:1h`
  Ajouter un bouton "Assigner un QR" sur la page détail objet (si pas de qrStockId). Ouvrir le dialog. Aprè assignation, invalidate objects.get et refresh la page.

- [ ] **T03: Select QR dans le formulaire /objects/add**
  `est:2h`
  Dans ObjectForm, si collectionId défini, fetcher trpc.qr.listStock avec { used: false }. Ajouter un select avec option "Aucun QR" + option "Créer un nouveau QR" + liste des QR disponibles. Appeler generateStock si "Créer un nouveau" sélectionné, puis assignToObject après création de l'objet.
