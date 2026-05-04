---
estimated_steps: 1
estimated_files: 1
skills_used: []
---

# T01: Fix auth.ts: sessionToken → token, expires → expiresAt

Le code getSession() utilise sessionToken et expires. Le schéma Prisma utilise token et expiresAt. Fixer ces 2 bugs + ajouter include: { user: true } manquant.

## Inputs

- `packages/db/prisma/schema.prisma (Session model fields: token, expiresAt)`

## Expected Output

- `packages/api/src/auth.ts`

## Verification

grep token packages/api/src/auth.ts | grep -v sessionToken && grep expiresAt packages/api/src/auth.ts
