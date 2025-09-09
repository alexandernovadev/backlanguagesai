// 📚 Exportación centralizada de todos los tipos de business
export type { Difficulty, DifficultyOption } from './difficulty';
export type { CertificationLevel, CertificationLevelOption } from './certificationLevels';
export type { Language, LanguageOption } from './languages';
export type { UserRole, RoleOption } from './roles';
export type { ChatRole, ChatRoleOption } from './chatRoles';

// Exportar constantes
export { 
  DIFFICULTY_LEVELS, 
  DIFFICULTY_LABELS, 
  DIFFICULTY_OPTIONS 
} from './difficulty';

export { 
  CERTIFICATION_LEVELS, 
  CERTIFICATION_LABELS, 
  CERTIFICATION_LEVEL_OPTIONS 
} from './certificationLevels';

export { 
  SUPPORTED_LANGUAGES, 
  LANGUAGE_LABELS, 
  LANGUAGE_OPTIONS 
} from './languages';

export { 
  USER_ROLES, 
  ROLE_LABELS, 
  ROLE_OPTIONS 
} from './roles';

export { 
  CHAT_ROLES, 
  CHAT_ROLE_LABELS, 
  CHAT_ROLE_OPTIONS 
} from './chatRoles';
