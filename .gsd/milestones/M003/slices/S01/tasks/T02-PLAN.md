---
estimated_steps: 1
estimated_files: 1
skills_used: []
---

# T02: Push nouveau schema en base

npx prisma db push pour appliquer le nouveau schema en base. Vérifier que la table accounts est bien créée.

## Inputs

- `schema.prisma`

## Expected Output

- `DB migration applied`

## Verification

psql \d accounts ou équivalent
