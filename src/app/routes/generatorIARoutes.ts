import { Router } from "express";
import {
  translateTextStream,
  updateImageExpression,
  generateAudioFromText,
  generateWordJson,
  generateTextStream,
  generateExamStream,
  generateWordExamplesJson,
  generateWordExamplesCodeSwitchingJson,
  generateWordSynomymsJson,
  generateWordTypesJson,
  updateImageLecture,
  updateImageWord,
  generateTopicStream,
} from "../controllers/aiController";

export const generateRoutes = Router();

generateRoutes.post("/generate-text", generateTextStream);
generateRoutes.post("/generate-wordJson", generateWordJson);
generateRoutes.post("/generate-exam", generateExamStream);
generateRoutes.post("/generate-topic-stream", generateTopicStream);
generateRoutes.post("/translate", translateTextStream);

generateRoutes.post("/generate-image-lecture/:idlecture", updateImageLecture);
generateRoutes.post("/generate-image-word/:idword", updateImageWord);
generateRoutes.post("/generate-image-expression/:idexpression", updateImageExpression);

generateRoutes.post("/update-word-examples/:idword", generateWordExamplesJson);
generateRoutes.post(
  "/update-word-examples-code-switching/:idword",
  generateWordExamplesCodeSwitchingJson
);
generateRoutes.post("/update-word-synonyms/:idword", generateWordSynomymsJson);
generateRoutes.post("/update-word-types/:idword", generateWordTypesJson);

generateRoutes.post("/generate-audio-from-text", generateAudioFromText);
