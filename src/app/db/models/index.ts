// 📚 Exportación centralizada de todos los modelos
export { default as User } from './User';
export { default as Word } from './Word';
export { default as Expression } from './Expression';
export { default as Lecture } from './Lecture';
export { default as Question } from './Question';
export { default as Exam } from './Exam';
export { default as ExamAttempt } from './ExamAttempt';

// 🔄 Re-exportar interfaces para uso externo
export type { IUser } from './User';
export type { IWord } from './Word';
export type { IExpression } from './Expression';
export type { ILecture } from './Lecture';
export type { IQuestion } from './Question';
export type { IExam } from './Exam';
export type { IExamAttempt } from './ExamAttempt'; 