---
estimated_steps: 1
estimated_files: 1
skills_used: []
---

# T05: Mettre à jour .env.example S3

Définir dans .env.example les variables S3 manquantes : S3_ENDPOINT, S3_REGION, S3_ACCESS_KEY, S3_SECRET_KEY, S3_BUCKET. Ajouter S3_MAX_FILE_SIZE_MB=10 et S3_ALLOWED_TYPES=image/jpeg,image/png,image/webp,image/gif.

## Inputs

- `.env.example`

## Expected Output

- `.env.example mis à jour avec toutes les variables S3 documentées`

## Verification

grep -A5 'S3' .env.example
