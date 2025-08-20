import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import logger from "../../utils/logger";

export const backupCollections = async (): Promise<any> => {
  try {
    const collectionsToBackup = [
      "lectures", 
      "words", 
      "questions", 
      "exams", 
      "examattempts", 
      "expressions", 
      "users"
    ];

    const backupDir = path.join(
      __dirname,
      "..",
      "..",
      "..",
      "..",
      "labs_nova",
      "databk"
    );

    // 📁 Create folder if it doesn't exist
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const backupResults = [];

    for (const collectionName of collectionsToBackup) {
      try {
        const data = await mongoose.connection.db
          .collection(collectionName)
          .find({})
          .toArray();

        // ✅ Overwrite file each time with consistent structure
        const filePath = path.join(backupDir, `${collectionName}.json`);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

        // Create consistent structure with exports
        const backupData = {
          success: true,
          message: `Backup generated ${data.length} ${collectionName} successfully`,
          data: {
            [`total${collectionName.charAt(0).toUpperCase() + collectionName.slice(1)}`]: data.length,
            exportDate: new Date().toISOString(),
            [collectionName]: data
          }
        };

        // ✅ Write with UTF-8 BOM for maximum compatibility
        const jsonString = JSON.stringify(backupData, null, 2);
        const bom = Buffer.from([0xEF, 0xBB, 0xBF]); // UTF-8 BOM
        const content = Buffer.concat([bom, Buffer.from(jsonString, 'utf8')]);
        
        fs.writeFileSync(filePath, content);

        logger.info(`✅ Backup created for '${collectionName}' in ${filePath}`, {
          collection: collectionName,
          count: data.length,
          filePath: filePath,
          timestamp: timestamp
        });
        
        backupResults.push({
          collection: collectionName,
          count: data.length,
          filePath: filePath,
          timestamp: timestamp
        });
      } catch (collectionError) {
        logger.error(`❌ Error backing up '${collectionName}':`, {
          collection: collectionName,
          error: collectionError.message,
          stack: collectionError.stack
        });
        backupResults.push({
          collection: collectionName,
          error: collectionError.message,
          count: 0
        });
      }
    }

    logger.info("✅ Backup completed", {
      totalCollections: collectionsToBackup.length,
      successfulBackups: backupResults.filter(r => !r.error).length,
      totalDocuments: backupResults.reduce((total, r) => total + (r.count || 0), 0)
    });

    return {
      success: true,
      totalCollections: collectionsToBackup.length,
      backupResults: backupResults,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error("❌ Error during backup:", {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
};
