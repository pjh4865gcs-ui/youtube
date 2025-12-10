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

// Hollywood 기법 관련 타입
export interface HollywoodTechnique {
  name: string;
  description: string;
  examples: string[];
}

export interface ScriptAnalysisResult {
  originalIntent: string;
  detectedEmotion: string;
  targetAudience: string;
  recommendedTechnique: HollywoodTechnique;
  strengthScore: number;
  improvementAreas: string[];
}

export interface NewTopicSuggestion {
  title: string;
  hook: string;
  appliedTechnique: string;
  viralPotential: number;
  reasoning: string;
}

export interface HollywoodScriptResult {
  technique: string;
  structure: {
    act1: string;
    act2: string;
    act3: string;
  };
  fullScript: string;
  keyElements: string[];
}
