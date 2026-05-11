---
estimated_steps: 4
estimated_files: 2
skills_used: []
---

# T01: Définir ObjectType enum dans schema Prisma

Créer enum ObjectType: BOOK, BOARD_GAME, TOOL, FILM, MUSIC, ELECTRONIC, ELECTRIC, CLOTHING, CUSTOM.
Ajouter champ objectType sur Object (optionnel, défaut null).
Ajouter champ type sur Collection.
Pour CUSTOM: ajouter customField1Label, customField2Label sur Collection.

## Inputs

- None specified.

## Expected Output

- `packages/db/prisma/schema.prisma mis à jour`
- `packages/shared/src/schemas/index.ts mis à jour`

## Verification

npx prisma validate
