---
id: T01
parent: S01
milestone: M009
key_files:
  - (none)
key_decisions:
  - (none)
duration: 
verification_result: untested
completed_at: 2026-05-11T07:25:21.148Z
blocker_discovered: false
---

# T01: ObjectType enum + champs type/conditionnels ajoutés au schema Prisma

**ObjectType enum + champs type/conditionnels ajoutés au schema Prisma**

## What Happened

T01: Ajouté enum ObjectType (9 types) + champs sur Collection (type, customField1Label, customField2Label) + champs sur Object (objectType, playersMin, playersMax, playingTimeMinutes, ageMin, powerWatts, customField1, customField2). Prisma validate OK. T02: Champs ajoutés au model Object. T03: Zod schemas mis à jour (createObjectSchema avec tous les champs optionnels + router qui détermine objectType depuis collection.type). Le discriminatedUnion a été abandonné car Zod évalue le discriminant AVANT les defaults. Solution : schema flat avec objectType optionnel, router fait le defaulting. T04: routers mis à jour (collections.create/update passent type, customFieldLabels; objects.create infer objectType depuis collection.type). T05: prisma migrate reset + migrate dev → migration 20260511072136_init_object_types appliquée à la DB.

## Verification

pnpm --filter @brol/db exec prisma validate ✅\npnpm --filter @brol/shared exec tsc --noEmit ✅\nDATABASE_URL=... vitest run → 5 passed, 74 tests ✅

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| — | No verification commands discovered | — | — | — |

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

None.
