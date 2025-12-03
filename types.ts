export interface ScriptAnalysis {
  tone: string;
  targetAudience: string;
  keyThemes: string[];
  suggestedTopics: TopicSuggestion[];
}

export interface TopicSuggestion {
  title: string;
  reasoning: string;
}

export enum AppStep {
  INPUT = 'INPUT',
  ANALYZING = 'ANALYZING',
  SELECTION = 'SELECTION',
  GENERATING = 'GENERATING',
  RESULT = 'RESULT'
}

export interface GeneratedScript {
  title: string;
  content: string;
}
