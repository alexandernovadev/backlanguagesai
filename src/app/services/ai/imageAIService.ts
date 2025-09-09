/**
 * Centralized service for AI image generation
 * Supports DALL-E (OpenAI) and Google Imagen
 */

import OpenAI from "openai";
import { AI_CONFIG, ImageProvider, DalleModel, GoogleImagenModel } from "../../../config/aiConfig";

// Options for image generation
export interface ImageGenerationOptions {
  size?: "256x256" | "512x512" | "1024x1024" | "1792x1024" | "1024x1792";
  quality?: "standard" | "hd";
  n?: number;
  responseFormat?: "url" | "b64_json";
}

// Generate image with DALL-E
export const generateImageDalle = async (
  prompt: string,
  model: DalleModel = "dall-e-3",
  options: ImageGenerationOptions = {}
) => {
  const client = new OpenAI({
    apiKey: AI_CONFIG.providers.openai.apiKey,
    baseURL: AI_CONFIG.providers.openai.baseURL
  });

  const requestOptions: any = {
    model,
    prompt,
    n: options.n || 1,
    size: options.size || "1024x1024",
    quality: options.quality || "hd",
    response_format: options.responseFormat || "b64_json"
  };

  try {
    const response = await client.images.generate(requestOptions);
    return response.data[0];
  } catch (error) {
    console.error("Error generating image with DALL-E:", error);
    throw new Error(`Error generating image: ${error}`);
  }
};

// Generate image with Google Imagen
export const generateImageGoogle = async (
  prompt: string,
  model: GoogleImagenModel = "imagen-3",
  options: ImageGenerationOptions = {}
) => {
  const config = AI_CONFIG.providers.google;
  
  try {
    const response = await fetch(`${config.baseURL}/models/${model}:generateContent`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 1,
          maxOutputTokens: 4096,
          stopSequences: []
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Google Imagen API error: ${response.status}`);
    }

    const data = await response.json() as any;
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Error generating image with Google Imagen:", error);
    throw new Error(`Error generating image: ${error}`);
  }
};

// Generate image with selected provider
export const generateImage = async (
  provider: ImageProvider,
  prompt: string,
  model?: DalleModel | GoogleImagenModel,
  options: ImageGenerationOptions = {}
) => {
  if (provider === 'openai') {
    return generateImageDalle(prompt, model as DalleModel, options);
  } else if (provider === 'google') {
    return generateImageGoogle(prompt, model as GoogleImagenModel, options);
  } else {
    throw new Error(`Unsupported image provider: ${provider}`);
  }
};
