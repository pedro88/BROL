# S01: Stock QR — génération, liste, suppression

**Goal:** Interface de gestion du stock de QR codes : générer un batch, lister avec filtres (utilisé/libre), supprimer un code non utilisé.

**Milestone:** M006

**Slice Definition of Done**
- [ ] GET /api/trpc/qr.listStock retourne les codes avec pagination
- [ ] POST /api/trpc/qr.generateStock crée N codes en DB
- [ ] DELETE /api/trpc/qr.deleteStock supprime un code non utilisé
- [ ] Page `/qr` affiche la liste, le formulaire de génération, et les boutons delete
- [ ] Les codes générés apparaissent immédiatement dans la liste
- [ ] Un code utilisé ne peut pas être supprimé (erreur visible)

## Tasks

- [ ] **T01: Page /qr — structure et layout**
  `est:1h`
  Créer la page /qr avec le layout VHS (Header, Navigation, card-vhs). Structure: titre, formulaire de génération (input count), zone de liste des QR codes.

- [ ] **T02: Appel tRPC listStock + affichage liste**
  `est:1h`
  Appeler trpc.qr.listStock.useQuery. Afficher chaque code dans une card avec: code (mono), badge utilisé/libre, date création. Ajouter skeleton loading state.

- [ ] **T03: Génération de batch via generateStock**
  `est:1h`
  Formulaire avec input number (1-100, default 10). Appeler trpc.qr.generateStock.useMutation avec le count. Invalider listStock après succès.

- [ ] **T04: Suppression de QR via deleteStock**
  `est:1h`
  Bouton trash sur chaque card QR. Appeler trpc.qr.deleteStock.useMutation. Confirmer avant suppression (confirm()). Invalider listStock après succès. Afficher l'erreur si le code est déjà utilisé.
