/**
 * Helper to resolve the correct AI provider
 * Priority: options.provider > user config > default
 */

import { AIConfigService } from "./aiConfigService";
import { TextProvider } from "../../../config/aiConfig";
import { AIFeature, AIOperation } from "../../../../types/models";

/**
 * Resolves the correct AI provider for a given feature/operation
 * Priority: options.provider > user config > default
 */
export async function getAIProvider(
  userId: string | null | undefined,
  feature: AIFeature,
  operation: AIOperation,
  options?: { provider?: TextProvider }
): Promise<TextProvider> {
  // Explicit provider in options takes precedence
  if (options?.provider) {
    return options.provider;
  }

  // Fall through to user config
  return await AIConfigService.getProvider(userId, feature, operation);
}
