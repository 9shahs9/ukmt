import type { PracticeQuestion, PracticeResult, UserProgress } from "@/lib/types";
import { isFirebaseConfigured, loadCloudProgress, saveCloudProgress } from "@/lib/firebase";

const STORAGE_KEY = "ukmt-progress";

export const defaultProgress = (userId: string): UserProgress => ({
  userId,
  completedConcepts: [],
  completedSprints: 0,
  streak: 0,
  lastStudyDate: null,
  lastConcept: null,
  accuracyByConcept: {},
  totalQuestionsAttempted: 0,
  totalCorrect: 0,
  seenQuestionIds: [],
  sprintHistory: [],
});

/** Load progress: Firestore first, fall back to localStorage.
 *  If Firestore is empty but localStorage has data, migrate it up. */
export async function loadProgress(userId: string): Promise<UserProgress> {
  if (typeof window === "undefined") return defaultProgress(userId);

  if (isFirebaseConfigured) {
    try {
      const cloud = await loadCloudProgress(userId);
      if (cloud) {
        // Cloud data exists — use it and sync to localStorage
        const merged = { ...defaultProgress(userId), ...cloud };
        window.localStorage.setItem(`${STORAGE_KEY}:${userId}`, JSON.stringify(merged));
        return merged;
      }
    } catch (err) { console.error("[UKMT] Firestore load failed:", err); }
  }

  // Fall back to localStorage
  const raw = window.localStorage.getItem(`${STORAGE_KEY}:${userId}`);
  if (!raw) return defaultProgress(userId);
  try {
    const local = { ...defaultProgress(userId), ...JSON.parse(raw) as UserProgress };
    // Migrate localStorage data to Firestore if available
    if (isFirebaseConfigured && local.totalQuestionsAttempted > 0) {
      saveCloudProgress(local).then(() => console.log("[UKMT] Migrated localStorage progress to Firestore"))
        .catch((err) => console.error("[UKMT] Migration to Firestore failed:", err));
    }
    return local;
  } catch {
    return defaultProgress(userId);
  }
}

/** Save progress: Firestore + localStorage */
export async function saveProgress(progress: UserProgress): Promise<void> {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(`${STORAGE_KEY}:${progress.userId}`, JSON.stringify(progress));

  if (isFirebaseConfigured) {
    try { await saveCloudProgress(progress); } catch (err) { console.error("[UKMT] Firestore save failed:", err); }
  }
}

export function updateProgressAfterSprint(
  progress: UserProgress,
  concept: string,
  results: PracticeResult[],
  questions?: PracticeQuestion[],
): UserProgress {
  const correct = results.filter((r) => r.isCorrect).length;
  const attempted = results.length;
  const today = new Date().toISOString().slice(0, 10);

  const previousDate = progress.lastStudyDate;
  let streak = progress.streak;

  if (!previousDate) {
    streak = 1;
  } else {
    const prev = new Date(previousDate);
    const now = new Date(today);
    const dayDiff = Math.round((now.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
    if (dayDiff === 1) streak += 1;
    else if (dayDiff > 1) streak = 1;
  }

  return {
    ...progress,
    completedConcepts: progress.completedConcepts.includes(concept)
      ? progress.completedConcepts
      : [...progress.completedConcepts, concept],
    completedSprints: progress.completedSprints + 1,
    streak,
    lastStudyDate: today,
    lastConcept: concept,
    accuracyByConcept: {
      ...progress.accuracyByConcept,
      [concept]: attempted > 0 ? Math.round((correct / attempted) * 100) : 0,
    },
    totalQuestionsAttempted: progress.totalQuestionsAttempted + attempted,
    totalCorrect: progress.totalCorrect + correct,
    seenQuestionIds: [
      ...new Set([...progress.seenQuestionIds, ...results.map((r) => r.questionId)]),
    ],
    sprintHistory: [
      {
        id: `sprint-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        date: today,
        concept,
        score: correct,
        total: attempted,
        questions: results.map((r) => {
          const q = questions?.find((qq) => qq.id === r.questionId);
          return {
            stem: q?.stem ?? "",
            topic: q?.topic ?? concept,
            answer: q?.answer ?? "",
            selected: r.selected,
            isCorrect: r.isCorrect,
            extendedSolution: q?.extendedSolution ?? "",
            alternativeMethod: q?.alternativeMethod ?? "",
          };
        }),
      },
      ...(progress.sprintHistory ?? []),
    ].slice(0, 50),
  };
}
