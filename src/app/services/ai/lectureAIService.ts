import { generateText } from "./aiService";
import { TextProvider } from "../../../config/aiConfig";
import {
  createLectureTextGenerationPrompt,
  createTopicGenerationPrompt,
  createLectureImagePrompt,
} from "./prompts/lectures";

export interface LectureTextGenerationOptions {
  provider?: TextProvider;
  [key: string]: any;
}

export const generateLectureText = async (
  params: Parameters<typeof createLectureTextGenerationPrompt>[0],
  options: LectureTextGenerationOptions = {}
) => {
  const provider = options.provider || "openai";
  const promptData = createLectureTextGenerationPrompt(params);
  const response = await generateText(
    provider,
    `${promptData.system}\n\n${promptData.user}`,
    undefined,
    {
      ...options,
      responseFormat: "json_object",
      temperature: options.temperature || 0.5,
    }
  );
  const content = response.choices[0].message.content;
  if (!content) throw new Error("Completion content is null");
  return JSON.parse(content);
};

export const generateLectureTopic = async (
  params: Parameters<typeof createTopicGenerationPrompt>[0],
  options: LectureTextGenerationOptions = {}
) => {
  const provider = options.provider || "openai";
  const promptData = createTopicGenerationPrompt(params);
  const response = await generateText(
    provider,
    `${promptData.system}\n\n${promptData.user}`,
    undefined,
    {
      ...options,
      responseFormat: "text",
      temperature: options.temperature || 0.7,
    }
  );
  const content = response.choices[0].message.content;
  if (!content) throw new Error("Completion content is null");
  return content.trim();
};

// Para imágenes, solo retorna el prompt, la generación la hace otro servicio
export { createLectureImagePrompt };
