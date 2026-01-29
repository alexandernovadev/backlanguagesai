// Grammar topic types for language learning

export type GrammarTopic = string;

export interface GrammarTopicOption {
  value: string;
  label: string;
  children?: Array<{
    value: string;
    label: string;
  }>;
}
