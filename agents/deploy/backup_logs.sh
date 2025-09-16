#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf "backups/logs_backup_$DATE.tar.gz" logs/
find backups/ -name "logs_backup_*.tar.gz" -mtime +7 -delete
echo "📦 Backup de logs criado: logs_backup_$DATE.tar.gz"
