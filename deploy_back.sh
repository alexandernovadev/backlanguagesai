#!/bin/bash
set -e  # Detener si algún comando falla

# ─────────────────────────────────────────────
# 🔐 SSH: Asegurar que se pueda acceder a GitHub
# ─────────────────────────────────────────────

echo "🔐 Asegurando acceso SSH a GitHub..."

SSH_KEY="$HOME/.ssh/github-actions"

# Crear carpeta si no existe
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Si no existe la clave, avisar (o podrías generarla automáticamente si querés)
if [ ! -f "$SSH_KEY" ]; then
    echo "❌ No se encontró una clave SSH en $SSH_KEY"
    echo "👉 Por favor generá una con: ssh-keygen -t ed25519 -C 'deploy@github-actions'"
    exit 1
fi

# Agregar clave al agente SSH
eval "$(ssh-agent -s)"
ssh-add "$SSH_KEY"

# Probar conexión a GitHub (no obligatorio, pero útil para debug)
echo "🔍 Probando conexión a GitHub..."
ssh -T git@github.com || echo "⚠️  GitHub aún no respondió correctamente (puede ser normal si no se ha conectado antes)"

# ─────────────────────────────────────────────
# 🧹 Limpieza y dependencias
# ─────────────────────────────────────────────

# Verificar jq
if ! command -v jq &> /dev/null; then
    echo "❌ Error: jq no está instalado. Ejecutá: sudo apt install jq"
    exit 1
fi

echo "🧹 Borrando package-lock.json..."
rm -f package-lock.json

echo "🧹 Borrando node_modules..."
rm -rf node_modules

# Instalar yarn si hace falta
npm install -g yarn

if ! command -v yarn &> /dev/null; then
    echo "❌ Error: yarn no se pudo instalar correctamente"
    exit 1
fi

echo "📦 Instalando dependencias..."
yarn install

# ─────────────────────────────────────────────
# 🕓 Versionado automático
# ─────────────────────────────────────────────

PACKAGE_VERSION=$(jq -r .version package.json)
DATE_FORMAT=$(TZ="America/Bogota" date +"Date 1 %B %d(%A) ⏰ %I:%M:%S %p - %Y 1  - V.$PACKAGE_VERSION")

echo "✍️  Actualizando VERSION en .env..."
sed -i "s/^VERSION=.*/VERSION=\"$DATE_FORMAT\"/" .env

# ─────────────────────────────────────────────
# 🚀 PM2 Restart
# ─────────────────────────────────────────────

echo "🚀 Reiniciando PM2..."

if ! pm2 restart back-dev --update-env; then
    echo "⚠️  No se pudo reiniciar. Haciendo rebuild..."

    pm2 delete back-dev || true
    echo "🏗️  Compilando proyecto..."
    yarn build

    echo "🚀 Iniciando servicio con PM2..."
    pm2 start yarn --name "back-dev" -- start
fi

echo "💾 Guardando configuración de PM2..."
pm2 save

# ─────────────────────────────────────────────
# 🌐 Reiniciar Nginx
# ─────────────────────────────────────────────

echo "🔄 Reiniciando Nginx..."
sudo systemctl restart nginx

echo "✅ ¡Deploy completado con éxito!"
