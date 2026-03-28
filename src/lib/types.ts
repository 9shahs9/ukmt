export type TopicPlan = {
  id: number;
  title: string;
  focus: string;
  goals: string[];
};

export type ConceptFactSheet = {
  concept: string;
  summary: string;
  keyPoints: string[];
  forInvestigation: string[];
  suggestedVideoQuery: string;
  topic: 1 | 2 | 3 | 4;
};

export type OptionItem = {
  label: string;
  value: string;
};

export type Difficulty = "level1" | "level2";

export type PracticeQuestion = {
  id: string;
  year: number;
  source: string;
  difficulty: Difficulty;
  topic: string;
  stem: string;
  options: OptionItem[];
  answer: string;
  extendedSolution: string;
  alternativeMethod: string;
  proofPrompt?: string;
  diagramUrl?: string;
  generated?: boolean;
};

export type PracticeResult = {
  questionId: string;
  selected: string | null;
  isCorrect: boolean;
};

export type SprintRecord = {
  id: string;
  date: string;
  concept: string;
  score: number;
  total: number;
  questions: {
    stem: string;
    topic: string;
    answer: string;
    selected: string | null;
    isCorrect: boolean;
    extendedSolution: string;
    alternativeMethod: string;
  }[];
};

export type UserProgress = {
  userId: string;
  completedConcepts: string[];
  completedSprints: number;
  streak: number;
  lastStudyDate: string | null;
  lastConcept: string | null;
  accuracyByConcept: Record<string, number>;
  totalQuestionsAttempted: number;
  totalCorrect: number;
  seenQuestionIds: string[];
  sprintHistory: SprintRecord[];
};
