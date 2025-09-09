// Difficulty levels for words, expressions, and lectures
export type Difficulty = "easy" | "medium" | "hard";

export const DIFFICULTY_LEVELS: Difficulty[] = ["easy", "medium", "hard"];

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Fácil",
  medium: "Medio", 
  hard: "Difícil"
};

export interface DifficultyOption {
  value: Difficulty;
  label: string;
}

export const DIFFICULTY_OPTIONS: DifficultyOption[] = [
  { value: "easy", label: "Fácil" },
  { value: "medium", label: "Medio" },
  { value: "hard", label: "Difícil" }
];
