# M009: Object Enhancement — Typage des collections par catégorie d'objet

**Vision:** Chaque collection a un type (Livre, Jeu, Outil, Film, Musique, Électronique, Autre). Le formulaire de création d'objet s'adapte aux champs de la catégorie — plus de champs inutiles, plus de pertinence.

## Slices

- [ ] **S01: Schema DB + API object types** `risk:medium` `depends:[]`
  > After this: Après S01 : une collection peut être créée avec un type, l'API valide le bon format

- [ ] **S02: Collection type selector dans create/edit** `risk:low` `depends:[S01]`
  > After this: Après S02 : quand on crée ou modifie une collection, un sélecteur de type est visible

- [ ] **S03: ObjectForm adaptatif par type** `risk:medium` `depends:[S02]`
  > After this: Après S03 : le formulaire objet affiche les champs adaptés au type de la collection cible

- [ ] **S04: E2E object type flow** `risk:medium` `depends:[S03]`
  > After this: Après S04 : Playwright cover le flow de création typée

## Boundary Map

Not provided.
