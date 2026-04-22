#!/bin/bash

# Script de backup do banco de dados e uploads
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups"
DB_FILE="backend/database.sqlite"
UPLOADS_DIR="backend/uploads"

mkdir -p $BACKUP_DIR

echo "📦 Criando backup em $BACKUP_DIR/backup_$DATE.tar.gz..."

# Compactar banco e uploads
tar -czf "$BACKUP_DIR/backup_$DATE.tar.gz" $DB_FILE $UPLOADS_DIR

# Remover backups antigos (manter últimos 7)
ls -t $BACKUP_DIR/backup_*.tar.gz | tail -n +8 | xargs -r rm

echo "✅ Backup completo!"
echo "📁 Arquivo: $BACKUP_DIR/backup_$DATE.tar.gz"
