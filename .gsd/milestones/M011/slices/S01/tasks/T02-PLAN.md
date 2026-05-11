---
estimated_steps: 1
estimated_files: 1
skills_used: []
---

# T02: Créer client S3 et utils

Créer le client S3 avec @aws-sdk/client-s3 et @aws-sdk/s3-request-presigner. Exposer getPresignedUploadUrl(objectId, filename, contentType) qui retourne { uploadUrl, publicUrl }. Valider les variables S3 (endpoint, region, bucket, access key, secret key) au démarrage.

## Inputs

- `.env.example (S3 vars)`

## Expected Output

- `packages/api/src/lib/s3.ts avec fonctions getPresignedUploadUrl et deleteObject`

## Verification

ls packages/api/src/lib/s3.ts && head -30 packages/api/src/lib/s3.ts
