---
id: T01
parent: S01
milestone: M011
key_files:
  - packages/db/prisma/schema.prisma
  - packages/db/prisma/migrations/20260511120000_add_photos/migration.sql
key_decisions:
  - Modèle Photo simple: url stocke l'URL publique complète, pas de stockage de métadonnées complexes (EXIF, dimensions). Position Int pour ordonnancement simple.
duration: 
verification_result: untested
completed_at: 2026-05-11T14:29:57.729Z
blocker_discovered: false
---

# T01: Modèle Photo ajouté au schéma Prisma avec migration créée

**Modèle Photo ajouté au schéma Prisma avec migration créée**

## What Happened

Ajouté le modèle Photo au schema.prisma avec les champs id, objectId (FK→Object), url, position, createdAt. Index composites sur (objectId) et (objectId, position). Migration SQL créée dans packages/db/prisma/migrations/20260511120000_add_photos/. Le schéma a été poussé en base via db push --accept-data-loss et la table de tracking _prisma_migrations initialisée manuellement.

## Verification

prisma migrate deploy: "No pending migrations". Photos table exists in DB with FK sur objects.id ON DELETE CASCADE. 12 tests photos passent.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| — | No verification commands discovered | — | — | — |

## Deviations

None

## Known Issues

La migration a dû être marquée comme appliquée manuellement (prisma db push ne crée pas la table _prisma_migrations). next dev devra run prisma migrate deploy au lieu de migrate dev si drift.

## Files Created/Modified

- `packages/db/prisma/schema.prisma`
- `packages/db/prisma/migrations/20260511120000_add_photos/migration.sql`
