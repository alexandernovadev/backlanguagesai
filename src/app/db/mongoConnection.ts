import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const uri = process.env.MONGO_URL as string;

if (!uri) {
  throw new Error(
    "Por favor define la variable de entorno MONGO_URL en el archivo .env"
  );
}

// Variable para guardar el estado de la conexión
let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return mongoose;

  try {
    const db = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = db.connections[0].readyState === 1;
  } catch (error) {
    throw error;
  }

  return mongoose;
};
