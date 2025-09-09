// 📝 Exportación centralizada de todos los prompts de AI

// Text Generation Prompts
export {
  createTextGenerationPrompt,
  type TextGenerationPromptParams,
} from './textGenerationPrompts';

// Topic Generation Prompts
export {
  createTopicGenerationPrompt,
  type TopicGenerationPromptParams,
} from './topicGenerationPrompts';

// Expression Prompts
export {
  createExpressionGenerationPrompt,
  createExpressionChatPrompt,
  type ExpressionGenerationPromptParams,
  type ExpressionChatPromptParams,
} from './expressionPrompts';

// Word Prompts
export {
  createWordGenerationPrompt,
  createWordChatPrompt,
  createWordSynonymsPrompt,
  createWordTypesPrompt,
  createWordExamplesPrompt,
  createWordCodeSwitchingPrompt,
  type WordGenerationPromptParams,
  type WordChatPromptParams,
  type WordSynonymsPromptParams,
  type WordTypesPromptParams,
  type WordExamplesPromptParams,
  type WordCodeSwitchingPromptParams,
} from './wordPrompts';

// Image Prompts
export {
  createImagePrompt,
  type ImagePromptParams,
} from './imagePrompts';
