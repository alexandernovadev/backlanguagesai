// 📚 Grammar Topics por idioma
export type { EnglishGrammarTopic, EnglishGrammarTopicOption } from './en';
export type { SpanishGrammarTopic, SpanishGrammarTopicOption } from './es';
export type { PortugueseGrammarTopic, PortugueseGrammarTopicOption } from './pt';

// 🌍 Tipo unión para todos los idiomas (por defecto inglés)
export type GrammarTopic = EnglishGrammarTopic;
export type GrammarTopicOption = EnglishGrammarTopicOption;
