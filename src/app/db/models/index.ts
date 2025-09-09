// 📚 Exportación centralizada de todos los modelos
export { default as User } from './User';
export { default as Word } from './Word';
export { default as Expression } from './Expression';
export { default as Lecture } from './Lecture';

// 🔄 Re-exportar interfaces para uso externo (desde types/models)
export type { IUser, IWord, IExpression, ILecture, ChatMessage } from '../../../../types/models';