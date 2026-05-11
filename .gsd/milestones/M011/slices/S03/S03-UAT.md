# S03: Intégration photos sur objets — UAT

**Milestone:** M011
**Written:** 2026-05-11T14:38:08.591Z

## UAT: Intégration photos sur objets (S03)

### Tests manuels

**1. Photos dans la liste des objets (collection)**
- [ ] Ouvrir une collection
- [ ] Vérifier que les objets avec photos ont une image dans la carte
- [ ] Si les photos ne sont pas affichées dans les cartes objet (TBD), vérifier via la page détail

**2. Photos dans la page détail objet**
- [ ] Ouvrir la page d'un objet avec des photos
- [ ] Vérifier que les photos s'affichent en grille (3 colonnes)
- [ ] Vérifier que le bouton "Ajouter une photo" est visible
- [ ] Ajouter une photo (fichier, caméra, ou recherche)
- [ ] Supprimer une photo (clic → confirmation → supprimé)

**3. Flux création → photos**
- [ ] Créer un nouvel objet
- [ ] Vérifier la redirection vers la page détail
- [ ] Ajouter des photos depuis la page détail

### Vérification API
```bash
# objects.get inclut photos
curl "http://localhost:3001/trpc/objects.get?input=%7B%22id%22%3A%22<cuid>%22%7D" \
  -H "Authorization: Bearer <token>"

# objects.list inclut photos
curl "http://localhost:3001/trpc/objects.list?input=%7B%22collectionId%22%3A%22<cuid>%22%7D" \
  -H "Authorization: Bearer <token>"
```
