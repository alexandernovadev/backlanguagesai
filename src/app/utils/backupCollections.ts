import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import logger from "./logger";

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
      "labs_nova",
      "databk"
    );

    // 📁 Crear la carpeta si no existe
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

        // ✅ Sobrescribe el archivo cada vez
        const filePath = path.join(backupDir, `${collectionName}.json`);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");

        logger.info(`✅ Backup creado para '${collectionName}' en ${filePath}`, {
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
        logger.error(`❌ Error backuping '${collectionName}':`, {
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

    logger.info("✅ Backup completado", {
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
    logger.error("❌ Error durante el backup:", {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
};
