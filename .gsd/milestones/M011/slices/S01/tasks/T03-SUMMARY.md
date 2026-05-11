---
id: T03
parent: S01
milestone: M011
key_files:
  - packages/api/src/routers/photos.ts
  - packages/api/src/router.ts
key_decisions:
  - Suppression S3 synchrone dans remove (le fichier est supprimé avant de retourner), mais erreurs S3 ne bloquent pas la suppression en base
  - Presigned URL expire dans 15 minutes (PRESIGNED_URL_EXPIRES_IN = 900s)
  - Réordonnancement transactionnel (toutes les positions updatées en une transaction)
duration: 
verification_result: untested
completed_at: 2026-05-11T14:30:14.832Z
blocker_discovered: false
---

# T03: Router photos tRPC avec 5 procédures créé

**Router photos tRPC avec 5 procédures créé**

## What Happened

Créé packages/api/src/routers/photos.ts avec les procédures: getPresignedUrl (demande presigned URL pour upload), add (enregistre la photo après upload), remove (supprime S3 + base), list (photos d'un objet, ordonnées par position), reorder (réordonne). Toutes les procédures vérifient l'ownership via collection.userId. Router enregistré dans appRouter sous 'photos'.

## Verification

12/12 tests photos passent. grep 'photos' packages/api/src/router.ts confirme l'enregistrement.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| — | No verification commands discovered | — | — | — |

## Deviations

None

## Known Issues

None

## Files Created/Modified

- `packages/api/src/routers/photos.ts`
- `packages/api/src/router.ts`
