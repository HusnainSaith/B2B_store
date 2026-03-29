#!/bin/bash
# =====================================================
# Zerox-Store — PostgreSQL Backup Script
# =====================================================
# Runs via cron daily at 2 AM UTC.
# Keeps 7 days locally, uploads to Cloudflare R2.
# =====================================================
set -euo pipefail

BACKUP_DIR=/home/ubuntu/backups
COMPOSE_DIR=/home/ubuntu/zerox-store
RETENTION_DAYS=7
DATE=$(date +%Y-%m-%d_%H%M)
BACKUP_FILE="db-${DATE}.sql.gz"

# Load env for DB credentials and R2 config
if [ -f "$COMPOSE_DIR/.env" ]; then
    set -a
    source "$COMPOSE_DIR/.env"
    set +a
else
    echo "[$(date)] ERROR: .env file not found at $COMPOSE_DIR/.env"
    exit 1
fi

echo "[$(date)] Starting database backup..."

# Dump database from Docker postgres container
docker compose -f "$COMPOSE_DIR/docker-compose.yml" exec -T postgres \
    pg_dump -U "$DB_USERNAME" -d "$DB_DATABASE" --no-owner --clean | \
    gzip > "$BACKUP_DIR/$BACKUP_FILE"

FILESIZE=$(du -sh "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)
echo "[$(date)] Backup created: $BACKUP_FILE ($FILESIZE)"

# Upload to Cloudflare R2 (S3-compatible)
if [ -n "${R2_ACCESS_KEY_ID:-}" ] && [ -n "${R2_SECRET_ACCESS_KEY:-}" ]; then
    AWS_ACCESS_KEY_ID="$R2_ACCESS_KEY_ID" \
    AWS_SECRET_ACCESS_KEY="$R2_SECRET_ACCESS_KEY" \
    aws s3 cp "$BACKUP_DIR/$BACKUP_FILE" \
        "s3://${R2_BUCKET_NAME}/backups/$BACKUP_FILE" \
        --endpoint-url "$R2_ENDPOINT" \
        --quiet
    echo "[$(date)] Backup uploaded to R2: s3://${R2_BUCKET_NAME}/backups/$BACKUP_FILE"
else
    echo "[$(date)] WARN: R2 credentials not set — backup saved locally only"
fi

# Delete local backups older than retention period
DELETED=$(find "$BACKUP_DIR" -name "db-*.sql.gz" -mtime +$RETENTION_DAYS -delete -print | wc -l)
echo "[$(date)] Cleaned up $DELETED old backup(s) (keeping ${RETENTION_DAYS} days)"

echo "[$(date)] Backup complete."
