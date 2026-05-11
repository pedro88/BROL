---
id: T04
parent: S01
milestone: M011
key_files:
  - packages/shared/src/schemas/index.ts
  - packages/shared/src/types/index.ts
key_decisions:
  - Le type PresignedUpload est défini dans types/index.ts (côté shared) pour que le client puisse typer la réponse tRPC
  - Re-exports des types photoInput dans shared pour consommation par le client web
duration: 
verification_result: untested
completed_at: 2026-05-11T14:30:21.833Z
blocker_discovered: false
---

# T04: Schémas Zod et types TypeScript photo ajoutés au shared package

**Schémas Zod et types TypeScript photo ajoutés au shared package**

## What Happened

Ajouté les schémas Zod photoPresignedUrlSchema, photoAddSchema, photoRemoveSchema, photoReorderSchema et les types TypeScript correspondants dans packages/shared/src/schemas/index.ts. Ajouté l'interface Photo et PresignedUpload dans packages/shared/src/types/index.ts. Tous les types sont ré-exportés pour consommation par apps/web.

## Verification

grep -r 'PhotoAdd\|PhotoRemove\|PhotoPresigned\|PhotoReorder' packages/shared/src/ confirme la présence des schémas.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| — | No verification commands discovered | — | — | — |

## Deviations

None

## Known Issues

None

## Files Created/Modified

- `packages/shared/src/schemas/index.ts`
- `packages/shared/src/types/index.ts`
