import fs from "fs";
import path from "path";
import mongoose from "mongoose";

export const seedData = async (): Promise<void> => {
  try {
    const collections = ["lectures", "words"];
    const backupDir = path.join(
      __dirname,
      "..",
      "..",
      "..",
      "labs_nova",
      "databk"
    );

    for (const collectionName of collections) {
      // Buscar el archivo más reciente de la colección
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

      // Borrar y luego insertar
      const collection = mongoose.connection.db.collection(collectionName);
      await collection.deleteMany({});
      await collection.insertMany(documents);

      console.log(`✅ ${collectionName} seeded from ${latestFile}`);
    }
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    throw error;
  }
};
