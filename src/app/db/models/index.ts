// 📚 Exportación centralizada de todos los modelos
export { default as User } from './User';
export { default as Word } from './Word';
export { default as Expression } from './Expression';
export { default as Lecture } from './Lecture';

// 🔄 Re-exportar interfaces para uso externo
export type { IUser } from './User';
export type { IWord } from './Word';
export type { IExpression } from './Expression';
export type { ILecture } from './Lecture';