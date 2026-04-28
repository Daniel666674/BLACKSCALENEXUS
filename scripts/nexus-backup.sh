#!/usr/bin/env bash
##############################################################################
# nexus-backup.sh — Daily backup for BlackScale Nexus
# Copies nexus.db and .env.production, retains last 30 backups.
# Recommended crontab: 0 2 * * * /opt/nexus/scripts/nexus-backup.sh
##############################################################################

set -euo pipefail

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/var/backups/nexus/daily"
DB_SOURCE="/opt/nexus/data/crm.db"
ENV_SOURCE="/opt/nexus/.env.production"
LOG_FILE="/var/log/nexus-backup.log"
MAX_BACKUPS=30

mkdir -p "$BACKUP_DIR"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

log "Starting backup — $TIMESTAMP"

# ─── Database ───────────────────────────────────────────────────────────────
if [ -f "$DB_SOURCE" ]; then
  cp "$DB_SOURCE" "$BACKUP_DIR/nexus_${TIMESTAMP}.db"
  log "DB backup: $BACKUP_DIR/nexus_${TIMESTAMP}.db"
else
  log "WARNING: DB not found at $DB_SOURCE"
fi

# ─── Env file ───────────────────────────────────────────────────────────────
if [ -f "$ENV_SOURCE" ]; then
  cp "$ENV_SOURCE" "$BACKUP_DIR/env_${TIMESTAMP}.bak"
  chmod 600 "$BACKUP_DIR/env_${TIMESTAMP}.bak"
  log "ENV backup: $BACKUP_DIR/env_${TIMESTAMP}.bak"
else
  log "WARNING: .env.production not found at $ENV_SOURCE"
fi

# ─── Prune old backups (keep last 30) ───────────────────────────────────────
DB_COUNT=$(ls -1 "$BACKUP_DIR"/nexus_*.db 2>/dev/null | wc -l)
if [ "$DB_COUNT" -gt "$MAX_BACKUPS" ]; then
  TO_DELETE=$((DB_COUNT - MAX_BACKUPS))
  ls -1t "$BACKUP_DIR"/nexus_*.db | tail -n "$TO_DELETE" | xargs rm -f
  log "Pruned $TO_DELETE old DB backup(s)"
fi

ENV_COUNT=$(ls -1 "$BACKUP_DIR"/env_*.bak 2>/dev/null | wc -l)
if [ "$ENV_COUNT" -gt "$MAX_BACKUPS" ]; then
  TO_DELETE=$((ENV_COUNT - MAX_BACKUPS))
  ls -1t "$BACKUP_DIR"/env_*.bak | tail -n "$TO_DELETE" | xargs rm -f
  log "Pruned $TO_DELETE old ENV backup(s)"
fi

log "Backup complete."
