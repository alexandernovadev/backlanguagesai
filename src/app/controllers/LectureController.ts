import { Request, Response } from "express";
import path from "path";

import { LectureService } from "../services/lectures/LectureService";
import { successResponse, errorResponse } from "../utils/responseHelpers";
import { generateAudioFromTextService } from "../services/ai/generateAudioFromTextService";

const lectureService = new LectureService();

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
) => {
  const ID = req.params.idlecture;
  const oldUrl = req.params.oldUrl;

  try {
    // 1. Buscar la lecture
    const lecture = await lectureService.getLectureById(ID);

    if (!lecture) {
      return errorResponse(res, "Lecture not found", 404);
    }

    // 2. Usar lecture.content como prompt para generar el audio
    const { audio } = await generateAudioFromTextService({
      prompt: lecture.content, // <- acá va el contenido real
      voice: req.body.voice, // si querés dejar configurable la voz
    });

    // 3. Guardar solo el path relativo para servir desde frontend (ej: /audios/123.wav)
    const audioUrl = `/audios/${path.basename(audio)}`;

    // 4. Actualizar la lecture con la nueva URL de audio
    const updatedLecture = await lectureService.updateUrlAudio(ID, audioUrl);

    return successResponse(
      res,
      "Lecture updated with new audio successfully",
      updatedLecture
    );
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Error updating lecture audio", 500, error);
  }
};

export const getAllLectures = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 1000;
    const lectures = await lectureService.getAllLectures(page, limit);

    return successResponse(res, "Lecture listed successfully", lectures);
  } catch (error) {
    return errorResponse(res, "Error fetching lectures", 500, error);
  }
};
