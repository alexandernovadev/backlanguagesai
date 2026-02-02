/**
 * Helper para obtener el provider correcto
 * Prioridad: options.provider > user config > default
 */

import { AIConfigService } from "./aiConfigService";
import { TextProvider } from "../../../config/aiConfig";
import { AIFeature, AIOperation } from "../../../../types/models";

/**
 * Helper que obtiene el provider correcto
 * Prioridad: options.provider > user config > default
 */
export async function getAIProvider(
  userId: string | null | undefined,
  feature: AIFeature,
  operation: AIOperation,
  options?: { provider?: TextProvider }
): Promise<TextProvider> {
  // Si viene explícito en options, usar ese (override manual)
  if (options?.provider) {
    return options.provider;
  }

  // Obtener de configuración del usuario (con caché)
  return await AIConfigService.getProvider(userId, feature, operation);
}
