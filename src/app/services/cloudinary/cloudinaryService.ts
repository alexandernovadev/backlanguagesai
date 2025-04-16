import cloudinary from "cloudinary";

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

    return uploadResponse.secure_url;
  } catch (error) {
    console.error("Error subiendo la imagen a Cloudinary:", error);
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
      console.error(`No se pudo eliminar la imagen: ${publicId}`);
      return false;
    }
  } catch (error) {
    console.error("Error eliminando la imagen de Cloudinary:", error);
    return false;
  }
};
