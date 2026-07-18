#!/bin/bash

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/var/backups/medusa}"
CONTAINER_NAME="lumi_prod_postgres"
DB_USER="lumi"
DB_NAME="medusa-store"
KEEP_DAYS=7

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Timestamp format: YYYYMMDD_HHMMSS
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/medusa_backup_$TIMESTAMP.sql.gz"

echo "Starting database backup for $DB_NAME at $(date)..."

# Perform backup using docker exec and compress on the fly
docker exec -i "$CONTAINER_NAME" pg_dump -U "$DB_USER" -d "$DB_NAME" | gzip > "$BACKUP_FILE"

if [ ${PIPESTATUS[0]} -eq 0 ] && [ -s "$BACKUP_FILE" ]; then
  echo "Backup successfully created: $BACKUP_FILE"
else
  echo "Error: Database backup failed!" >&2
  # Remove empty/failed backup file if it exists
  rm -f "$BACKUP_FILE"
  exit 1
fi

# Delete backups older than $KEEP_DAYS
echo "Cleaning up backups older than $KEEP_DAYS days..."
find "$BACKUP_DIR" -type f -name "medusa_backup_*.sql.gz" -mtime +$KEEP_DAYS -delete

echo "Backup process completed at $(date)."
