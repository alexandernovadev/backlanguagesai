export type GrammarTopic = 
  | "sentence-basics" | "word-order" | "questions" | "negation"
  | "nouns-pronouns" | "gender-number" | "articles" | "pronouns" | "possessives"
  | "verbs" | "tenses" | "present-simple" | "present-continuous" | "past-simple"
  | "past-continuous" | "future-simple" | "future-continuous" | "present-perfect"
  | "past-perfect" | "future-perfect" | "conditionals" | "subjunctive"
  | "adjectives-adverbs" | "comparatives" | "superlatives" | "adverbs"
  | "prepositions-conjunctions" | "prepositions" | "conjunctions"
  | "passive-voice" | "reported-speech" | "modal-verbs" | "gerunds-infinitives"
  | "relative-clauses" | "conditional-sentences" | "inversion"
  | "emphasis" | "ellipsis" | "substitution" | "cohesion-coherence"
  | "punctuation" | "capitalization" | "spelling" | "word-formation"
  | "register-formality" | "collocations" | "idioms" | "phrasal-verbs"
  | "discourse-markers" | "linking-words" | "paragraph-structure"
  | "text-types" | "academic-writing" | "business-writing" | "creative-writing"
  | "formal-letters" | "informal-letters" | "emails" | "reports"
  | "proposals" | "essays" | "articles" | "reviews" | "summaries"
  | "presentations" | "speeches" | "interviews" | "negotiations"
  | "meetings" | "telephone-conversations" | "social-situations"
  | "complaints" | "apologies" | "requests" | "suggestions" | "opinions"
  | "agreement-disagreement" | "uncertainty" | "probability" | "possibility"
  | "obligation" | "necessity" | "permission" | "prohibition"
  | "advice" | "recommendations" | "warnings" | "threats" | "promises"
  | "offers" | "invitations" | "acceptance" | "refusal" | "excuses"
  | "explanations" | "descriptions" | "narratives" | "instructions"
  | "directions" | "procedures" | "processes" | "comparisons"
  | "contrasts" | "cause-effect" | "problem-solution" | "advantages-disadvantages"
  | "pros-cons" | "for-against" | "supporting-evidence" | "counter-arguments"
  | "conclusions" | "summaries" | "restatements" | "final-thoughts";

export interface GrammarTopicOption {
  value: GrammarTopic;
  label: string;
  children?: GrammarTopicOption[];
}
