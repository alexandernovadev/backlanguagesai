import cloudinary from "cloudinary";

import { deleteImageFromCloudinary } from "../cloudinary/cloudinaryService";
import { Expression, Lecture, Word } from "../../db/models";

interface UploadResult {
  img: string;
  entityId: string;
  entityType: string;
}

// Function to extract publicId from Cloudinary URL
const extractPublicId = (url: string): string => {
  const parts = url.split("/");
  let publicId = parts.pop() as string;

  if (publicId && publicId.includes(".")) {
    publicId = publicId.split(".")[0];
  }

  return publicId;
};

// Function to upload image to Cloudinary
const uploadToCloudinary = async (
  buffer: Buffer,
  folder: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.v2.uploader.upload_stream(
      {
        folder: `languagesai/${folder}`,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result!.secure_url);
        }
      }
    );

    // Convert buffer to stream
    const stream = require("stream");
    const readableStream = new stream.Readable();
    readableStream.push(buffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
};

// Upload image for WORD
export const uploadWordImage = async (
  entityId: string,
  imageBuffer: Buffer
): Promise<UploadResult> => {
  try {
    // 1. Get current word
    const word = await Word.findById(entityId);
    if (!word) {
      throw new Error("Word not found");
    }

    // 2. If it has previous image, delete it from Cloudinary
    if (word.img) {
      const publicId = extractPublicId(word.img);
      await deleteImageFromCloudinary(`languagesai/words/${publicId}`);
      console.log(
        `Previous image deleted from Cloudinary: languagesai/words/${publicId}`
      );
    }

    // 3. Upload new image to Cloudinary
    const newImageUrl = await uploadToCloudinary(imageBuffer, "words");

    // 4. Update word with new URL
    await Word.findByIdAndUpdate(entityId, {
      img: newImageUrl,
    });

    console.log(`New image uploaded for word ${entityId}: ${newImageUrl}`);

    return {
      img: newImageUrl,
      entityId,
      entityType: "word",
    };
  } catch (error) {
    console.error("Error in uploadWordImage:", error);
    throw error;
  }
};

// Upload image for LECTURE
export const uploadLectureImage = async (
  entityId: string,
  imageBuffer: Buffer
): Promise<UploadResult> => {
  try {
    // 1. Get current lecture
    const lecture = await Lecture.findById(entityId);
    if (!lecture) {
      throw new Error("Lecture not found");
    }

    // 2. If it has previous image, delete it from Cloudinary
    if (lecture.img) {
      const publicId = extractPublicId(lecture.img);
      await deleteImageFromCloudinary(`languagesai/lectures/${publicId}`);
      console.log(
        `Previous image deleted from Cloudinary: languagesai/lectures/${publicId}`
      );
    }

    // 3. Upload new image to Cloudinary
    const newImageUrl = await uploadToCloudinary(imageBuffer, "lectures");

    // 4. Update lecture with new URL
    await Lecture.findByIdAndUpdate(entityId, {
      img: newImageUrl,
    });

    console.log(`New image uploaded for lecture ${entityId}: ${newImageUrl}`);

    return {
      img: newImageUrl,
      entityId,
      entityType: "lecture",
    };
  } catch (error) {
    console.error("Error in uploadLectureImage:", error);
    throw error;
  }
};

// Upload image for EXPRESSION
export const uploadExpressionImage = async (
  entityId: string,
  imageBuffer: Buffer
): Promise<UploadResult> => {
  try {
    // 1. Get current expression
    const expression = await Expression.findById(entityId);
    if (!expression) {
      throw new Error("Expression not found");
    }

    // 2. If it has previous image, delete it from Cloudinary
    if (expression.img) {
      const publicId = extractPublicId(expression.img);
      await deleteImageFromCloudinary(`languagesai/expressions/${publicId}`);
      console.log(
        `Previous image deleted from Cloudinary: languagesai/expressions/${publicId}`
      );
    }

    // 3. Upload new image to Cloudinary
    const newImageUrl = await uploadToCloudinary(imageBuffer, "expressions");

    // 4. Update expression with new URL
    await Expression.findByIdAndUpdate(entityId, {
      img: newImageUrl,
    });

    console.log(
      `New image uploaded for expression ${entityId}: ${newImageUrl}`
    );

    return {
      img: newImageUrl,
      entityId,
      entityType: "expression",
    };
  } catch (error) {
    console.error("Error in uploadExpressionImage:", error);
    throw error;
  }
};
