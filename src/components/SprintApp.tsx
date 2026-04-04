"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { conceptSheets, topicPlan } from "@/data/mastery-plan";
import {
  defaultProgress,
  loadProgress,
  saveProgress,
  updateProgressAfterSprint,
} from "@/lib/local-progress";
import {
  isFirebaseConfigured,
  subscribeToAuth,
} from "@/lib/firebase";
import { generateForConcept } from "@/lib/question-generator";
import type { PracticeQuestion, PracticeResult, UserProgress } from "@/lib/types";
import { MathText } from "@/components/MathText";

type AppTab = "dashboard" | "learn" | "practice" | "feedback";

type PaperMeta = {
  fileName: string;
  year: number;
  track: string;
  kind: string;
};

type PaperImageEntry = {
  year: number;
  track: string;
  pages: string[];
};

const SPRINT_SECONDS = 20 * 60;

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function topicFromConcept(concept: string): number {
  return conceptSheets.find((c) => c.concept === concept)?.topic ?? 1;
}

export function SprintApp() {
  const [tab, setTab] = useState<AppTab>("dashboard");
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("Student");

  /* ───── Data ───── */
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [paperIndex, setPaperIndex] = useState<PaperMeta[]>([]);
  const [selectedConcept, setSelectedConcept] = useState(conceptSheets[0].concept);
  const [activeSet, setActiveSet] = useState<PracticeQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [proofDrafts, setProofDrafts] = useState<Record<string, string>>({});
  const [results, setResults] = useState<PracticeResult[]>([]);

  const [progress, setProgress] = useState<UserProgress>(defaultProgress("guest"));

  const [secondsLeft, setSecondsLeft] = useState(SPRINT_SECONDS);
  const [timerRunning, setTimerRunning] = useState(false);
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [sprintConcept, setSprintConcept] = useState<string | null>(null);

  /* ───── Paper image browser state ───── */
  const [paperImages, setPaperImages] = useState<Record<string, PaperImageEntry>>({});
  const [selectedPaper, setSelectedPaper] = useState<string | null>(null);
  const [selectedPage, setSelectedPage] = useState(0);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  /* ───── Restore session on mount ───── */
  useEffect(() => {
    if (isFirebaseConfigured) {
      // Use Firebase Auth listener
      const unsub = subscribeToAuth((user) => {
        if (user) {
          setUserId(user.uid);
          setDisplayName(user.displayName ?? user.email?.split("@")[0] ?? "Student");
          loadProgress(user.uid).then((p) => setProgress(p));
        } else {
          setUserId(null);
          setDisplayName("Student");
          setProgress(defaultProgress("guest"));
        }
      });
      return () => unsub();
    }
    // Fallback: localStorage session (no Firebase)
    const stored = window.localStorage.getItem("ukmt-user");
    if (stored) {
      try {
        const u = JSON.parse(stored) as { id: string; name: string };
        setUserId(u.id);
        setDisplayName(u.name);
        loadProgress(u.id).then((p) => setProgress(p));
      } catch { /* ignore */ }
    }
  }, []);

  /* ───── Load question bank ───── */
  useEffect(() => {
    fetch("/data/questions.json")
      .then((res) => res.json())
      .then((data: PracticeQuestion[]) => setQuestions(data))
      .catch(() => setQuestions([]));

    fetch("/data/past-papers.json")
      .then((res) => res.json())
      .then((data: PaperMeta[]) => setPaperIndex(data))
      .catch(() => setPaperIndex([]));

    fetch("/data/paper-images.json")
      .then((res) => res.json())
      .then((data: Record<string, PaperImageEntry>) => {
        setPaperImages(data);
        const first = Object.keys(data).sort().pop();
        if (first) setSelectedPaper(first);
      })
      .catch(() => setPaperImages({}));
  }, []);

  /* ───── Timer ───── */
  useEffect(() => {
    if (!timerRunning) return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerRunning]);

  /* ───── Derived ───── */
  const activeConcept = useMemo(
    () => conceptSheets.find((s) => s.concept === selectedConcept) ?? conceptSheets[0],
    [selectedConcept],
  );

  const accuracy = useMemo(() => {
    if (progress.totalQuestionsAttempted === 0) return 0;
    return Math.round((progress.totalCorrect / progress.totalQuestionsAttempted) * 100);
  }, [progress.totalCorrect, progress.totalQuestionsAttempted]);

  const videoEmbed = useMemo(() => {
    try {
      const parsed = new URL(playlistUrl);
      if (
        parsed.protocol === "https:" &&
        (parsed.hostname === "www.youtube.com" ||
          parsed.hostname === "youtube.com" ||
          parsed.hostname === "youtu.be")
      ) {
        return playlistUrl;
      }
    } catch { /* invalid URL — fall through */ }
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(activeConcept.suggestedVideoQuery)}`;
  }, [activeConcept.suggestedVideoQuery, playlistUrl]);

  const topicCompletion = topicPlan.map((tp) => {
    const conceptsInTopic = conceptSheets.filter((c) => c.topic === tp.id);
    const done = conceptsInTopic.filter((c) => progress.completedConcepts.includes(c.concept)).length;
    return { ...tp, done, total: conceptsInTopic.length, percent: conceptsInTopic.length === 0 ? 0 : Math.round((done / conceptsInTopic.length) * 100) };
  });

  /* ───── Guided session message ───── */
  const guidedMessage = useMemo(() => {
    if (!userId) return null;
    const last = progress.lastConcept;
    const acc = last ? progress.accuracyByConcept[last] : undefined;
    if (!last) {
      return "Welcome! This is your first session. Start with Topic 1 concepts — pick one from the Learn tab, then launch a sprint.";
    }
    if (acc !== undefined && acc < 60) {
      return `Last time you practised "${last}" and scored ${acc}%. Let\u2019s reinforce that topic — select it again below, review the fact sheet, then sprint.`;
    }
    const idx = conceptSheets.findIndex((c) => c.concept === last);
    const next = conceptSheets[idx + 1] ?? conceptSheets[0];
    return `Great work on "${last}" (${acc ?? "?"}%). Today try "${next.concept}" \u2014 read the fact sheet first, then launch a sprint.`;
  }, [userId, progress.lastConcept, progress.accuracyByConcept]);

  /* ───── Sprint builder: concept-focused, fully generated ───── */
  const buildSprint = useCallback(() => {
    const excluded = new Set(progress.seenQuestionIds ?? []);
    const set = generateForConcept(selectedConcept, 20, excluded);
    setSprintConcept(selectedConcept);
    setActiveSet(set);
    setCurrentIdx(0);
    setAnswers({});
    setProofDrafts({});
    setResults([]);
    setSecondsLeft(SPRINT_SECONDS);
    setTimerRunning(true);
    setTab("practice");
  }, [selectedConcept, progress.seenQuestionIds]);

  /* ───── Submit sprint ───── */
  const submitSprint = useCallback(async () => {
    const computed: PracticeResult[] = activeSet.map((q) => ({
      questionId: q.id,
      selected: answers[q.id] ?? null,
      isCorrect: (answers[q.id] ?? null) === q.answer,
    }));
    setResults(computed);
    setTimerRunning(false);
    setTab("feedback");

    if (!userId) return;
    const next = updateProgressAfterSprint(progress, selectedConcept, computed, activeSet);
    setProgress(next);
    await saveProgress(next);
  }, [activeSet, answers, userId, progress, selectedConcept]);

  /* ───── Current question shortcut ───── */
  const currentQ = activeSet[currentIdx] as PracticeQuestion | undefined;

  /* ────────────── RENDER ────────────── */
  return (
    <main className="page-shell">
      {/* Header */}
      <header className="hero">
        <div>
          <p className="kicker">UKMT Mastery</p>
          <h1>The 20-Minute Sprint</h1>
          <p className="subtitle">You gain more marks by doing one question carefully than by guessing.</p>
          <Link href="/" className="btn-secondary-link" style={{ marginTop: ".5rem", display: "inline-block" }}>← Back to Hub</Link>
        </div>
        <div className="timer-box">
          <p>Sprint Timer</p>
          <strong>
            {String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:{String(secondsLeft % 60).padStart(2, "0")}
          </strong>
          <small>{timerRunning ? "Running" : "Stopped"}</small>
        </div>
      </header>

      {/* User display */}
      {userId && (
        <section className="auth-card">
          <div className="signed-in">
            <p>Signed in as <strong>{displayName}</strong></p>
            <Link href="/" className="secondary" style={{ textDecoration: "none" }}>Switch track / Sign out</Link>
          </div>
        </section>
      )}
      {!userId && (
        <section className="auth-card">
          <p className="muted"><Link href="/" style={{ fontWeight: 600 }}>← Sign in on the Hub page</Link> to save your progress.</p>
        </section>
      )}

      {/* Guided session banner */}
      {guidedMessage && userId && (
        <section className="guide-banner">
          <p>{guidedMessage}</p>
        </section>
      )}

      {/* Tabs */}
      <nav className="tabs">
        {(["dashboard", "learn", "feedback"] as const).map((id) => (
          <button
            key={id}
            className={tab === id || (id === "learn" && tab === "practice") ? "active" : ""}
            onClick={() => setTab(id)}
          >
            {id.charAt(0).toUpperCase() + id.slice(1)}
          </button>
        ))}
      </nav>

      {/* ─── DASHBOARD ─── */}
      {tab === "dashboard" && (
        <section className="panel">
          <h2>Mastery Dashboard</h2>
          <div className="stats-row">
            <div className="stat"><span className="stat-val">{accuracy}%</span><span className="stat-lbl">Accuracy</span></div>
            <div className="stat"><span className="stat-val">{progress.completedSprints}</span><span className="stat-lbl">Sprints</span></div>
            <div className="stat"><span className="stat-val">{progress.streak}</span><span className="stat-lbl">Streak</span></div>
          </div>
          <div className="topic-grid">
            {topicCompletion.map((w) => (
              <article key={w.id}>
                <h3>{w.title}</h3>
                <p>{w.focus}</p>
                <div className="progress-bar"><div style={{ width: `${w.percent}%` }} /></div>
                <p className="muted">{w.done}/{w.total} concepts</p>
              </article>
            ))}
          </div>
          <h3>Past Paper Coverage (2011-2025)</h3>
          <p className="muted">Indexed: <strong>{paperIndex.length}</strong> resources</p>
          <div className="chips">
            {paperIndex.slice(0, 16).map((p) => (
              <span key={`${p.fileName}-${p.kind}`}>{p.year} {p.track}</span>
            ))}
          </div>
        </section>
      )}

      {/* ─── LEARN ─── */}
      {tab === "learn" && (
        <section className="panel">
          <h2>Learn Module <span className="muted">(4 Minutes)</span></h2>
          <div className="learn-grid">
            <div>
              <label>Pick today&apos;s concept</label>
              <select value={selectedConcept} onChange={(e) => setSelectedConcept(e.target.value)}>
                {conceptSheets.map((s) => <option key={s.concept} value={s.concept}>Topic {s.topic} — {s.concept}</option>)}
              </select>
              <div className="fact-card">
                <h3>Fact Sheet: {activeConcept.concept}</h3>
                <p>{activeConcept.summary}</p>
                <ul>{activeConcept.keyPoints.map((pt) => <li key={pt}><MathText text={pt} /></li>)}</ul>
                <h4>For Investigation</h4>
                <ul>{activeConcept.forInvestigation.map((pr) => <li key={pr}>{pr}</li>)}</ul>
              </div>
            </div>
            <div>
              <h3>Video Segment <span className="muted">(2 min)</span></h3>
              <input type="url" placeholder="Optional YouTube URL…" value={playlistUrl} onChange={(e) => setPlaylistUrl(e.target.value)} />
              <p className="muted">If blank, opens a concept-specific UKMT search.</p>
              <a className="video-link" href={videoEmbed} target="_blank" rel="noreferrer">Open Video</a>
              <p className="muted">Topic {topicFromConcept(selectedConcept)}</p>
            </div>
          </div>

          <div className="sprint-launch">
            <button className="sprint-btn" onClick={buildSprint}>New Sprint — {selectedConcept}</button>
            <p className="muted">Generates 20 unique questions on this concept.</p>
          </div>

          {/* ─── Past Paper Browser ─── */}
          <div className="paper-browser">
            <h3>Past Paper Diagrams</h3>
            <p className="muted">Browse original question papers for geometry diagrams and worked examples.</p>
            <div className="paper-browser-controls">
              <select
                value={selectedPaper ?? ""}
                onChange={(e) => { setSelectedPaper(e.target.value); setSelectedPage(0); }}
              >
                {Object.entries(paperImages)
                  .sort(([, a], [, b]) => b.year - a.year || a.track.localeCompare(b.track))
                  .map(([slug, info]) => (
                    <option key={slug} value={slug}>{info.year} {info.track} ({info.pages.length} pages)</option>
                  ))}
              </select>
              {selectedPaper && paperImages[selectedPaper] && (
                <div className="page-nav">
                  <button className="secondary" disabled={selectedPage === 0} onClick={() => setSelectedPage((p) => p - 1)}>←</button>
                  <span>Page {selectedPage + 1} / {paperImages[selectedPaper].pages.length}</span>
                  <button className="secondary" disabled={selectedPage >= paperImages[selectedPaper].pages.length - 1} onClick={() => setSelectedPage((p) => p + 1)}>→</button>
                </div>
              )}
            </div>
            {selectedPaper && paperImages[selectedPaper] && (
              <div
                className="paper-page-viewer"
                onClick={() => setLightboxSrc(paperImages[selectedPaper].pages[selectedPage])}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter") setLightboxSrc(paperImages[selectedPaper].pages[selectedPage]); }}
              >
                <Image
                  src={paperImages[selectedPaper].pages[selectedPage]}
                  alt={`${paperImages[selectedPaper].track} ${paperImages[selectedPaper].year} page ${selectedPage + 1}`}
                  width={800}
                  height={1130}
                  style={{ width: "100%", height: "auto" }}
                  priority={false}
                />
              </div>
            )}
          </div>
        </section>
      )}

      {/* ─── PRACTICE — one question at a time ─── */}
      {tab === "practice" && (
        <section className="panel">
          <div className="practice-head">
            <h2>Practice <span className="muted">({activeSet.length > 0 ? `${currentIdx + 1} / ${activeSet.length}` : "20 Problems"})</span></h2>
            <button className="secondary" onClick={() => setTab("learn")}>← Back to Learn</button>
          </div>

          {sprintConcept && activeSet.length > 0 && (
            <div className="sprint-concept-banner">
              <strong>Sprint: {sprintConcept}</strong>
              <span className="muted">Topic {topicFromConcept(sprintConcept)}</span>
            </div>
          )}

          <p className="warning">Calculators and measuring instruments are strictly forbidden.</p>

          {!currentQ ? (
            <div className="empty-state">
              <p>Hit <strong>New Sprint</strong> to generate 20 unique questions.</p>
              <p className="muted">15 Level 1 JMC-style + 5 Level 2 Kangaroo/JMO logic.</p>
            </div>
          ) : (
            <article className={`question-card ${currentQ.difficulty === "level2" ? "hard" : ""}`}>
              <div className="q-header">
                <span className="q-badge">{currentQ.difficulty === "level1" ? "Level 1" : "Level 2"}</span>
                <span className="muted">{currentQ.source} — {currentQ.topic}</span>
              </div>

              <div className="q-stem">
                <MathText text={currentQ.stem} />
                {currentQ.diagramUrl && (
                  <div className="q-diagram">
                    <Image src={currentQ.diagramUrl} alt="Question diagram" width={400} height={300} style={{ width: "100%", height: "auto", maxWidth: 400 }} />
                  </div>
                )}
              </div>

              <div className="options-grid">
                {currentQ.options.map((opt) => {
                  const selected = answers[currentQ.id] === opt.value;
                  return (
                    <button
                      key={`${currentQ.id}-${opt.label}`}
                      className={`option-btn ${selected ? "selected" : ""}`}
                      onClick={() => setAnswers((prev) => ({ ...prev, [currentQ.id]: opt.value }))}
                    >
                      <span className="opt-label">{opt.label}</span> {opt.value}
                    </button>
                  );
                })}
              </div>

              {currentQ.proofPrompt && (
                <div className="proof-section">
                  <p className="muted">Proof training: {currentQ.proofPrompt}</p>
                  <textarea
                    value={proofDrafts[currentQ.id] ?? ""}
                    onChange={(e) => setProofDrafts((prev) => ({ ...prev, [currentQ.id]: e.target.value }))}
                    placeholder="Write your prose-based explanation here…"
                  />
                </div>
              )}

              <div className="q-nav">
                <button className="secondary" disabled={currentIdx === 0} onClick={() => setCurrentIdx((i) => i - 1)}>
                  ← Previous
                </button>
                <div className="q-dots">
                  {activeSet.map((_, i) => (
                    <button
                      key={i}
                      className={`dot ${i === currentIdx ? "current" : ""} ${answers[activeSet[i].id] ? "answered" : ""}`}
                      onClick={() => setCurrentIdx(i)}
                    />
                  ))}
                </div>
                {currentIdx < activeSet.length - 1 ? (
                  <button onClick={() => setCurrentIdx((i) => i + 1)}>Next →</button>
                ) : (
                  <button onClick={submitSprint}>Submit Sprint</button>
                )}
              </div>
            </article>
          )}
        </section>
      )}

      {/* ─── FEEDBACK ─── */}
      {tab === "feedback" && (
        <section className="panel">
          <h2>Feedback &amp; History</h2>

          {/* Current sprint results */}
          {results.length > 0 && (
            <>
              <h3>Latest Sprint</h3>
              <div className="stats-row" style={{ marginBottom: "1rem" }}>
                <div className="stat"><span className="stat-val">{results.filter((r) => r.isCorrect).length}/{results.length}</span><span className="stat-lbl">Score</span></div>
              </div>
              <div className="question-list">
                {activeSet.map((q, idx) => {
                  const r = results.find((r) => r.questionId === q.id);
                  const correct = r?.isCorrect;
                  return (
                    <article key={`fb-${q.id}`} className={correct ? "correct" : "incorrect"}>
                      <h3>Q{idx + 1} — {q.topic}</h3>
                      <p>Your answer: <strong>{r?.selected ?? "—"}</strong> | Correct: <strong>{q.answer}</strong></p>
                      <p><strong>Solution:</strong> <MathText text={q.extendedSolution} /></p>
                      <p><strong>Alternative:</strong> {q.alternativeMethod}</p>
                    </article>
                  );
                })}
              </div>
            </>
          )}

          {/* Sprint history */}
          <h3 style={{ marginTop: "1.5rem" }}>Sprint History</h3>
          {(progress.sprintHistory ?? []).length === 0 ? (
            <p className="muted">No sprints completed yet.</p>
          ) : (
            <div className="history-list">
              {(progress.sprintHistory ?? []).map((rec) => {
                const wrongCount = rec.questions.filter((q) => !q.isCorrect).length;
                return (
                  <details key={rec.id} className="history-entry">
                    <summary className="history-summary">
                      <span className="history-date">{rec.date}</span>
                      <strong>{rec.concept}</strong>
                      <span className={`history-score ${rec.score === rec.total ? "perfect" : wrongCount > rec.total / 2 ? "weak" : ""}`}>
                        {rec.score}/{rec.total}
                      </span>
                      {wrongCount > 0 && <span className="history-badge">{wrongCount} to review</span>}
                    </summary>
                    <div className="question-list" style={{ marginTop: ".5rem" }}>
                      {rec.questions.map((hq, idx) => (
                        <article key={`${rec.id}-${idx}`} className={hq.isCorrect ? "correct" : "incorrect"}>
                          <h3>Q{idx + 1} — {hq.topic}</h3>
                          <p><MathText text={hq.stem} /></p>
                          <p>Your answer: <strong>{hq.selected ?? "—"}</strong> | Correct: <strong>{hq.answer}</strong></p>
                          {!hq.isCorrect && (
                            <>
                              <p><strong>Solution:</strong> <MathText text={hq.extendedSolution} /></p>
                              <p><strong>Alternative:</strong> {hq.alternativeMethod}</p>
                            </>
                          )}
                        </article>
                      ))}
                    </div>
                  </details>
                );
              })}
            </div>
          )}
        </section>
      )}
      {/* ─── Lightbox ─── */}
      {lightboxSrc && (
        <div className="lightbox-overlay" onClick={() => setLightboxSrc(null)} role="dialog" aria-label="Enlarged paper page">
          <button className="lightbox-close" onClick={() => setLightboxSrc(null)} aria-label="Close">×</button>
          <Image
            src={lightboxSrc}
            alt="Paper page (enlarged)"
            width={1200}
            height={1700}
            style={{ maxWidth: "95vw", maxHeight: "95vh", width: "auto", height: "auto", objectFit: "contain" }}
          />
        </div>
      )}
    </main>
  );
}
