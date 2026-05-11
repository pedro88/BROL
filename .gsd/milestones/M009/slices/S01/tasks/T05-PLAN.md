---
estimated_steps: 2
estimated_files: 1
skills_used: []
---

# T05: Générer migration Prisma

Générer et apply la migration Prisma avec les nouveaux champs.
Tester que la DB est en place.

## Inputs

- `T01`
- `T02`

## Expected Output

- `Migration Prisma créée et appliquée`

## Verification

npx prisma migrate dev --name add_object_types
