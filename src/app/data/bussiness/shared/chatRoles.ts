const chatRolesJson = [
  { value: "user", label: "Usuario" },
  { value: "assistant", label: "Asistente" },
];

const chatRolesList = chatRolesJson.map((role) => role.value);

export { chatRolesJson, chatRolesList };
