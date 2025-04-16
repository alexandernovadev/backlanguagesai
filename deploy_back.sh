#!/bin/bash
set -e  # Stop script if any command fails

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "❌ Error: jq is not installed. Please install it with 'sudo apt install jq'"
    exit 1
fi

# Navigate to backend folder
cd "$(dirname "$0")/back"

# Remove potential package conflicts
echo "🧹 Removing package-lock.json to avoid conflicts..."
rm -f package-lock.json

# 1. Remove node_modules and install dependencies
echo "🧹 Removing node_modules..."
rm -rf node_modules
echo "📦 Installing dependencies..."
yarn install

# 2. Get package.json version and current date + time
PACKAGE_VERSION=$(jq -r .version package.json)
DATE_FORMAT=$(TZ="America/Bogota" date +"Date 1 %B %d(%A) ⏰ %I:%M:%S %p - %Y 1  - V.$PACKAGE_VERSION")

# 2.1 Update VERSION in .env
echo "✍️  Updating VERSION in .env..."
sed -i "s/^VERSION=.*/VERSION=\"$DATE_FORMAT\"/" .env

# 3. Restart PM2 properly
echo "🚀 Restarting back-dev in PM2..."
if ! pm2 restart back-dev --update-env; then
    echo "⚠️  Restart failed, performing full restart..."
    pm2 delete back-dev || true
    pm2 start npm --name "back-dev" -- run start
fi

# Save PM2 process list
echo "💾 Saving PM2 process list..."
pm2 save

# 4. Restart Nginx
echo "🔄 Restarting Nginx..."
systemctl restart nginx

echo "✅ Deployment completed successfully!"

