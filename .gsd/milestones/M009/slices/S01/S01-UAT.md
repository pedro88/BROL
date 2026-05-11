# S01: Schema DB + API object types — UAT

**Milestone:** M009
**Written:** 2026-05-11T07:25:49.303Z

## Tests manuels S01

1. Créer une collection avec `type: "BOARD_GAME"` via API
2. Créer un objet sans passer `objectType` → router default à la valeur de `collection.type`
3. Créer un objet en passant explicitement `objectType: "FILM"` → livre avec isbn
4. Vérifier que la DB a les nouveaux champs
