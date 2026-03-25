import { Language } from "../../../../../types/business";

export interface LanguageOption {
  value: Language;
  label: string;
  /** English name for AI prompts (e.g. "Spanish", "English") */
  promptLabel: string;
}

const languagesJson: LanguageOption[] = [
  { value: "es", label: "Español", promptLabel: "Spanish" },
    { value: "pt", label: "Portugués", promptLabel: "Portuguese" },
  { value: "it", label: "Italiano", promptLabel: "Italian" },
  { value: "fr", label: "Francés", promptLabel: "French" },
];

const languagesList: Language[] = languagesJson.map((language) => language.value);

export { languagesJson, languagesList };
