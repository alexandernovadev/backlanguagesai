export type SpanishGrammarTopic = 
  | "sentence-basics" | "word-order" | "questions" | "negation"
  | "nouns-pronouns" | "gender-number" | "articles" | "pronouns" | "possessives"
  | "adjectives-adverbs" | "adjectives" | "comparatives-superlatives" | "adverbs" | "intensifiers"
  | "verbs-tenses" | "present-indicative" | "past-indicative" | "future-indicative" | "conditional"
  | "present-subjunctive" | "past-subjunctive" | "imperative" | "gerund" | "participle"
  | "special-verbs" | "ser-estar" | "haber" | "reflexive-verbs" | "modal-verbs"
  | "passive-voice" | "reported-speech"
  | "sentence-structure" | "clauses" | "relative-clauses" | "conditional-clauses" | "conjunctions" | "prepositions"
  | "advanced-grammar" | "subjunctive-uses" | "conditional-complex" | "relative-pronouns" | "inversion" | "ellipsis"
  | "advanced-structures" | "cleft-sentences" | "emphasis-structures" | "fronting"
  | "narrative-tenses" | "discourse-markers" | "hedging" | "nominalization" | "academic-style";

export interface SpanishGrammarTopicOption {
  value: SpanishGrammarTopic;
  label: string;
  children?: SpanishGrammarTopicOption[];
}
