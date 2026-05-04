---
id: T01
parent: S02
milestone: M002
key_files:
  - packages/db/prisma/schema.prisma
key_decisions:
  - Choisir @default(false) pour isPublic : les collections sont privées par défaut, conforme au principe de moindre privilège.
duration: 
verification_result: passed
completed_at: 2026-05-04T07:07:56.799Z
blocker_discovered: false
---

# T01: Champ isPublic ajouté au modèle Collection Prisma

**Champ isPublic ajouté au modèle Collection Prisma**

## What Happened

Ajout du champ `isPublic Boolean @default(false)` au modèle `Collection` dans `packages/db/prisma/schema.prisma`. Index également ajouté sur `isPublic` pour optimiser les futures requêtes de collections publiques. Aucune migration n'a été exécutée — c'était un ajout de schéma pur.

## Verification

grep isPublic packages/db/prisma/schema.prisma → trouve le champ ligne 98 et l'index ligne 99

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `grep -n isPublic packages/db/prisma/schema.prisma` | 0 | ✅ pass | 0ms |

## Deviations

None.

## Known Issues

La migration DB n'a pas été générée ni appliquée. Il faudra faire `npx prisma migrate dev` ou `npx prisma db push` pour que le champ soit effectif en base.

## Files Created/Modified

- `packages/db/prisma/schema.prisma`
