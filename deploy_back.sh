#!/bin/bash
set -e  # Stop script if any command fails

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "❌ Error: jq is not installed. Please install it with 'sudo apt install jq'"
    exit 1
fi

# Reset branch to main and pull latest changes
echo "🔄 Resetting branch to main and pulling latest changes..."
git checkout main
git fetch origin
git reset --hard origin/main
git pull origin main
if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to pull latest changes from main branch."
    exit 1
fi

# Remove potential package conflicts
echo "🧹 Removing package-lock.json to avoid conflicts..."
rm -f package-lock.json

# 1. Remove node_modules and install dependencies
echo "🧹 Removing node_modules..."
rm -rf node_modules
# install yarn if not installed
npm install -g yarn
if ! command -v yarn &> /dev/null; then
    echo "❌ Error: yarn is not installed. Please install it with 'npm install -g yarn'"
    exit 1
fi
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

    echo "🏗️  Building with Yarn..."
    yarn build

    echo "🚀 Starting with Yarn..."
    pm2 start yarn --name "back-dev" -- start
fi

# Save PM2 process list
echo "💾 Saving PM2 process list..."
pm2 save

# 4. Restart Nginx
echo "🔄 Restarting Nginx..."
systemctl restart nginx

echo "✅ Deployment completed successfully!"

