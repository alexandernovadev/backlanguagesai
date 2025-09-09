const difficultyJson = [
  { value: "easy", label: "Fácil" },
  { value: "medium", label: "Medio" },
  { value: "hard", label: "Difícil" },
];

const difficultyList = difficultyJson.map((level) => level.value);

export { difficultyJson, difficultyList };
