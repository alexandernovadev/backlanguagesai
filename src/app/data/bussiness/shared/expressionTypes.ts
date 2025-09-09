const expressionTypesJson = [
  { value: "idiom", label: "Idioma" },
  { value: "phrase", label: "Frase" },
  { value: "collocation", label: "Colocación" },
  { value: "slang", label: "Jerga" },
  { value: "formal", label: "Formal" },
  { value: "informal", label: "Informal" },
];

const expressionTypesList = expressionTypesJson.map((type) => type.value);

export { expressionTypesJson, expressionTypesList };
