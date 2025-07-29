import { Request, Response } from "express";
import path from "path";

import { LectureService } from "../services/lectures/LectureService";
import { LectureImportService } from "../services/import/LectureImportService";
import { LectureStatisticsService } from "../services/statistics/LectureStatisticsService";
import { successResponse, errorResponse } from "../utils/responseHelpers";
import { generateAudioFromTextService } from "../services/ai/generateAudioFromTextService";

const lectureService = new LectureService();
const lectureImportService = new LectureImportService();
const lectureStatisticsService = new LectureStatisticsService();

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

export const updateUrlAudioLectureByIdByGPT = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { idlecture } = req.params;
    const lecture = await lectureService.getLectureById(idlecture);

    if (!lecture) {
      return errorResponse(res, "Lecture not found", 404);
    }

    const audioUrl = await generateAudioFromTextService({
      prompt: lecture.content,
      voice: "nova",
    });

    const updatedLecture = await lectureService.updateUrlAudio(
      idlecture,
      audioUrl.audio
    );

    return successResponse(
      res,
      "Lecture audio generated successfully",
      updatedLecture
    );
  } catch (error) {
    return errorResponse(
      res,
      "An error occurred while generating lecture audio",
      500,
      error
    );
  }
};

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

    // Validate file structure
    if (
      !fileData.data ||
      !fileData.data.lectures ||
      !Array.isArray(fileData.data.lectures)
    ) {
      return errorResponse(
        res,
        "Invalid file structure. Expected 'data.lectures' array",
        400
      );
    }

    const lectures = fileData.data.lectures;
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
