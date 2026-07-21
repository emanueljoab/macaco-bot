#!/bin/bash
set -e

DIR="$(dirname "$0")"
source "$DIR/.env"

MARKER=/root/.macaco-backup-date
TODAY=$(date +%F)
[ -f "$MARKER" ] && [ "$(cat "$MARKER")" = "$TODAY" ] && exit 0

SNAPSHOT="/tmp/macaco-$TODAY.db"
sqlite3 "$DIR/macaco.db" ".backup '$SNAPSHOT'"
scp "$SNAPSHOT" "$BACKUP_HOST:$BACKUP_DIR/macaco-$TODAY.db"
rm -f "$SNAPSHOT"
echo "$TODAY" > "$MARKER"
ssh "$BACKUP_HOST" "forfiles /P ${BACKUP_DIR//\//\\} /M *.db /D -30 /C \"cmd /c del @path\"" || true