#!/bin/bash

# Restore MongoDB Backup Locally Using Docker
# Author: Alex Nova Sk88 and GPT friend
# Date: $(date)

# Configuration
CONTAINER_NAME="mongodb"
BACKUP_PATH="labs_nova/backupsdb/leanguagesia/leanguagesia"
BACKUP_DEST="/backupsdb"
DB_NAME="leanguagesia"

# Step 1: Identify Docker Container
echo "🔍 Checking if container $CONTAINER_NAME is running..."
if ! docker ps --format '{{.Names}}' | grep -q "$CONTAINER_NAME"; then
    echo "❌ Error: Container $CONTAINER_NAME is not running."
    exit 1
fi

# Step 2: Remove Old Backup in Container (if exists)
echo "🗑️ Removing old backup from container..."
docker exec -it $CONTAINER_NAME bash -c "rm -rf $BACKUP_DEST/leanguagesia"

# Step 3: Copy Backup to Container
echo "📂 Copying backup to container..."
docker cp "$BACKUP_PATH" "$CONTAINER_NAME:$BACKUP_DEST"

# Step 4: Drop Existing Collections (to avoid duplicates)
echo "⚠️ Dropping existing collections in database $DB_NAME..."
docker exec -it $CONTAINER_NAME mongosh --eval "
  use $DB_NAME;
  db.words.drop();
  db.lectures.drop();
"

# Step 5: Restore Database (Path Adjusted)
echo "🚀 Restoring database..."
docker exec -it $CONTAINER_NAME bash -c "mongorestore --db $DB_NAME $BACKUP_DEST/leanguagesia"

# Step 6: Verify Restoration (Count Documents)
echo "✅ Verifying database restoration..."
docker exec -it $CONTAINER_NAME mongosh --eval "
  use $DB_NAME;
  const wordsCount = db.words.countDocuments();
  const lecturasCount = db.lectures.countDocuments();
  print('📊 Words Collection Count:', wordsCount);
  print('📊 Lecturas Collection Count:', lecturasCount);
"

echo "🎉 Restoration complete!"
