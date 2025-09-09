import { Request, Response } from "express";
import { LectureService } from "../services/lectures/LectureService";
import { LectureImportService } from "../services/import/LectureImportService";
import { successResponse, errorResponse } from "../utils/responseHelpers";
import { generateImage } from "../services/ai/generateImage";
import { deleteImageFromCloudinary, uploadImageToCloudinary } from "../services/cloudinary/cloudinaryService";
import { imageLecturePrompt } from "./helpers/ImagePrompt";
import { generateTextStreamService } from "../services/ai/generateTextStream";
import { generateTopicStreamService } from "../services/ai/generateTopicStream";
import { WordService } from "../services/words/wordService";
import { promptAddEasyWords } from "./helpers/promptAddEasyWords";

const lectureService = new LectureService();
const lectureImportService = new LectureImportService();
const wordService = new WordService();

export const createLecture = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const lecture = await lectureService.createLecture(req.body);

    return successResponse(res, "Lecture created successfully", lecture, 201);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Error creating lecture");
  }
};

export const getLectureById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const lecture = await lectureService.getLectureById(req.params.id);
    if (!lecture) {
      return errorResponse(res, "Lecture not found", 404);
    }

    return successResponse(res, "Lecture Listed by ID successfully", lecture);
  } catch (error) {
    return errorResponse(res, "Error retrieving lecture", 500, error);
  }
};

export const updateLecture = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const lecture = await lectureService.updateLecture(req.params.id, req.body);
    if (!lecture) {
      return errorResponse(res, "Lecture not found", 404);
    }

    return successResponse(res, "Lecture Updated successfully", lecture);
  } catch (error) {
    return errorResponse(res, "Error updating lecture", 500, error);
  }
};

export const deleteLecture = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const lecture = await lectureService.deleteLecture(req.params.id);
    if (!lecture) {
      return errorResponse(res, "Lecture not found", 404);
    }

    return successResponse(res, "Lecture deleted successfully", {});
  } catch (error) {
    return errorResponse(res, "Error deleting lecture", 500, error);
  }
};

export const updateImageLecureById = async (req: Request, res: Response) => {
  const ID = req.params.id;
  const { image } = req.body;

  try {
    const updatedLecture = await lectureService.updateImage(ID, image);
    if (!updatedLecture) {
      return errorResponse(res, "Lecture not found", 404);
    }
    return successResponse(
      res,
      "Lecture Update Image Lectue ById successfully",
      updatedLecture
    );
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Error updating Image lecture", 500, error);
  }
};

// Audio generation function removed - service no longer available
// export const updateUrlAudioLectureByIdByGPT = async (
//   req: Request,
//   res: Response
// ): Promise<Response> => {
//   return errorResponse(res, "Audio generation service not available", 501);
// };

export const getAllLectures = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const {
      page: qPage,
      limit: qLimit,
      search = "",
      level,
      language,
      typeWrite,
      timeMin,
      timeMax,
      createdAfter,
      createdBefore,
      sortBy,
      sortOrder,
    } = req.query as any;

    const page = parseInt(qPage) || 1;
    const limit = parseInt(qLimit) || 10;

    const lectures = await lectureService.getLecturesAdvanced({
      page,
      limit,
      search,
      level,
      language,
      typeWrite,
      timeMin: timeMin ? Number(timeMin) : undefined,
      timeMax: timeMax ? Number(timeMax) : undefined,
      createdAfter,
      createdBefore,
      sortBy,
      sortOrder,
    });

    return successResponse(res, "Lectures retrieved successfully", lectures);
  } catch (error) {
    return errorResponse(res, "Error fetching lectures", 500, error);
  }
};

export const exportLecturesToJSON = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const lectures = await lectureService.getAllLecturesForExport();

    // Set headers for file download
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `lectures-export-${timestamp}.json`;

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    // Send the JSON data
    return res.json({
      success: true,
      message: `Exported ${lectures.length} lectures successfully`,
      data: {
        totalLectures: lectures.length,
        exportDate: new Date().toISOString(),
        lectures: lectures,
      },
    });
  } catch (error) {
    return errorResponse(
      res,
      "An error occurred while exporting lectures to JSON",
      500,
      error
    );
  }
};

export const importLecturesFromFile = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    if (!req.file) {
      return errorResponse(res, "No file uploaded", 400);
    }

    // Parse the JSON file content
    let fileData: any;
    try {
      const fileContent = req.file.buffer.toString("utf-8");
      fileData = JSON.parse(fileContent);
    } catch (parseError) {
      return errorResponse(res, "Invalid JSON file format", 400);
    }

    // Validate file structure - handle both direct and nested structures
    let lectures: any[] = [];
    
    // Try to find lectures in different possible structures
    if (fileData.data?.lectures && Array.isArray(fileData.data.lectures)) {
      // Direct structure: data.lectures
      lectures = fileData.data.lectures;
    } else if (fileData.data?.data?.lectures && Array.isArray(fileData.data.data.lectures)) {
      // Nested structure: data.data.lectures (from export)
      lectures = fileData.data.data.lectures;
    } else if (fileData.lectures && Array.isArray(fileData.lectures)) {
      // Root level: lectures
      lectures = fileData.lectures;
    } else {
      return errorResponse(
        res,
        "Invalid file structure. Expected 'data.lectures' or 'data.data.lectures' array",
        400
      );
    }
    const {
      duplicateStrategy = "skip",
      validateOnly = false,
      batchSize = 10,
    } = req.query;

    // Validate duplicateStrategy
    const validStrategies = ["skip", "overwrite", "error", "merge"];
    if (!validStrategies.includes(duplicateStrategy as string)) {
      return errorResponse(
        res,
        `Invalid duplicateStrategy. Must be one of: ${validStrategies.join(
          ", "
        )}`,
        400
      );
    }

    // Validate batchSize
    const batchSizeNum = parseInt(batchSize as string);
    if (isNaN(batchSizeNum) || batchSizeNum < 1 || batchSizeNum > 100) {
      return errorResponse(
        res,
        "Invalid batchSize. Must be a number between 1 and 100",
        400
      );
    }

    // Convert validateOnly to boolean
    const validateOnlyBool = validateOnly === "true";

    // If validateOnly is true, just validate without importing
    if (validateOnlyBool) {
      const validationResults = await lectureImportService.validateLectures(lectures);
      const validCount = validationResults.filter(
        (r) => r.status === "valid"
      ).length;
      const invalidCount = validationResults.filter(
        (r) => r.status === "invalid"
      ).length;

      return successResponse(res, "Validation completed", {
        totalLectures: lectures.length,
        valid: validCount,
        invalid: invalidCount,
        validationResults,
      });
    }

    // Import lectures
    const importResult = await lectureImportService.importLectures(lectures, {
      duplicateStrategy: duplicateStrategy as any,
      validateOnly: false,
      batchSize: batchSizeNum,
    });

    return successResponse(res, "Import completed successfully", importResult);
  } catch (error) {
    console.error("Import error:", error);
    return errorResponse(res, "Error importing lectures", 500, error);
  }
};

// ===== AI GENERATION FUNCTIONS FOR LECTURES =====

export const updateImageLecture = async (req: Request, res: Response) => {
  const { lectureString, imgOld } = req.body;
  const IDLecture = req.params.idlecture;

  if (!lectureString) {
    return errorResponse(res, "Lecture prompt is required.", 400);
  }

  try {
    // Generate image
    const imageBase64 = await generateImage(imageLecturePrompt(lectureString));
    if (!imageBase64) {
      return errorResponse(res, "Failed to generate image.", 400);
    }

    let deleteOldImagePromise: Promise<void> = Promise.resolve();

    if (imgOld && imgOld.includes("res.cloudinary.com")) {
      const parts = imgOld.split("/");
      let publicId = parts.pop();

      // Remove extension if exists
      if (publicId && publicId.includes(".")) {
        publicId = publicId.split(".")[0];
      }

      // Delete old image
      deleteOldImagePromise = deleteImageFromCloudinary(
        "languagesai/lectures/" + publicId
      ).then(() => {});
    }

    // Upload new image while deleting the old one
    const [_, urlImage] = await Promise.all([
      deleteOldImagePromise,
      uploadImageToCloudinary(imageBase64, "lectures"),
    ]);

    // Update lecture image
    const updatedLecture = await lectureService.updateImage(
      IDLecture,
      urlImage
    );

    return successResponse(
      res,
      "Lecture image updated successfully",
      updatedLecture
    );
  } catch (error) {
    return errorResponse(res, "Error generating lecture image", 500, error);
  }
};

export const generateTextStream = async (req: Request, res: Response) => {
  const {
    prompt,
    level,
    typeWrite,
    addEasyWords,
    language,
    rangeMin,
    rangeMax,
    grammarTopics,
    selectedWords,
  } = req.body;

  // Allow empty prompt: when empty, backend should generate a random topic.
  // If prompt has content, it must be passed through faithfully to guide generation.
  if (typeof prompt !== "string") {
    return errorResponse(res, "Prompt must be a string.", 400);
  }

  try {
    let promptWords = "";

    if (addEasyWords) {
      const getEasyWords = await wordService.getLastEasyWords();
      const wordsArray = getEasyWords.map((item) => item.word);
      promptWords = promptAddEasyWords(wordsArray);
    }

    const stream = await generateTextStreamService({
      // If prompt is empty or whitespace, we still pass it, and the service will handle random generation
      prompt: (prompt || "").toString(),
      level,
      typeWrite,
      promptWords,
      language,
      rangeMin,
      rangeMax,
      grammarTopics: Array.isArray(grammarTopics) ? grammarTopics : [],
      selectedWords: Array.isArray(selectedWords) ? selectedWords : [], // Pasar selectedWords
    });

    res.setHeader("Content-Type", "application/json");
    res.flushHeaders();

    // Read the stream and send the data to the client
    for await (const chunk of stream) {
      const piece = chunk.choices[0].delta.content || "";
      res.write(piece);
    }

    // Close the stream when done
    res.end();
  } catch (error) {
    return errorResponse(
      res,
      "Error trying to generate text stream",
      500,
      error
    );
  }
};

export const generateTopicStream = async (req: Request, res: Response) => {
  try {
    const { existingText, type } = req.body;

    // Validate required fields
    if (!type || !["lecture", "exam"].includes(type)) {
      return errorResponse(
        res,
        "Type is required and must be 'lecture' or 'exam'",
        400
      );
    }

    // Validate existingText length if provided
    if (existingText && existingText.length > 500) {
      return errorResponse(
        res,
        "Existing text cannot exceed 500 characters",
        400
      );
    }

    // Set headers for streaming
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Generate topic stream
    const stream = await generateTopicStreamService({
      existingText: existingText || "",
      type,
    });

    // Stream the response
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(content);
      }
    }

    res.end();
  } catch (error: any) {
    console.error("Error generating topic stream:", error);
    return errorResponse(res, "Error generating topic", 500, error);
  }
};
