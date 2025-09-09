import { ExpressionType } from "../../../../../types/business";

interface ExpressionTypeOption {
  value: ExpressionType;
  label: string;
}

const expressionTypesJson: ExpressionTypeOption[] = [
  { value: "idiom", label: "Idioma" },
  { value: "phrase", label: "Frase" },
  { value: "collocation", label: "Colocación" },
  { value: "slang", label: "Jerga" },
  { value: "formal", label: "Formal" },
  { value: "informal", label: "Informal" },
];

const expressionTypesList: ExpressionType[] = expressionTypesJson.map((type) => type.value);

export { expressionTypesJson, expressionTypesList };
