---
id: S01
parent: M011
milestone: M011
provides:
  - packages/api/src/lib/s3.ts - client S3 prêt à l'emploi
  - packages/api/src/routers/photos.ts - router tRPC avec procedures add/remove/list/reorder/getPresignedUrl
  - packages/shared/src/schemas/index.ts - schemas Zod photoAddSchema, photoRemoveSchema, etc.
  - packages/shared/src/types/index.ts - types Photo, PresignedUpload pour le client
requires:
  []
affects:
  []
key_files:
  - packages/api/src/lib/s3.ts
  - packages/api/src/routers/photos.ts
  - packages/db/prisma/schema.prisma
key_decisions:
  - (none)
patterns_established:
  - Upload presigned URL: le serveur génère l'URL signée, le client fait le PUT direct vers S3
  - Suppression en 2 étapes: d'abord le fichier S3, puis le record en base (ou inversement avec error handling tolerant)
observability_surfaces:
  - none
drill_down_paths:
  - .gsd/milestones/M011/slices/S01/tasks/T01-SUMMARY.md
  - .gsd/milestones/M011/slices/S01/tasks/T02-SUMMARY.md
  - .gsd/milestones/M011/slices/S01/tasks/T03-SUMMARY.md
  - .gsd/milestones/M011/slices/S01/tasks/T04-SUMMARY.md
  - .gsd/milestones/M011/slices/S01/tasks/T05-SUMMARY.md
duration: ""
verification_result: passed
completed_at: 2026-05-11T14:30:48.273Z
blocker_discovered: false
---

# S01: Infrastructure stockage photos

**Infrastructure S3 + router photos avec presigned URLs, 12 tests passent**

## What Happened

Infrastructure photo complète pour S01: modèle Prisma Photo (id, objectId, url, position, createdAt) avec FK cascade, migration SQL créée, client S3 avec presigned URLs (PutObject presigned, upload direct client→S3), router tRPC photos avec 5 procédures (getPresignedUrl, add, remove, list, reorder), schémas Zod et types TypeScript dans shared package, 12 tests vitest passent, .env.example documenté. Le pattern presigned URL permet d'uploader depuis le browser sans passer par le serveur (meilleure perf, moins de charge).

## Verification

12/12 tests vitest photosRouter passent. TypeScript compile sans erreur sur les nouveaux fichiers. Prisma schema sync: "No pending migrations". Le pattern presigned URL est opérationnel — en attente des credentials S3 pour test d'upload réel.

## Requirements Advanced

None.

## Requirements Validated

None.

## New Requirements Surfaced

None.

## Requirements Invalidated or Re-scoped

None.

## Operational Readiness

None.

## Deviations

None

## Known Limitations

Sans credentials S3 réels, l'upload ne fonctionnera pas en prod. Les presigned URLs seront générées mais le PUT vers S3 échouera si les credentials sont manquants ou incorrects.

## Follow-ups

None

## Files Created/Modified

- `packages/db/prisma/schema.prisma (+Photo model)` — 
- `packages/db/prisma/migrations/20260511120000_add_photos/migration.sql (new)` — 
- `packages/api/src/lib/s3.ts (new)` — 
- `packages/api/src/routers/photos.ts (new)` — 
- `packages/api/src/routers/__tests__/photos.test.ts (new)` — 
- `packages/api/src/router.ts (+photos router)` — 
- `packages/shared/src/schemas/index.ts (+photo schemas)` — 
- `packages/shared/src/types/index.ts (+Photo types)` — 
- `.env.example (S3 vars)` — 
