const skillsJson = [
  { value: "listening", label: "Comprensión auditiva" },
  { value: "reading", label: "Comprensión lectora" },
  { value: "writing", label: "Expresión escrita" },
  { value: "speaking", label: "Expresión oral" },
];

const skillsList = skillsJson.map((skill) => skill.value);

export { skillsJson, skillsList };
