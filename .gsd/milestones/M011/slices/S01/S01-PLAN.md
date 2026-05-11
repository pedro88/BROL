# S01: Infrastructure stockage photos

**Goal:** Infrastructure S3 opérationnelle avec presigned URLs pour upload direct client→S3, et modèle Photo en base.
**Demo:** Un provider S3/Cloudinary configuré, l'upload API fonctionne, les photos sont servies publiquement

## Must-Haves

- Complete the planned slice outcomes.

## Verification

- Run the task and slice verification checks for this slice.

## Tasks

- [x] **T01: Ajouter Photo au schéma Prisma** `est:30min`
  Ajouter le modèle Photo dans Prisma avec les champs : id, objectId (FK), url, position, createdAt. Le champ url stockera l'URL publique complète du fichier sur S3.
  - Files: `packages/db/prisma/schema.prisma`
  - Verify: npx prisma migrate dev --name add_photos && npx prisma db push

- [x] **T02: Créer client S3 et utils** `est:1h`
  Créer le client S3 avec @aws-sdk/client-s3 et @aws-sdk/s3-request-presigner. Exposer getPresignedUploadUrl(objectId, filename, contentType) qui retourne { uploadUrl, publicUrl }. Valider les variables S3 (endpoint, region, bucket, access key, secret key) au démarrage.
  - Files: `packages/api/src/lib/s3.ts`
  - Verify: ls packages/api/src/lib/s3.ts && head -30 packages/api/src/lib/s3.ts

- [x] **T03: Créer router photos** `est:1h`
  Ajouter les procédures tRPC : photo.add (url + position, protège que l'objet appartient à l'user), photo.remove (protège ownership), photo.list (url, position, createdAt). Créer packages/api/src/routers/photos.ts.
  - Files: `packages/api/src/routers/photos.ts`, `packages/api/src/router.ts`
  - Verify: grep -r 'photo' packages/api/src/router.ts

- [x] **T04: Ajouter schémas photo au shared package** `est:30min`
  Ajouter les schémas Zod pour les mutations photo (addInput, removeInput) et types TypeScript correspondants dans packages/shared/src/schemas/index.ts et packages/shared/src/types/index.ts.
  - Files: `packages/shared/src/schemas/index.ts`, `packages/shared/src/types/index.ts`
  - Verify: grep -r 'photo' packages/shared/src/

- [x] **T05: Mettre à jour .env.example S3** `est:15min`
  Définir dans .env.example les variables S3 manquantes : S3_ENDPOINT, S3_REGION, S3_ACCESS_KEY, S3_SECRET_KEY, S3_BUCKET. Ajouter S3_MAX_FILE_SIZE_MB=10 et S3_ALLOWED_TYPES=image/jpeg,image/png,image/webp,image/gif.
  - Files: `.env.example`
  - Verify: grep -A5 'S3' .env.example

## Files Likely Touched

- packages/db/prisma/schema.prisma
- packages/api/src/lib/s3.ts
- packages/api/src/routers/photos.ts
- packages/api/src/router.ts
- packages/shared/src/schemas/index.ts
- packages/shared/src/types/index.ts
- .env.example
