export type TMUAQuestion = {
  id: string;
  year?: string;
  paper?: 1 | 2;
  questionNumber?: number;
  text: string;
  options: Record<string, string>;
  correctAnswer: string;
  workedSolution: string;
  topics: string[];
  topicDisplay: string;
  difficulty: string;
  sourcePdf?: string;
};

export type TMUAQuestionBank = {
  meta: {
    source: string;
    totalQuestions: number;
    topics: string[];
    papers: number[];
    lastUpdated: string;
  };
  questions: TMUAQuestion[];
};

export type TMUAExamMode = "practice" | "timed" | "review";

export type TMUAFilter = {
  years: string[];
  papers: number[];
  topics: string[];
  difficulties: string[];
};

export type TMUAPracticeResult = {
  questionId: string;
  selected: string | null;
  correct: string;
  isCorrect: boolean;
  timeTaken: number;
};

export type TMUAExamRecord = {
  id: string;
  date: string;
  mode: TMUAExamMode;
  paper: number | null;
  year: string | null;
  topics: string[];
  score: number;
  total: number;
  timeUsed: number;
  results: TMUAPracticeResult[];
};

export type TMUAProgress = {
  userId: string;
  totalAttempted: number;
  totalCorrect: number;
  accuracyByTopic: Record<string, { attempted: number; correct: number }>;
  accuracyByYear: Record<string, { attempted: number; correct: number }>;
  examHistory: TMUAExamRecord[];
  seenQuestionIds: string[];
  streak: number;
  lastStudyDate: string | null;
};
