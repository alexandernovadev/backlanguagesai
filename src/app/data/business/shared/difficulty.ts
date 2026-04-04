import { Difficulty } from "../../../../../types/business";

interface DifficultyOption {
  value: Difficulty;
  label: string;
}

const difficultyJson: DifficultyOption[] = [
  { value: "easy", label: "Fácil" },
  { value: "medium", label: "Medio" },
  { value: "hard", label: "Difícil" },
];

const difficultyList: Difficulty[] = difficultyJson.map((level) => level.value);

export { difficultyJson, difficultyList };
