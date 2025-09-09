const wordTypesJson = [
  { value: "noun", label: "Substantivo" },
  { value: "verb", label: "Verbo" },
  { value: "auxiliary verb", label: "Verbo Auxiliar" },
  { value: "modal verb", label: "Verbo Modal" },
  { value: "phrasal verb", label: "Verbo Frasal" },
  { value: "infinitive", label: "Infinitivo" },
  { value: "participle", label: "Particípio" },
  { value: "gerund", label: "Gerúndio" },
  { value: "adjective", label: "Adjetivo" },
  { value: "adverb", label: "Advérbio" },
  { value: "pronoun", label: "Pronome" },
  { value: "preposition", label: "Preposição" },
  { value: "conjunction", label: "Conjunção" },
  { value: "determiner", label: "Determinante" },
  { value: "interjection", label: "Interjeição" },
  { value: "particle", label: "Partícula" },
];

const wordTypesList = wordTypesJson.map((type) => type.value);

export { wordTypesJson, wordTypesList };
