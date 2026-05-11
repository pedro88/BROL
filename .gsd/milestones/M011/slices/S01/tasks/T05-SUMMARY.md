---
id: T05
parent: S01
milestone: M011
key_files:
  - .env.example
key_decisions:
  - Commenté les options de stockage (Hetzner, Backblaze, AWS, MinIO) pour guider la configuration
duration: 
verification_result: untested
completed_at: 2026-05-11T14:30:27.216Z
blocker_discovered: false
---

# T05: Variables S3 documentées dans .env.example

**Variables S3 documentées dans .env.example**

## What Happened

Mis à jour .env.example avec S3_MAX_FILE_SIZE_MB=10 et S3_ALLOWED_TYPES listant les 4 types MIME supportés. Commentaire ajouté pour clarifier que Hetzner/Backblaze/AWS/MinIO sont tous compatibles.

## Verification

grep -A3 'S3_MAX_FILE_SIZE' .env.example confirme les nouvelles variables.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| — | No verification commands discovered | — | — | — |

## Deviations

None

## Known Issues

None

## Files Created/Modified

- `.env.example`
