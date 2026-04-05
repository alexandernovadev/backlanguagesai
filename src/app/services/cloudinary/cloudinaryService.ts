import cloudinary from "cloudinary";
import logger from "../../utils/logger";

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  throw new Error("CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET environment variables must be set");
}

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImageToCloudinary = async (
  imageBase64: string,
  folder = "lectures"
): Promise<string | null> => {
  try {
    const uploadResponse = await cloudinary.v2.uploader.upload(
      `data:image/png;base64,${imageBase64}`,
      {
        folder: `languagesai/${folder}`,
      }
    );

    if (!uploadResponse || !uploadResponse.secure_url) {
      return null;
    }

    return uploadResponse.secure_url;
  } catch (error) {
    logger.error("Error subiendo la imagen a Cloudinary:", error);
    return null;
  }
};

/**
 * Remove a resource by ID
 */
export const deleteImageFromCloudinary = async (
  publicId: string
): Promise<boolean> => {
  try {
    const result = await cloudinary.v2.uploader.destroy(publicId);

    if (result.result === "ok") {
      console.info(`Imagen eliminada correctamente: ${publicId}`);
      return true;
    } else {
      logger.error(`No se pudo eliminar la imagen: ${publicId}`);
      return false;
    }
  } catch (error) {
    logger.error("Error eliminando la imagen de Cloudinary:", error);
    return false;
  }
};
