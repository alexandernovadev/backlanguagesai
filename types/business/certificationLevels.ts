// CEFR Certification levels (A1-C2)
export type CertificationLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export const CERTIFICATION_LEVELS: CertificationLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export const CERTIFICATION_LABELS: Record<CertificationLevel, string> = {
  A1: "A1 - Beginner",
  A2: "A2 - Elementary", 
  B1: "B1 - Intermediate",
  B2: "B2 - Upper Intermediate",
  C1: "C1 - Advanced",
  C2: "C2 - Proficient"
};

export interface CertificationLevelOption {
  value: CertificationLevel;
  label: string;
}

export const CERTIFICATION_LEVEL_OPTIONS: CertificationLevelOption[] = [
  { value: "A1", label: "A1" },
  { value: "A2", label: "A2" },
  { value: "B1", label: "B1" },
  { value: "B2", label: "B2" },
  { value: "C1", label: "C1" },
  { value: "C2", label: "C2" }
];
