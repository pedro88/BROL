---
id: T02
parent: S01
milestone: M011
key_files:
  - packages/api/src/lib/s3.ts
key_decisions:
  - Upload direct client→S3 via presigned URL (PutObject) — le client fait le PUT, le serveur ne proxy pas le fichier
  - S3 endpoint configuré comme path-style (forcePathStyle: true) pour compatibilité Backblaze B2/MinIO
  - Cache-Control: public, max-age=31536000, immutable sur les fichiers uploadés
  - Validation content-type et taille côté serveur AVANT de générer la presigned URL (Zod côté client aussi)
duration: 
verification_result: untested
completed_at: 2026-05-11T14:30:06.682Z
blocker_discovered: false
---

# T02: Client S3 avec presigned URLs et helpers créé

**Client S3 avec presigned URLs et helpers créé**

## What Happened

Créé packages/api/src/lib/s3.ts avec client S3 singleton, getPresignedUploadUrl (génère PUT presigned URL + URL publique), deleteS3Object, extractKeyFromUrl, validateContentType, validateFileSize. Le client S3 est configuré pour endpoint custom (Backblaze B2/MinIO compatible) avec forcePathStyle: true. Les credentials S3 sont validés au premier usage (pas au démarrage).

## Verification

ls packages/api/src/lib/s3.ts && pnpm exec tsc --noEmit (0 erreurs TS sur s3.ts)

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| — | No verification commands discovered | — | — | — |

## Deviations

None

## Known Issues

None

## Files Created/Modified

- `packages/api/src/lib/s3.ts`
