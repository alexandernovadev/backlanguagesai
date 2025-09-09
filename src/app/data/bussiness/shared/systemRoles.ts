const systemRolesJson = [
  { value: "admin", label: "Administrador" },
  { value: "teacher", label: "Profesor" },
  { value: "student", label: "Estudiante" },
];

const systemRolesList = systemRolesJson.map((role) => role.value);

export { systemRolesJson, systemRolesList };
