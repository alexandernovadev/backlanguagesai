// User roles in the application
export type UserRole = "admin" | "teacher" | "student";

export const USER_ROLES: UserRole[] = ["admin", "teacher", "student"];

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador",
  teacher: "Profesor", 
  student: "Estudiante"
};

export interface RoleOption {
  value: UserRole;
  label: string;
}

export const ROLE_OPTIONS: RoleOption[] = [
  { value: "admin", label: "Administrador" },
  { value: "teacher", label: "Profesor" },
  { value: "student", label: "Estudiante" }
];
