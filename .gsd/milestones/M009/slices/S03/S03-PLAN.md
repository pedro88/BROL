# S03: S03

**Goal:** Le formulaire objet affiche/masque dynamiquement les champs selon collection.type. Champs spécifiques par type.
**Demo:** Après S03 : le formulaire objet affiche les champs adaptés au type de la collection cible

## Must-Haves

- ObjectForm : fetch collection.type
- Rendu conditionnel des champs (ISBN pour BOOK/FILM, players/time pour BOARD_GAME, etc.)
- Champs requis adaptatifs
- Validation Zod par type

## Proof Level

- This slice proves: Vérification manuelle chaque type

## Integration Closure

S04 (E2E) teste le formulaire adaptatif

## Verification

- Run the task and slice verification checks for this slice.

## Tasks

- [x] **T01: ObjectForm adaptatif par type de collection**
