// Chat message roles
export type ChatRole = "user" | "assistant";

export const CHAT_ROLES: ChatRole[] = ["user", "assistant"];

export const CHAT_ROLE_LABELS: Record<ChatRole, string> = {
  user: "Usuario",
  assistant: "Asistente"
};

export interface ChatRoleOption {
  value: ChatRole;
  label: string;
}

export const CHAT_ROLE_OPTIONS: ChatRoleOption[] = [
  { value: "user", label: "Usuario" },
  { value: "assistant", label: "Asistente" }
];
