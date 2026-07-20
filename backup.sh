#!/bin/bash
MARKER=/root/.macaco-backup-date
TODAY=$(date +%F)
[ -f "$MARKER" ] && [ "$(cat $MARKER)" = "$TODAY" ] && exit 0
scp /opt/macaco-bot/macaco.db "pc:D:/Coding/Projetos/macaco-bot/backups/macaco-$TODAY.db" && echo "$TODAY" > "$MARKER" && ssh pc 'forfiles /P D:\Coding\Projetos\macaco-bot\backups /M *.db /D -30 /C "cmd /c del @path"'