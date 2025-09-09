const certificationLevelsJson = [
  { value: "A1", label: "A1" },
  { value: "A2", label: "A2" },
  { value: "B1", label: "B1" },
  { value: "B2", label: "B2" },
  { value: "C1", label: "C1" },
  { value: "C2", label: "C2" },
];

const certificationLevelsList = certificationLevelsJson.map(
  (level) => level.value
);

export { certificationLevelsJson, certificationLevelsList };