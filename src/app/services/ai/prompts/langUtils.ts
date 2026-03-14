import { languagesJson } from "../../../data/bussiness/shared";

const LABEL_MAP = Object.fromEntries(
  languagesJson.map((l) => [l.value, l.promptLabel])
);

export const getLangLabel = (code: string): string =>
  LABEL_MAP[code] || "English";
