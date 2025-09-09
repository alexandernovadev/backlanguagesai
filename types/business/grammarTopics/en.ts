export type EnglishGrammarTopic = 
  | "sentence-basics" | "word-order" | "questions" | "negation"
  | "nouns-pronouns" | "gender-number" | "articles" | "pronouns" | "possessives"
  | "adjectives-adverbs" | "adjectives" | "comparatives-superlatives" | "adverbs" | "intensifiers"
  | "verbs-tenses" | "verb-tenses" | "present-simple" | "present-continuous" | "past-simple"
  | "past-continuous" | "future-simple" | "future-continuous" | "present-perfect"
  | "past-perfect" | "future-perfect" | "future-forms"
  | "special-verbs" | "modal-verbs" | "auxiliary-verbs" | "phrasal-verbs" | "conditionals"
  | "passive-voice" | "reported-speech" | "gerunds-infinitives"
  | "sentence-structure" | "clauses" | "relative-clauses" | "if-clauses" | "conjunctions" | "prepositions"
  | "advanced-grammar" | "wish-clauses" | "relative-pronouns" | "inversion" | "subjunctive"
  | "advanced-structures" | "cleft-sentences" | "emphasis-structures" | "fronting"
  | "narrative-tenses" | "future-in-the-past" | "mixed-conditionals" | "formal-passives"
  | "discourse-markers" | "hedging" | "nominalization" | "academic-style"
  | "countable-uncountable";

export interface EnglishGrammarTopicOption {
  value: EnglishGrammarTopic;
  label: string;
  children?: EnglishGrammarTopicOption[];
}
