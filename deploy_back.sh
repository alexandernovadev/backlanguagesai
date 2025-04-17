#!/bin/bash
set -e  # Detener el script si cualquier comando falla

# 1. Instalar Yarn si no está disponible
if ! command -v yarn &> /dev/null; then
    echo "🔧 Yarn no encontrado, instalando..."
    curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
    sudo apt update
    sudo apt install -y yarn
else
    echo "✅ Yarn ya está instalado."
fi

# 2. Instalar Node.js 18 y npm si no están disponibles
if ! command -v node &> /dev/null; then
    echo "🔧 Node.js no encontrado, instalando Node.js 18..."
    curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
else
    echo "✅ Node.js ya está instalado."
fi

# 3. Verificar si npm está disponible, si no lo está, instalarlo
if ! command -v npm &> /dev/null; then
    echo "❌ npm no encontrado. Intentando instalar npm..."
    curl -L https://npmjs.org/install.sh | sudo sh
fi

# 4. Instalar PM2 si no está disponible
if ! command -v pm2 &> /dev/null; then
    echo "🔧 PM2 no encontrado, instalando..."
    sudo npm install -g pm2
else
    echo "✅ PM2 ya está instalado."
fi

# 5. Verificar si jq está instalado
if ! command -v jq &> /dev/null; then
    echo "❌ Error: jq no está instalado. Por favor, instálalo con 'sudo apt install jq'"
    exit 1
fi

echo "✅ Validating SSH connection..."

# Iniciar el agente SSH y agregar la clave
cd /root/.ssh
eval "$(ssh-agent -s)"
ssh-add github-actions

echo "✅ SSH connection validated."
echo "🚀 Deploying to server..."

# Navegar al directorio de la aplicación y ejecutar el script de despliegue
cd /root/novalabs/backlanguagesai
git pull origin main

# 6. Eliminar el archivo package-lock.json si existe
echo "🧹 Eliminando package-lock.json para evitar conflictos..."
rm -f package-lock.json

# 7. Eliminar node_modules e instalar dependencias
echo "🧹 Eliminando node_modules..."
rm -rf node_modules

echo "📦 Instalando dependencias..."
yarn install

# 8. Realizar el build de la aplicación
echo "🛠️ Ejecutando build..."
yarn build

# 9. Obtener la versión de package.json y la fecha y hora actuales
PACKAGE_VERSION=$(jq -r .version package.json)
DATE_FORMAT=$(TZ="America/Bogota" date +"Date 1 %B %d(%A) ⏰ %I:%M:%S %p - %Y 1  - V.$PACKAGE_VERSION")

# 10. Actualizar la VERSION en .env
echo "✍️  Actualizando VERSION en .env..."
sed -i "s/^VERSION=.*/VERSION=\"$DATE_FORMAT\"/" .env

# 11. Reiniciar PM2 correctamente
echo "🚀 Reiniciando back-dev en PM2..."
if pm2 list | grep -q back-dev; then
    pm2 restart back-dev --update-env
    echo "✅ back-dev reiniciado con éxito."
else
    echo "⚠️ No se encontró el proceso back-dev en PM2, iniciando el proceso..."
    pm2 start yarn --name "back-dev" -- start
    echo "✅ back-dev iniciado con éxito."
fi

# 12. Guardar la lista de procesos de PM2
echo "💾 Guardando lista de procesos de PM2..."
pm2 save

# 13. Reiniciar Nginx
echo "🔄 Reiniciando Nginx..."
sudo systemctl restart nginx

echo "✅ Despliegue completado con éxito!"
