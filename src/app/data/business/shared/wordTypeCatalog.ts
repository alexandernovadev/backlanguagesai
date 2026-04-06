import type { WordType } from "../../../../../types/business";
import { wordTypesList } from "./wordTypes";

/**
 * Tipos gramaticales permitidos por idioma de la palabra (valores canónicos en BD).
 * "phrasal verb" es categoría típica del inglés; en PT no usamos "modal verb" como categoría nativa en esta app.
 */
const ENGLISH_SPECIFIC: WordType[] = ["phrasal verb"];

const NOT_IN_PORTUGUESE: WordType[] = ["modal verb", "phrasal verb"];

export class WordTypeValidationError extends Error {
  constructor(
    public readonly invalid: string[],
    public readonly language: string
  ) {
    super(
      `Types not allowed for language "${language}": ${invalid.join(", ")}`
    );
    this.name = "WordTypeValidationError";
  }
}

export function getWordTypesForLanguage(language: string): WordType[] {
  if (language === "en") {
    return [...wordTypesList];
  }
  if (language === "pt") {
    return wordTypesList.filter((t) => !NOT_IN_PORTUGUESE.includes(t));
  }
  // es, fr, it and others: general set without phrasal verbs (English as L2)
  return wordTypesList.filter((t) => !ENGLISH_SPECIFIC.includes(t));
}

export function validateWordTypesForLanguage(
  types: string[] | undefined,
  language: string
): { ok: true } | { ok: false; invalid: string[] } {
  if (!types?.length) {
    return { ok: true };
  }
  const allowed = new Set(getWordTypesForLanguage(language));
  const invalid = types.filter((t) => !allowed.has(t as WordType));
  if (invalid.length > 0) {
    return { ok: false, invalid };
  }
  return { ok: true };
}

/** Intersect requested query types with those allowed for the (single) UI language. */
export function filterTypesQueryForLanguage(
  types: string[],
  language: string
): string[] {
  const allowed = new Set(getWordTypesForLanguage(language));
  return types.filter((t) => allowed.has(t as WordType));
}
