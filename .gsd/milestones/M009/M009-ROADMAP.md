# M009: Object Enhancement — Typage des collections par catégorie d'objet

**Vision:** Chaque collection a un type (Livre, Jeu, Outil, Film, Musique, Électronique, Autre). Le formulaire de création d'objet s'adapte aux champs de la catégorie — plus de champs inutiles, plus de pertinence.

## Slices

- [x] **S01: S01** `risk:medium` `depends:[]`
  > After this: Après S01 : une collection peut être créée avec un type, l'API valide le bon format

- [x] **S02: S02** `risk:low` `depends:[]`
  > After this: Après S02 : quand on crée ou modifie une collection, un sélecteur de type est visible

- [x] **S03: S03** `risk:medium` `depends:[]`
  > After this: Après S03 : le formulaire objet affiche les champs adaptés au type de la collection cible

- [x] **S04: S04** `risk:medium` `depends:[]`
  > After this: Après S04 : Playwright cover le flow de création typée

## Boundary Map

Not provided.
