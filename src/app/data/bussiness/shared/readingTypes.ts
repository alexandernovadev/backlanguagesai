const readingTypesJson = [
  { value: "analysis", label: "Análisis" },
  { value: "argumentative", label: "Argumentativo" },
  { value: "narrative", label: "Narrativo" },
  { value: "descriptive", label: "Descriptivo" },
  { value: "expository", label: "Expositivo" },
  { value: "persuasive", label: "Persuasivo" },
  { value: "creative", label: "Creativo" },
  { value: "technical", label: "Técnico" },
  { value: "scientific", label: "Científico" },
  { value: "historical", label: "Histórico" },
  { value: "biographical", label: "Biográfico" },
  { value: "fiction", label: "Ficción" },
  { value: "review", label: "Reseña" },
  { value: "report", label: "Reporte" },
  { value: "case_study", label: "Estudio de Caso" },
  { value: "tutorial", label: "Tutorial" },
  { value: "speech", label: "Discurso" },
  { value: "poetry", label: "Poesía" },
  { value: "dialogue", label: "Diálogo" },
  { value: "letter", label: "Carta" },
  { value: "instructions", label: "Instrucciones" },
  { value: "guide", label: "Guía" },
  { value: "chronicle", label: "Crónica" },
  { value: "blog", label: "Blog" },
];

const readingTypesList = readingTypesJson.map((type) => type.value);

export { readingTypesJson, readingTypesList };
