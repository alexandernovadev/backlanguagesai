import { Language } from "../../../../../types/business";

interface LanguageOption {
  value: Language;
  label: string;
}

const languagesJson: LanguageOption[] = [
  { value: "es", label: "Español" },
  { value: "en", label: "Inglés" },
  { value: "pt", label: "Portugués" },
];

const languagesList: Language[] = languagesJson.map((language) => language.value);

export { languagesJson, languagesList };
