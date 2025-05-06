#!/bin/bash
set -euo pipefail

trap 'echo "❌ Error en la línea $LINENO. Abortando instalación del backend." >&2; exit 1' ERR

echo "🚀 Iniciando instalación y despliegue del backend..."

# 1. Verificar e instalar Yarn
if ! command -v yarn &> /dev/null; then
    echo "🔧 Yarn no encontrado, instalando..."
    curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
    sudo apt update
    sudo apt install -y yarn
else
    echo "✅ Yarn ya está instalado."
fi

# 2. Verificar e instalar Node.js 18
if ! command -v node &> /dev/null; then
    echo "🔧 Node.js no encontrado, instalando Node.js 18..."
    curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
else
    echo "✅ Node.js ya está instalado."
fi

# 3. Verificar e instalar npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm no encontrado. Instalando npm..."
    curl -L https://npmjs.org/install.sh | sudo sh
else
    echo "✅ npm ya está instalado."
fi

# 4. Verificar e instalar PM2
if ! command -v pm2 &> /dev/null; then
    echo "🔧 PM2 no encontrado, instalando..."
    sudo npm install -g pm2
else
    echo "✅ PM2 ya está instalado."
fi

# 5. Verificar e instalar jq
if ! command -v jq &> /dev/null; then
    echo "❌ Error: jq no está instalado. Instálalo con 'sudo apt install jq'" >&2
    exit 1
fi

# 6. Validar que package.json exista
if [[ ! -f package.json ]]; then
    echo "❌ Error: package.json no encontrado. Abortando." >&2
    exit 1
fi

# 7. Limpiar entorno anterior
echo "🧹 Eliminando archivos antiguos..."
rm -f package-lock.json
rm -rf node_modules

# 8. Instalar dependencias
echo "📦 Instalando dependencias..."
if ! yarn install; then
    echo "❌ Falló la instalación de dependencias con Yarn" >&2
    exit 1
fi

# 9. Compilar/build
echo "🛠️ Ejecutando build..."
if ! yarn build; then
    echo "❌ Falló el build del backend" >&2
    exit 1
fi

# 10. Obtener versión y fecha
PACKAGE_VERSION=$(jq -r .version package.json)
DATE_FORMAT=$(TZ="America/Bogota" date +"Date 1 %B %d(%A) ⏰ %I:%M:%S %p - %Y 1  - V.$PACKAGE_VERSION")

# 11. Actualizar VERSION en .env si existe
if [[ -f .env ]]; then
    echo "✍️  Actualizando VERSION en .env..."
    sed -i "s/^VERSION=.*/VERSION=\"$DATE_FORMAT\"/" .env || {
        echo "⚠️  No se pudo actualizar VERSION en .env." >&2
    }
else
    echo "⚠️  .env no encontrado. Saltando actualización de VERSION." >&2
fi

# 12. Reiniciar o iniciar PM2
echo "🚀 Configurando PM2..."
if pm2 list | grep -q back-dev; then
    echo "🔄 Reiniciando proceso PM2 'back-dev'..."
    pm2 restart back-dev --update-env
else
    echo "▶️ Iniciando proceso PM2 'back-dev'..."
    pm2 start yarn --name "back-dev" -- start
fi

# 13. Guardar configuración de PM2
echo "💾 Guardando configuración de procesos PM2..."
pm2 save

# 14. Reiniciar Nginx
echo "🔄 Reiniciando Nginx..."
sudo systemctl restart nginx

echo "✅ Backend desplegado con éxito."
