---
estimated_steps: 1
estimated_files: 1
skills_used: []
---

# T01: Ajouter Photo au schéma Prisma

Ajouter le modèle Photo dans Prisma avec les champs : id, objectId (FK), url, position, createdAt. Le champ url stockera l'URL publique complète du fichier sur S3.

## Inputs

- `packages/db/prisma/schema.prisma`

## Expected Output

- `packages/db/prisma/schema.prisma mis à jour avec modèle Photo`
- `Migration Prisma créée et appliquée`

## Verification

npx prisma migrate dev --name add_photos && npx prisma db push
