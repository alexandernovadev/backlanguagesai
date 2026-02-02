import { generateText } from "./aiService";
import { TextProvider } from "../../../config/aiConfig";
import {
  createLectureTextGenerationPrompt,
  createTopicGenerationPrompt,
  createLectureImagePrompt,
} from "./prompts/lectures";
import { getAIProvider } from "./aiConfigHelper";

export interface LectureTextGenerationOptions {
  provider?: TextProvider;
  userId?: string | null; // Para obtener configuración del usuario
  stream?: boolean;
  [key: string]: any;
}

export const generateLectureText = async (
  params: Parameters<typeof createLectureTextGenerationPrompt>[0],
  options: LectureTextGenerationOptions = {}
) => {
  const provider = await getAIProvider(options.userId, 'lecture', 'text', options);
  const promptData = createLectureTextGenerationPrompt(params);
  
  // Si stream está activado, retornar el stream directamente
  // Para streaming, usamos "text" porque enviamos texto plano, no JSON
  if (options.stream) {
    return generateText(
      provider,
      `${promptData.system}\n\n${promptData.user}`,
      undefined,
      {
        ...options,
        responseFormat: "text",
        temperature: options.temperature || 0.5,
        stream: true,
      }
    );
  }
  
  // Si no es streaming, retornar JSON parseado (comportamiento original)
  const response = await generateText(
    provider,
    `${promptData.system}\n\n${promptData.user}`,
    undefined,
    {
      ...options,
      responseFormat: "json_object",
      temperature: options.temperature || 0.5,
      stream: false,
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
  const provider = await getAIProvider(options.userId, 'lecture', 'topic', options);
  const promptData = createTopicGenerationPrompt(params);
  
  // Si stream está activado, retornar el stream directamente
  if (options.stream) {
    return generateText(
      provider,
      `${promptData.system}\n\n${promptData.user}`,
      undefined,
      {
        ...options,
        responseFormat: "text",
        temperature: options.temperature || 0.7,
        stream: true,
      }
    );
  }
  
  // Si no es streaming, retornar texto (comportamiento original)
  const response = await generateText(
    provider,
    `${promptData.system}\n\n${promptData.user}`,
    undefined,
    {
      ...options,
      responseFormat: "text",
      temperature: options.temperature || 0.7,
      stream: false,
    }
  );
  const content = response.choices[0].message.content;
  if (!content) throw new Error("Completion content is null");
  return content.trim();
};

// Para imágenes, solo retorna el prompt, la generación la hace otro servicio
export { createLectureImagePrompt };
