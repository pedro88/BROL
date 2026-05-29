#!/usr/bin/env bash
# db-backup.sh — pg_dump the Brol DB to a rotating local archive.
#
# Usage:
#   bash scripts/db-backup.sh                # dumps DATABASE_URL → ./backups/
#   bash scripts/db-backup.sh /custom/dir    # custom backup directory
#
# Env:
#   DATABASE_URL    Postgres connection string (required).
#   BACKUP_RETAIN   Number of dumps to keep (default 14).
#
# Cron (local dev, daily at 03:00):
#   0 3 * * * cd /home/piet/Projets/webDev/BROL && bash scripts/db-backup.sh >> /var/log/brol-backup.log 2>&1
#
# Cron (VPS prod, hourly + daily retention longer):
#   0 * * * *   cd /opt/brol && BACKUP_RETAIN=72 bash scripts/db-backup.sh >> /var/log/brol-backup.log 2>&1

set -euo pipefail

# Resolve project root (script is in scripts/)
cd "$(dirname "$0")/.."

# Load .env if present (so cron jobs without bashrc still get DATABASE_URL)
if [ -f .env ]; then
    set -a
    # shellcheck disable=SC1091
    source .env
    set +a
fi

if [ -z "${DATABASE_URL:-}" ]; then
    echo "ERROR: DATABASE_URL not set" >&2
    exit 1
fi

BACKUP_DIR="${1:-./backups}"
RETAIN="${BACKUP_RETAIN:-14}"

mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
OUT="$BACKUP_DIR/brol-$TIMESTAMP.sql.gz"

# Strip Prisma-specific URI params (?schema=...) that pg_dump rejects.
PG_URL="${DATABASE_URL%%\?*}"

# pg_dump writes to stdout when no -f; gzip on the fly so even small VPS disks
# survive years of dumps. Use --no-owner / --no-privileges so the dump is
# restorable into a DB owned by a different role.
pg_dump \
    --no-owner \
    --no-privileges \
    --format=plain \
    --dbname="$PG_URL" \
    | gzip -9 > "$OUT"

echo "[$(date +%FT%T%z)] wrote $OUT ($(du -h "$OUT" | cut -f1))"

# Rotation: keep only the N most recent dumps.
# shellcheck disable=SC2012
ls -1t "$BACKUP_DIR"/brol-*.sql.gz 2>/dev/null \
    | tail -n +"$((RETAIN + 1))" \
    | xargs -r rm -v -- || true
