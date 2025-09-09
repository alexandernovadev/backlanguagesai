// Supported languages in the application
export type Language = "es" | "en" | "pt";

export const SUPPORTED_LANGUAGES: Language[] = ["es", "en", "pt"];

export const LANGUAGE_LABELS: Record<Language, string> = {
  es: "Español",
  en: "Inglés", 
  pt: "Portugués"
};

export interface LanguageOption {
  value: Language;
  label: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { value: "es", label: "Español" },
  { value: "en", label: "Inglés" },
  { value: "pt", label: "Portugués" }
];
