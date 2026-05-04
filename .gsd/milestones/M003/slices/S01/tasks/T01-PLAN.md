---
estimated_steps: 1
estimated_files: 1
skills_used: []
---

# T01: Corriger schema Account pour matcher BetterAuth

Migrer le schema Account : renommer providerAccountId → accountId, provider → providerId, retirer type (inutile), renommer les autres champs snake_case → camelCase.

## Inputs

- `M003-ROADMAP.md`

## Expected Output

- `packages/db/prisma/schema.prisma`

## Verification

npx prisma validate && npx prisma generate
