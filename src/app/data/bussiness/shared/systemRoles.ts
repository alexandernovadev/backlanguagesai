import { UserRole } from "../../../../../types/business";

interface SystemRoleOption {
  value: UserRole;
  label: string;
}

const systemRolesJson: SystemRoleOption[] = [
  { value: "admin", label: "Administrador" },
  { value: "teacher", label: "Profesor" },
  { value: "student", label: "Estudiante" },
];

const systemRolesList: UserRole[] = systemRolesJson.map((role) => role.value);

export { systemRolesJson, systemRolesList };
