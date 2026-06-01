#!/usr/bin/env bash
# =============================================================================
# Configure le bucket S3 (policy + CORS) pour Brol.
#
# Pré-requis VPS :
#   - `s3cmd` installé (`apt install s3cmd`)
#   - `~/.s3cfg` configuré avec :
#       access_key  = <S3_ACCESS_KEY>
#       secret_key  = <S3_SECRET_KEY>
#       host_base   = fsn1.your-objectstorage.com
#       host_bucket = %(bucket)s.fsn1.your-objectstorage.com
#       bucket_location = eu-central-1
#
# Usage :
#   bash deploy/s3/setup.sh                       # défaut : brol-storage
#   BUCKET=mon-bucket bash deploy/s3/setup.sh
#
# Idempotent — peut être ré-exécuté sans dommage.
# =============================================================================

set -euo pipefail

BUCKET="${BUCKET:-brol-storage}"
HERE="$(cd "$(dirname "$0")" && pwd)"

if ! command -v s3cmd >/dev/null 2>&1; then
  echo "Erreur : s3cmd non installé. Installer avec : sudo apt install s3cmd" >&2
  exit 1
fi

echo "Bucket : s3://${BUCKET}"

echo "--- Vérification accès bucket ---"
s3cmd info "s3://${BUCKET}" >/dev/null

echo "--- Application bucket policy (public-read sur photos/*) ---"
s3cmd setpolicy "${HERE}/bucket-policy.json" "s3://${BUCKET}"

echo "--- Application CORS ---"
s3cmd setcors "${HERE}/cors.xml" "s3://${BUCKET}"

echo "--- État final ---"
s3cmd info "s3://${BUCKET}" | grep -E "Policy|CORS" -A1

echo "Setup terminé."
