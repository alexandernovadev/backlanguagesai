const wordTypesJson = [
  { value: "noun", label: "Noun" },
  { value: "verb", label: "Verb" },
  { value: "auxiliary verb", label: "Auxiliary Verb" },
  { value: "modal verb", label: "Modal Verb" },
  { value: "phrasal verb", label: "Phrasal Verb" },
  { value: "infinitive", label: "Infinitive" },
  { value: "participle", label: "Participle" },
  { value: "gerund", label: "Gerund" },
  { value: "adjective", label: "Adjective" },
  { value: "adverb", label: "Adverb" },
  { value: "pronoun", label: "Pronoun" },
  { value: "preposition", label: "Preposition" },
  { value: "conjunction", label: "Conjunction" },
  { value: "determiner", label: "Determiner" },
  { value: "interjection", label: "Interjection" },
  { value: "particle", label: "Particle" },
];

const wordTypesList = wordTypesJson.map((type) => type.value);

export { wordTypesJson, wordTypesList };
