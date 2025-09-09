// 📚 Exportación centralizada de datos compartidos entre idiomas
export { topicsJson, topicsList } from './topics';
export { skillsJson, skillsList } from './skills';
export { certificationLevelsJson, certificationLevelsList } from './certificationLevels';
export { difficultyJson, difficultyList } from './difficulty';
export { languagesJson, languagesList } from './languages';
export { expressionTypesJson, expressionTypesList } from './expressionTypes';
export { chatRolesJson, chatRolesList } from './chatRoles';
export { readingTypesJson, readingTypesList } from './readingTypes';
export { systemRolesJson, systemRolesList } from './systemRoles';
export { wordTypesJson, wordTypesList } from './wordTypes';

// 📝 Re-exportar tipos de business para conveniencia
export type { 
  Topic, Skill, WordType, ExpressionType, ReadingType, 
  Difficulty, CertificationLevel, Language, UserRole, ChatRole,
  GrammarTopic, GrammarTopicOption 
} from '../../../../../types/business';
