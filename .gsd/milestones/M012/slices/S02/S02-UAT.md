# S02: Photo dans formulaire objet + bouton prêt sur page prêts — UAT

**Milestone:** M012
**Written:** 2026-05-12T09:05:18.098Z

## UAT — S02 Photo dans formulaire objet + bouton prêt sur page prêts

### Pré-conditions
- Être connecté sur http://localhost:3000

### T01: Photo dans formulaire objet
1. Aller sur /objects/add
2. **Vérifier** qu'un champ "URL de couverture" est visible entre Notes et QR Code
3. Remplir le formulaire et soumettre
4. **Vérifier** redirection vers /objects/[id]/edit (pas /collections/[id])
5. Sur /objects/[id]/edit, **Vérifier** que PhotoCapture est affiché
6. Si l'objet a des photos, **Vérifier** qu'elles s'affichent en galerie

### T02: Bouton + sur /loans
1. Aller sur /loans
2. **Vérifier** qu'un bouton "+ NOUVEAU PRÊT" est visible dans le header
3. Cliquer sur le bouton → ObjectPickerDialog s'ouvre
4. **Vérifier** que la recherche d'objets fonctionne
5. **Vérifier** que seuls les objets disponibles (non prêtés) sont listés
6. Cliquer sur un objet → CreateLoanDialog s'ouvre avec le bon objet

### Critères de succès
- [ ] /objects/add a un champ URL de couverture
- [ ] La création redirige vers /objects/[id]/edit
- [ ] /objects/[id]/edit affiche PhotoCapture
- [ ] /loans affiche le bouton "+ NOUVEAU PRÊT"
- [ ] Le flow objet → dialog fonctionne complètement

