import { Request, Response } from "express";

import { generateTextStreamService } from "../services/ai/generateTextStream";
import { generateWordJson as generateWordJsonService } from "../services/ai/generateWordJson";
import { WordService } from "../services/words/wordService";
import { generateWordExamplesJson as generateWordExamplesJsonService } from "../services/ai/generateWordExamplesJson";
import { generateWordExamplesCodeSwithcingJson as generateWordExamplesCodeSwithcingJsonService } from "../services/ai/generateWordExamplesCodeSwithcingJson";
import { generateWordTypesJson as generateWordTypesJsonService } from "../services/ai/generateWordTypesJson";
import { generateWordSynomymsJson as generateWordSynomymsJsonService } from "../services/ai/generateWordSynomymsJson";
import { generateImage } from "../services/ai/generateImage";
import { generateExamStreamService } from "../services/ai/generateExamStream";
import {
  deleteImageFromCloudinary,
  uploadImageToCloudinary,
} from "../services/cloudinary/cloudinaryService";

import { errorResponse, successResponse } from "../utils/responseHelpers";
import { imageWordPrompt } from "./helpers/ImagePrompt";
import { promptAddEasyWords } from "./helpers/promptAddEasyWords";
import { LectureService } from "../services/lectures/LectureService";
import { generateAudioFromTextService } from "../services/ai/generateAudioFromTextService";
import { ExamGenerationValidator } from "../utils/validators/examGenerationValidator";
import { generateTopicStreamService } from "../services/ai/generateTopicStream";

const wordService = new WordService();
const lectureService = new LectureService();

export const generateAudioFromText = async (req: Request, res: Response) => {
  const { prompt, voice } = req.body;

  if (!prompt) {
    return errorResponse(res, "Prompt is required to generate audio.", 400);
  }

  try {
    const { audio } = await generateAudioFromTextService({
      prompt,
      voice,
    });

    return successResponse(res, "Audio and subtitles generated successfully", {
      audioPath: audio,
    });
  } catch (error) {
    return errorResponse(
      res,
      "Failed to generate audio and subtitles",
      500,
      error
    );
  }
};

/**
 * Generate Image with AI, Save in Cloudinary, and Update Lecture
 */
export const updateImageLecture = async (req: Request, res: Response) => {
  const { lectureString, imgOld } = req.body;
  const IDLecture = req.params.idlecture;

  if (!lectureString) {
    return errorResponse(res, "Lecture prompt is required.", 400);
  }

  try {
    // Generate image
    const imageBase64 = await generateImage(
      "Make an image that represents this lecture : \n" + lectureString
    );
    if (!imageBase64) {
      return errorResponse(res, "Failed to generate image.", 400);
    }

    let deleteOldImagePromise: Promise<void> = Promise.resolve();

    if (imgOld && imgOld.includes("res.cloudinary.com")) {
      const parts = imgOld.split("/");
      let publicId = parts.pop();

      // Remove extension if exists
      if (publicId.includes(".")) {
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

/**
 * Generate Image with AI, Save in Cloudinary, and Update Word
 */
export const updateImageWord = async (req: Request, res: Response) => {
  const { wordString, imgOld } = req.body;
  const IDWord = req.params.idword;

  if (!wordString) {
    return errorResponse(res, "Word prompt is required.", 400);
  }

  try {
    // Generate image
    const imageBase64 = await generateImage(imageWordPrompt(wordString));
    if (!imageBase64) {
      return errorResponse(res, "Failed to generate image.", 400);
    }

    let deleteOldImagePromise: Promise<void> = Promise.resolve();

    if (imgOld && imgOld.includes("res.cloudinary.com")) {
      const parts = imgOld.split("/");
      let publicId = parts.pop();

      // Remove extension if exists
      if (publicId.includes(".")) {
        publicId = publicId.split(".")[0];
      }

      // Delete old image
      deleteOldImagePromise = deleteImageFromCloudinary(
        "languagesai/words/" + publicId
      ).then(() => {});
    }

    // Upload new image while deleting the old one
    const [_, urlImage] = await Promise.all([
      deleteOldImagePromise,
      uploadImageToCloudinary(imageBase64, "words"),
    ]);

    // Update word image
    const updatedWord = await wordService.updateWordImg(IDWord, urlImage);

    return successResponse(res, "Word image updated successfully", updatedWord);
  } catch (error) {
    return errorResponse(res, "Error generating word image", 500, error);
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
  } = req.body;

  if (!prompt) {
    return errorResponse(res, "Prompt is required.", 400);
  }

  try {
    let promptWords = "";

    if (addEasyWords) {
      const getEasyWords = await wordService.getLastEasyWords();
      const wordsArray = getEasyWords.map((item) => item.word);
      promptWords = promptAddEasyWords(wordsArray);
    }

    const stream = await generateTextStreamService({
      prompt,
      level,
      typeWrite,
      promptWords,
      language,
      rangeMin,
      rangeMax,
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

export const generateWordJson = async (req: Request, res: Response) => {
  const { prompt, language } = req.body;

  if (!prompt) {
    return errorResponse(res, "Prompt is required.", 400);
  }

  try {
    const wordData = await generateWordJsonService(prompt, language);
    return successResponse(res, "Word generated successfully", wordData);
  } catch (error) {
    return errorResponse(res, "Error generating word", 500, error);
  }
};

export const generateWordExamplesJson = async (req: Request, res: Response) => {
  const { prompt, language, oldExamples } = req.body;

  if (!prompt) {
    return errorResponse(res, "Prompt is required.", 400);
  }

  try {
    const wordData = await generateWordExamplesJsonService(prompt, language, oldExamples);
    return successResponse(res, "Word examples generated successfully", wordData);
  } catch (error) {
    return errorResponse(res, "Error generating word examples", 500, error);
  }
};

export const generateWordExamplesCodeSwitchingJson = async (
  req: Request,
  res: Response
) => {
  const { prompt, language, oldExamples } = req.body;

  if (!prompt) {
    return errorResponse(res, "Prompt is required.", 400);
  }

  try {
    const wordData = await generateWordExamplesCodeSwithcingJsonService(
      prompt,
      language,
      oldExamples
    );
    return successResponse(
      res,
      "Word code switching examples generated successfully",
      wordData
    );
  } catch (error) {
    return errorResponse(
      res,
      "Error generating word code switching examples",
      500,
      error
    );
  }
};

export const generateWordTypesJson = async (req: Request, res: Response) => {
  const { prompt, language, oldExamples } = req.body;

  if (!prompt) {
    return errorResponse(res, "Prompt is required.", 400);
  }

  try {
    const wordData = await generateWordTypesJsonService(prompt, language, oldExamples);
    return successResponse(res, "Word types generated successfully", wordData);
  } catch (error) {
    return errorResponse(res, "Error generating word types", 500, error);
  }
};

export const generateWordSynomymsJson = async (req: Request, res: Response) => {
  const { prompt, language, oldExamples } = req.body;

  if (!prompt) {
    return errorResponse(res, "Prompt is required.", 400);
  }

  try {
    const wordData = await generateWordSynomymsJsonService(prompt, language, oldExamples);
    return successResponse(res, "Word synonyms generated successfully", wordData);
  } catch (error) {
    return errorResponse(res, "Error generating word synonyms", 500, error);
  }
};

export const generateExamStream = async (req: Request, res: Response) => {
  const {
    level = "B1",
    topic = "daily life",
    grammarTopics = [],
    numberOfQuestions = 10,
    types = ["multiple_choice", "fill_blank", "true_false"],
    difficulty = 3,
    userLang = "es",
  } = req.body;

  // Validar parámetros usando el nuevo validador
  const validation = ExamGenerationValidator.validateExamGeneration({
    topic,
    grammarTopics,
    level,
    numberOfQuestions,
    types,
    difficulty,
    userLang,
  });

  if (!validation.isValid) {
    return errorResponse(
      res,
      `Validation error: ${validation.errors.join(", ")}`,
      400
    );
  }

  // Mostrar warnings si existen
  if (validation.warnings.length > 0) {
    console.warn("Exam generation warnings:", validation.warnings);
  }

  try {
    const stream = await generateExamStreamService({
      level,
      topic,
      grammarTopics,
      numberOfQuestions,
      types,
      difficulty,
      userLang,
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
    return errorResponse(res, "Failed to generate exam stream", 500, error);
  }
};

// Nueva función para procesar la respuesta de la IA y extraer título y slug
export const processExamGenerationResponse = (aiResponse: any) => {
  try {
    // La IA ahora devuelve un objeto con examTitle, examSlug y questions
    const { examTitle, examSlug, questions } = aiResponse;
    
    return {
      examTitle: examTitle || `Examen: ${aiResponse.topic || 'General'}`,
      examSlug: examSlug || 'exam-general',
      questions: questions || []
    };
  } catch (error) {
    console.error('Error processing AI response:', error);
    // Fallback si la IA no devuelve el formato esperado
    return {
      examTitle: `Examen: ${aiResponse.topic || 'General'}`,
      examSlug: 'exam-general',
      questions: aiResponse.questions || []
    };
  }
};

export const generateTopicStream = async (req: Request, res: Response) => {
  try {
    const { existingText, type } = req.body;

    // Validate required fields
    if (!type || !["lecture", "exam"].includes(type)) {
      return errorResponse(res, "Type is required and must be 'lecture' or 'exam'", 400);
    }

    // Validate existingText length if provided
    if (existingText && existingText.length > 500) {
      return errorResponse(res, "Existing text cannot exceed 500 characters", 400);
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