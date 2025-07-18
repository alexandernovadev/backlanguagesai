import { Request, Response } from "express";

import { generateTextStreamService } from "../services/ai/generateTextStream";
import { generateWordJson } from "../services/ai/generateWordJson";
import { WordService } from "../services/words/wordService";
import { generateWordExamplesJson } from "../services/ai/generateWordExamplesJson";
import { generateWordExamplesCodeSwithcingJson } from "../services/ai/generateWordExamplesCodeSwithcingJson";
import { generateWordTypesJson } from "../services/ai/generateWordTypesJson";
import { generateWordSynomymsJson } from "../services/ai/generateWordSynomymsJson";
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
 * Generate Image with AI Save in cloudinary and update Word
 */
export const updateImageWord = async (req: Request, res: Response) => {
  const { word, imgOld } = req.body;
  const IDWord = req.params.idword;

  if (!word) {
    return errorResponse(res, "Prompt is required.", 400);
  }

  try {
    // Generate image with DALL·E 3
    const imageBase64 = await generateImage(imageWordPrompt(word));
    if (!imageBase64) {
      return errorResponse(res, "Failed to generate image.", 400);
    }

    let deleteOldImagePromise: Promise<void> = Promise.resolve();

    if (imgOld && imgOld.includes("res.cloudinary.com")) {
      const parts = imgOld.split("/");
      let publicId = parts.pop();

      // Handle casoes where there is not extenxion
      if (publicId.includes(".")) {
        publicId = publicId.split(".")[0]; // Remove extenxion if exist
      }

      // Make sure htat deleteImageFromCloudinary return promise type void
      deleteOldImagePromise = deleteImageFromCloudinary(
        "languagesai/words/" + publicId
      ).then(() => {});
    }

    // Upload new image on parallel whithin removig image
    const [_, urlImage] = await Promise.all([
      deleteOldImagePromise,
      uploadImageToCloudinary(imageBase64, "words"),
    ]);

    // Update image
    const updateImageWord = await wordService.updateWordImg(IDWord, urlImage);

    return successResponse(
      res,
      "Word Image generated successfully",
      updateImageWord
    );
  } catch (error) {
    return errorResponse(res, "Error generating image ", 400, error);
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

export const generateJSONword = async (req: Request, res: Response) => {
  const { prompt, language } = req.body;

  if (!prompt) {
    return errorResponse(res, "Prompt is required.", 400);
  }

  try {
    const json = await generateWordJson(prompt, language);

    const wordStructurefinal = {
      ...json,
      language: "en",
      seen: 1,
      level: "hard",
      img: "",
    };

    const newWord = await wordService.createWord(wordStructurefinal);

    return successResponse(res, "Generate word JSON successfully", newWord);
  } catch (error) {
    return errorResponse(
      res,
      "Error trying to generate JSON word \n" + error,
      500,
      error
    );
  }
};

export const updatedJSONWordExamples = async (req: Request, res: Response) => {
  const { word, language, oldExamples } = req.body;

  if (!word) {
    return errorResponse(res, "Word is required.", 400);
  }
  const IDWord = req.params.idword;
  try {
    const { examples } = await generateWordExamplesJson(
      word,
      language,
      oldExamples
    );

    const updateExamples = await wordService.updateWordExamples(
      IDWord,
      examples
    );

    return successResponse(
      res,
      "updated JSON Word Examples word JSON successfully",
      updateExamples,
      201
    );
  } catch (error) {
    return errorResponse(res, "Error trying to Update JSON Word", 500, error);
  }
};

export const updatedJSONWordExamplesCodeSwitching = async (
  req: Request,
  res: Response
) => {
  const { word, language, oldExamples } = req.body;

  if (!word) {
    return errorResponse(res, "Word is required.", 400);
  }
  const IDWord = req.params.idword;
  try {
    const { codeSwitching } = await generateWordExamplesCodeSwithcingJson(
      word,
      language,
      oldExamples
    );

    const updateExamples = await wordService.updateWordCodeSwitching(
      IDWord,
      codeSwitching
    );

    return successResponse(
      res,
      "updated JSON Code Swithing JSON successfully",
      updateExamples,
      201
    );
  } catch (error) {
    return errorResponse(
      res,
      "Error trying to Update JSON Word Examples ",
      500,
      error
    );
  }
};

export const updatedJSONWordTypes = async (req: Request, res: Response) => {
  const { word, language, oldExamples } = req.body;

  if (!word) {
    return errorResponse(res, "Word is required.", 400);
  }
  const IDWord = req.params.idword;
  try {
    const { type } = await generateWordTypesJson(word, language, oldExamples);

    const updateExamples = await wordService.updateWordType(IDWord, type);

    return successResponse(
      res,
      "updated JSON Types successfully",
      updateExamples,
      201
    );
  } catch (error) {
    return errorResponse(
      res,
      "Error trying to Update JSON Word Types ",
      500,
      error
    );
  }
};

export const updatedJSONWordSynonyms = async (req: Request, res: Response) => {
  const { word, language, oldExamples } = req.body;

  if (!word) {
    return errorResponse(res, "Word is required.", 400);
  }
  const IDWord = req.params.idword;
  try {
    const { sinonyms } = await generateWordSynomymsJson(
      word,
      language,
      oldExamples
    );

    const updateExamples = await wordService.updateWordSynonyms(
      IDWord,
      sinonyms
    );

    return successResponse(
      res,
      "Word Sinonyms generated successfully",
      updateExamples,
      201
    );
  } catch (error) {
    return errorResponse(
      res,
      "Error trying to Update JSON Word Synonyms ",
      500,
      error
    );
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
