---
estimated_steps: 1
estimated_files: 1
skills_used: []
---

# T01: Seed BadgeDefinition dans la DB

Créer le seed script pour les 7 BadgeDefinition par défaut (first-loan, lender-5, lender-25, collector-10, collector-50, reviewer, five-stars) dans la DB

## Inputs

- None specified.

## Expected Output

- `packages/db/prisma/seed.ts mis à jour`

## Verification

pnpm db:seed && query badge_definitions table
