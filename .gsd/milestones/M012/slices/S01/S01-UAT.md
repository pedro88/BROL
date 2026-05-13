# S01: Dashboard cliquable + pages列表 — UAT

**Milestone:** M012
**Written:** 2026-05-12T08:51:42.607Z

## UAT — S01 Dashboard cliquable + pages列表

### Pré-conditions
- Être connecté sur http://localhost:3000
- Avoir au moins une collection, un contact, et ideally un prêt en cours

### T01: StatCards cliquables
1. Observer les 3 StatCards (Objets, Prétés, Contacts)
2. **Vérifier** que chaque StatCard est cliquable (cursor pointer, hover effect)
3. Cliquer sur "Objets" → URLs → doit afficher /objects
4. Cliquer sur "Prétés" → URL doit contenir /loans?tab=lent
5. Cliquer sur "Contacts" → /contacts

### T02: Page /objects avec tableau filtrable
1. Sur /objects, **Vérifier** qu'un tableau ou liste d'objets s'affiche
2. **Vérifier** qu'un filtre par collection est présent
3. **Vérifier** qu'un filtre par status (Tous/Disponible/Prêté) est présent
4. **Vérifier** que la recherche fonctionne
5. **Vérifier** que les filtres sont dans l'URL (?collectionId=X&status=Y)
6. Cliquer sur un objet → /objects/[id] → détail de l'objet

### T03: Liens StatCards
- Objets → /objects ✅
- Prétés → /loans?tab=lent ✅
- Contacts → /contacts ✅

### T04: Scanner masqué sur desktop
1. Sur desktop, **Vérifier** que le QuickAction "SCANNER" n'apparaît PAS
2. Sur mobile (si testable), **Vérifier** que "SCANNER" apparaît

### T05: Section Prêts récents
1. **Vérifier** que le titre est "// PRÊTS RÉCENTS"
2. **Vérifier** que chaque card affiche : nom objet + nom emprunteur + date retour
3. **Vérifier** que chaque card est cliquable → /objects/[id]

### Critères de succès
- [ ] Toutes les StatCards mènent aux bonnes pages
- [ ] /objects affiche la liste complète des objets
- [ ] Les filtres sur /objects sont fonctionnels
- [ ] Le Scanner n'apparaît que sur mobile
- [ ] La section "PRÊTS RÉCENTS" est correctement labelisée et ses cards cliquables

