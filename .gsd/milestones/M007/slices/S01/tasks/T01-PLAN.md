---
estimated_steps: 5
estimated_files: 1
skills_used: []
---

# T01: Add Contact.loans relation in Prisma schema

Modifier le schema Prisma :
1. Ajouter `loans Loan[]` sur le model Contact
2. Générer la migration SQL
3. Appliquer `prisma migrate dev`
4. Vérifier que le champ est bien en base

## Inputs

- `packages/db/prisma/schema.prisma`

## Expected Output

- `Migration SQL appliquée`
- `Prisma client regénéré`

## Verification

npx prisma migrate status && npx prisma db pull (dry-run)

## Observability Impact

Migration errors logged
