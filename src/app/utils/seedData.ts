import fs from "fs";
import path from "path";
import mongoose from "mongoose";

export const seedData = async (): Promise<void> => {
  try {
    const collections = ["lectures", "words"];

    // Usar process.cwd() para obtener el path raíz del proyecto
    const backupDir = path.join(process.cwd(), "labs_nova", "databk");

    // Verificar si el folder existe
    if (!fs.existsSync(backupDir)) {
      console.warn(`⚠️ Backup directory not found at ${backupDir}`);
      return;
    }

    for (const collectionName of collections) {
      const files = fs
        .readdirSync(backupDir)
        .filter(
          (file) => file.startsWith(collectionName) && file.endsWith(".json")
        )
        .sort()
        .reverse();

      if (files.length === 0) {
        console.warn(`⚠️ No backup file found for ${collectionName}`);
        continue;
      }

      const latestFile = files[0];
      const filePath = path.join(backupDir, latestFile);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const documents = JSON.parse(fileContent);

      const collection = mongoose.connection.db.collection(collectionName);

      await collection.deleteMany({});
      const result = await collection.insertMany(documents);

      console.log(
        `✅ ${collectionName} seeded from ${latestFile} | ${result.insertedCount} documents inserted`
      );
    }
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    throw error;
  }
};
