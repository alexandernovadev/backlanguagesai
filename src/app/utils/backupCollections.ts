import fs from "fs";
import path from "path";
import mongoose from "mongoose";

export const backupCollections = async (): Promise<void> => {
  try {
    const collectionsToBackup = ["lectures", "words"];

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

    for (const collectionName of collectionsToBackup) {
      const data = await mongoose.connection.db
        .collection(collectionName)
        .find({})
        .toArray();

      // ✅ Sobrescribe el archivo cada vez
      const filePath = path.join(backupDir, `${collectionName}.json`);

      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");

      console.log(`✅ Backup creado para '${collectionName}' en ${filePath}`);
    }
  } catch (error) {
    console.error("❌ Error durante el backup:", error);
    throw error;
  }
};
