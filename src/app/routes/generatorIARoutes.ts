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

export const generateRoutes = Router();

generateRoutes.post("/generate-text", generateTextStream);
generateRoutes.post("/generate-wordJson", generateJSONword);
generateRoutes.post("/generate-exam", generateExamStream);
generateRoutes.post("/generate-topic-stream", generateTopicStream);

generateRoutes.post("/generate-image-lecture/:idlecture", updateImageLecture);
generateRoutes.post("/generate-image-word/:idword", updateImageWord);

generateRoutes.post("/update-word-examples", updatedJSONWordExamples);
generateRoutes.post("/update-word-examples-code-switching", updatedJSONWordExamplesCodeSwitching);
generateRoutes.post("/update-word-synonyms", updatedJSONWordSynonyms);
generateRoutes.post("/update-word-types", updatedJSONWordTypes);

generateRoutes.post("/generate-audio-from-text", generateAudioFromText);
