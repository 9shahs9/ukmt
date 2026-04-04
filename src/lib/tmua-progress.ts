import type { TMUAProgress, TMUAPracticeResult, TMUAExamRecord, TMUAExamMode } from "@/lib/tmua-types";
import { isFirebaseConfigured, loadCloudTMUAProgress, saveCloudTMUAProgress } from "@/lib/firebase";

const STORAGE_KEY = "tmua-progress";

export function defaultTMUAProgress(userId: string): TMUAProgress {
  return {
    userId,
    totalAttempted: 0,
    totalCorrect: 0,
    accuracyByTopic: {},
    accuracyByYear: {},
    examHistory: [],
    seenQuestionIds: [],
    streak: 0,
    lastStudyDate: null,
  };
}

export async function loadTMUAProgress(userId: string): Promise<TMUAProgress> {
  if (typeof window === "undefined") return defaultTMUAProgress(userId);

  if (isFirebaseConfigured) {
    try {
      const cloud = await loadCloudTMUAProgress(userId);
      if (cloud) return { ...defaultTMUAProgress(userId), ...cloud };
    } catch { /* fall through */ }
  }

  const raw = window.localStorage.getItem(`${STORAGE_KEY}:${userId}`);
  if (!raw) return defaultTMUAProgress(userId);
  try {
    return { ...defaultTMUAProgress(userId), ...JSON.parse(raw) as TMUAProgress };
  } catch {
    return defaultTMUAProgress(userId);
  }
}

export async function saveTMUAProgress(progress: TMUAProgress): Promise<void> {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(`${STORAGE_KEY}:${progress.userId}`, JSON.stringify(progress));

  if (isFirebaseConfigured) {
    try { await saveCloudTMUAProgress(progress); } catch { /* silent */ }
  }
}

export function updateTMUAProgressAfterExam(
  progress: TMUAProgress,
  mode: TMUAExamMode,
  paper: number | null,
  year: string | null,
  topics: string[],
  results: TMUAPracticeResult[],
  timeUsed: number,
): TMUAProgress {
  const correct = results.filter((r) => r.isCorrect).length;
  const today = new Date().toISOString().slice(0, 10);

  const newAccuracyByTopic = { ...progress.accuracyByTopic };
  for (const topic of topics) {
    const topicResults = results; // all results count toward listed topics
    const prev = newAccuracyByTopic[topic] ?? { attempted: 0, correct: 0 };
    newAccuracyByTopic[topic] = {
      attempted: prev.attempted + topicResults.length,
      correct: prev.correct + topicResults.filter((r) => r.isCorrect).length,
    };
  }

  const newAccuracyByYear = { ...progress.accuracyByYear };
  if (year) {
    const prev = newAccuracyByYear[year] ?? { attempted: 0, correct: 0 };
    newAccuracyByYear[year] = { attempted: prev.attempted + results.length, correct: prev.correct + correct };
  }

  const previousDate = progress.lastStudyDate;
  let streak = progress.streak;
  if (previousDate === today) {
    // same day, keep streak
  } else if (previousDate) {
    const prev = new Date(previousDate);
    const diff = Math.floor((new Date(today).getTime() - prev.getTime()) / 86400000);
    streak = diff === 1 ? streak + 1 : 1;
  } else {
    streak = 1;
  }

  const record: TMUAExamRecord = {
    id: `tmua-${Date.now()}`,
    date: today,
    mode,
    paper,
    year,
    topics,
    score: correct,
    total: results.length,
    timeUsed,
    results,
  };

  const history = [record, ...(progress.examHistory ?? [])].slice(0, 50);

  return {
    ...progress,
    totalAttempted: progress.totalAttempted + results.length,
    totalCorrect: progress.totalCorrect + correct,
    accuracyByTopic: newAccuracyByTopic,
    accuracyByYear: newAccuracyByYear,
    examHistory: history,
    seenQuestionIds: [...new Set([...progress.seenQuestionIds, ...results.map((r) => r.questionId)])],
    streak,
    lastStudyDate: today,
  };
}
