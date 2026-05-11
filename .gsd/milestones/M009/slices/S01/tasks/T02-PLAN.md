---
estimated_steps: 1
estimated_files: 1
skills_used: []
---

# T02: Ajouter champs spécifiques sur Object model

Ajouter champs optionnels: playersMin (Int?), playersMax (Int?), playingTimeMinutes (Int?), ageMin (Int?), powerWatts (Int?), customField1 (String?), customField2 (String?).

## Inputs

- `T01`

## Expected Output

- `packages/db/prisma/schema.prisma avec nouveaux champs`

## Verification

npx prisma validate
