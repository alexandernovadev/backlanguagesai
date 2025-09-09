import { Skill } from "../../../../../types/business";

interface SkillOption {
  value: Skill;
  label: string;
}

const skillsJson: SkillOption[] = [
  { value: "listening", label: "Comprensión auditiva" },
  { value: "reading", label: "Comprensión lectora" },
  { value: "writing", label: "Expresión escrita" },
  { value: "speaking", label: "Expresión oral" },
];

const skillsList: Skill[] = skillsJson.map((skill) => skill.value);

export { skillsJson, skillsList };
