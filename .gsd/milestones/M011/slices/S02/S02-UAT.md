# S02: Composant capture/upload photo — UAT

**Milestone:** M011
**Written:** 2026-05-11T14:36:25.743Z

## UAT: PhotoCapture et PhotoGallery (S02)

### Tests manuels

**1. Ajout de photo par fichier**
- [ ] Ouvrir la page d'un objet
- [ ] Cliquer "Ajouter une photo"
- [ ] Onglet "Fichier" → sélectionner une image
- [ ] Vérifier que la preview s'affiche
- [ ] Confirmer → vérifier que l'upload se fait (loader)
- [ ] Vérifier que la photo apparaît dans la grille

**2. Ajout de photo par caméra (mobile)**
- [ ] Sur mobile, ouvrir la page d'un objet
- [ ] Cliquer "Ajouter une photo"
- [ ] Onglet "Caméra" → ouvrir la caméra
- [ ] Prendre une photo
- [ ] Confirmer → vérifier que l'upload se fait
- [ ] Vérifier que la photo apparaît dans la grille

**3. Recherche DuckDuckGo Images**
- [ ] Cliquer "Ajouter une photo"
- [ ] Onglet "Rechercher"
- [ ] Taper un nom (ex: "Le Petit Prince")
- [ ] Vérifier que des résultats s'affichent
- [ ] Cliquer sur une image → preview proxée DDG
- [ ] Confirmer → l'image est ajoutée à la grille

**4. Suppression de photo**
- [ ] Sur une photo dans la grille, survoler avec la souris
- [ ] Cliquer sur l'icône poubelle
- [ ] Cliquer à nouveau pour confirmer
- [ ] Vérifier que la photo disparaît de la grille

### Vérification TypeScript
```bash
cd apps/web && pnpm exec tsc --noEmit 2>&1 | grep -E "photo|duckduckgo"
# Doit être vide (aucune erreur)
```
