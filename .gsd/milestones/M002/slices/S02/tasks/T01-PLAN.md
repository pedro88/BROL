---
estimated_steps: 1
estimated_files: 1
skills_used: []
---

# T01: Ajouter isPublic au modèle Prisma

Ajouter champ isPublic Bool @default(false) au modèle Collection et migrer la DB

## Inputs

- None specified.

## Expected Output

- `packages/db/prisma/schema.prisma`

## Verification

grep isPublic packages/db/prisma/schema.prisma
