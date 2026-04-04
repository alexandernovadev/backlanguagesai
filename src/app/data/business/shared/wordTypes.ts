import { WordType } from "../../../../../types/business";

interface WordTypeOption {
  value: WordType;
  label: string;
}

const wordTypesJson: WordTypeOption[] = [
  { value: "noun", label: "Sustantivo" },
  { value: "verb", label: "Verbo" },
  { value: "auxiliary verb", label: "Verbo Auxiliar" },
  { value: "modal verb", label: "Verbo Modal" },
  { value: "phrasal verb", label: "Verbo Frasal" },
  { value: "infinitive", label: "Infinitivo" },
  { value: "participle", label: "Participio" },
  { value: "gerund", label: "Gerundio" },
  { value: "adjective", label: "Adjetivo" },
  { value: "adverb", label: "Adverbio" },
  { value: "pronoun", label: "Pronombre" },
  { value: "preposition", label: "Preposición" },
  { value: "conjunction", label: "Conjunción" },
  { value: "determiner", label: "Determinante" },
  { value: "interjection", label: "Interjección" },
  { value: "particle", label: "Partícula" },
];

const wordTypesList: WordType[] = wordTypesJson.map((type) => type.value);

export { wordTypesJson, wordTypesList };
