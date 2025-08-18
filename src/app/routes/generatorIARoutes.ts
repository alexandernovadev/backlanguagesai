import { Router } from "express";
import {
  generateAudioFromText,
  generateJSONword,
  generateTextStream,
  generateExamStream,
  updatedJSONWordExamples,
  updatedJSONWordExamplesCodeSwitching,
  updatedJSONWordSynonyms,
  updatedJSONWordTypes,
  updateImageLecture,
  updateImageWord,
  generateTopicStream,
} from "../controllers/generateIAController";
import { translateTextStream } from "../controllers/aiController";

export const generateRoutes = Router();

generateRoutes.post("/generate-text", generateTextStream);
generateRoutes.post("/generate-wordJson", generateJSONword);
generateRoutes.post("/generate-exam", generateExamStream);
generateRoutes.post("/generate-topic-stream", generateTopicStream);
generateRoutes.post("/translate", translateTextStream);

generateRoutes.post("/generate-image-lecture/:idlecture", updateImageLecture);
generateRoutes.post("/generate-image-word/:idword", updateImageWord);

generateRoutes.post("/update-word-examples/:idword", updatedJSONWordExamples);
generateRoutes.post("/update-word-examples-code-switching/:idword", updatedJSONWordExamplesCodeSwitching);
generateRoutes.post("/update-word-synonyms/:idword", updatedJSONWordSynonyms);
generateRoutes.post("/update-word-types/:idword", updatedJSONWordTypes);

generateRoutes.post("/generate-audio-from-text", generateAudioFromText);
