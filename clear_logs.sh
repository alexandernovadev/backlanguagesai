#!/bin/bash

# Ruta relativa desde el proyecto
LOG_DIR="./back/logs"

# Eliminar archivos .log si existen
find "$LOG_DIR" -name "*.log" -type f -delete

# Registrar la limpieza
echo "Logs eliminados el: $(date)" >> ./back/logs/clear_logs_history.log
