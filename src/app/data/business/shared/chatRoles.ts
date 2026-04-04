import { ChatRole } from "../../../../../types/business";

interface ChatRoleOption {
  value: ChatRole;
  label: string;
}

const chatRolesJson: ChatRoleOption[] = [
  { value: "user", label: "Usuario" },
  { value: "assistant", label: "Asistente" },
];

const chatRolesList: ChatRole[] = chatRolesJson.map((role) => role.value);

export { chatRolesJson, chatRolesList };
