# S03: Dropdown recherche dans le dialog de prêt — UAT

**Milestone:** M012
**Written:** 2026-05-12T09:21:44.400Z

## UAT — S03 Dropdown recherche dans le dialog de prêt

### Pré-conditions
- Être connecté sur http://localhost:3000

### T01: API search sur contacts.list
1. L'API contacts.list accepte maintenant `search?: string`
2. Le filtre fonctionne sur name ET email (insensitive)

### T02: Combobox dans CreateLoanDialog
1. Ouvrir le dialog de prêt (depuis /loans → +)
2. **Vérifier** qu'un champ de recherche "Rechercher un contact..." est visible
3. Taper un nom → **Vérifier** que la liste se filtre en temps réel
4. Cliquer sur un contact → **Vérifier** qu'il s'affiche dans un encadré avec bouton X
5. Cliquer X → **Vérifier** que le contact est désélectionné
6. Si aucun contact ne correspond à la recherche → **Vérifier** qu'une option "Créer X" apparaît
7. **Vérifier** que "Ajouter un contact" fonctionne encore

### Critères de succès
- [ ] Le champ de recherche est visible et fonctionnel
- [ ] La liste se filtre quand on tape
- [ ] Le contact sélectionné est affiché dans un encadré
- [ ] On peut désélectionner le contact
- [ ] L'option "Créer X" apparaît si recherche ne correspond à aucun contact
