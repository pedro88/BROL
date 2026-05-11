# S01: Schema DB + API object types

**Goal:** Ajouter ObjectType enum, champ type sur Collection, champ objectType + champs spécifiques sur Object, mettre à jour les routers tRPC et la validation Zod
**Demo:** Après S01 : une collection peut être créée avec un type, l'API valide le bon format

## Must-Haves

- Collection.create accepte type ∈ {BOOK, BOARD_GAME, TOOL, FILM, MUSIC, ELECTRONIC, ELECTRIC, CLOTHING, CUSTOM}\nObject.create/get/update utilise objectType + champs conditionnels\nZod schema adapte les champs requis au objectType"

## Proof Level

- This slice proves: Tests unitaires routers"

## Integration Closure

S02 (create/edit collection) et S03 (object form) utilisent ce schema"

## Verification

- N/A"

## Tasks

- [ ] **T01: Définir ObjectType enum dans schema Prisma** `est:1h`
  Créer enum ObjectType: BOOK, BOARD_GAME, TOOL, FILM, MUSIC, ELECTRONIC, ELECTRIC, CLOTHING, CUSTOM.
  Ajouter champ objectType sur Object (optionnel, défaut null).
  Ajouter champ type sur Collection.
  Pour CUSTOM: ajouter customField1Label, customField2Label sur Collection.
  - Files: `packages/db/prisma/schema.prisma`, `packages/shared/src/schemas/index.ts`
  - Verify: npx prisma validate

- [ ] **T02: Ajouter champs spécifiques sur Object model** `est:1h`
  Ajouter champs optionnels: playersMin (Int?), playersMax (Int?), playingTimeMinutes (Int?), ageMin (Int?), powerWatts (Int?), customField1 (String?), customField2 (String?).
  - Files: `packages/db/prisma/schema.prisma`
  - Verify: npx prisma validate

- [ ] **T03: Mettre à jour Zod schemas dans shared** `est:1h`
  Créer un ObjectTypeSchema avec les bons champs par type.
  Union de 9 schemas (un par ObjectType).
  CreateObjectInput + UpdateObjectInput incluent objectType et champs conditionnels.
  - Files: `packages/shared/src/schemas/index.ts`, `packages/shared/src/types/index.ts`
  - Verify: tsc --noEmit dans packages/shared

- [ ] **T04: Mettre à jour tRPC routers** `est:1h`
  Modifier objects.create/get/update pour accepter objectType + champs spécifiques.
  Modifier collections.create/get/update pour accepter type + customFieldLabels.
  Valider avec Zod.
  - Files: `packages/api/src/routers/objects.ts`, `packages/api/src/routers/collections.ts`
  - Verify: npx vitest run packages/api/src/routers/__tests__/objects.test.ts

- [ ] **T05: Générer migration Prisma** `est:30min`
  Générer et apply la migration Prisma avec les nouveaux champs.
  Tester que la DB est en place.
  - Files: `packages/db/prisma/migrations/`
  - Verify: npx prisma migrate dev --name add_object_types

## Files Likely Touched

- packages/db/prisma/schema.prisma
- packages/shared/src/schemas/index.ts
- packages/shared/src/types/index.ts
- packages/api/src/routers/objects.ts
- packages/api/src/routers/collections.ts
- packages/db/prisma/migrations/
