"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { TMUA_TOPICS, TMUA_PAST_PAPER_PDFS } from "@/data/tmua-data";
import {
  defaultTMUAProgress,
  loadTMUAProgress,
  saveTMUAProgress,
  updateTMUAProgressAfterExam,
} from "@/lib/tmua-progress";
import type { TMUAQuestion, TMUAQuestionBank, TMUAExamMode, TMUAPracticeResult, TMUAProgress } from "@/lib/tmua-types";
import { MathText } from "@/components/MathText";
import Link from "next/link";

type AppTab = "dashboard" | "learn" | "practice" | "feedback";

const SPRINT_SECONDS = 75 * 60;

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function TMUAApp() {
  const [tab, setTab] = useState<AppTab>("dashboard");
  const [bank, setBank] = useState<TMUAQuestionBank | null>(null);
  const [progress, setProgress] = useState<TMUAProgress>(defaultTMUAProgress("tmua-guest"));
  const [userId] = useState(() => {
    if (typeof window === "undefined") return "tmua-guest";
    const stored = window.localStorage.getItem("ukmt-user");
    if (stored) {
      try { return (JSON.parse(stored) as { id: string }).id; } catch { /* */ }
    }
    return "tmua-guest";
  });

  /* ───── Learn state ───── */
  const [selectedTopic, setSelectedTopic] = useState<string>(TMUA_TOPICS[0].id);
  const [filterYear, setFilterYear] = useState<string>("all");
  const [filterPaper, setFilterPaper] = useState<string>("all");

  /* ───── Sprint / Practice state ───── */
  const [examMode, setExamMode] = useState<TMUAExamMode>("practice");
  const [activeQuestions, setActiveQuestions] = useState<TMUAQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<TMUAPracticeResult[]>([]);
  const [sprintTopic, setSprintTopic] = useState<string | null>(null);

  /* ───── Timer ───── */
  const [secondsLeft, setSecondsLeft] = useState(SPRINT_SECONDS);
  const [timerRunning, setTimerRunning] = useState(false);
  const [examStartTime, setExamStartTime] = useState(0);

  /* ───── Load data ───── */
  useEffect(() => {
    fetch("/data/tmua-questions.json")
      .then((r) => r.json())
      .then((data: TMUAQuestionBank) => setBank(data))
      .catch(() => setBank(null));
  }, []);

  useEffect(() => {
    loadTMUAProgress(userId).then((p) => setProgress(p));
  }, [userId]);

  /* ───── Timer tick ───── */
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
    return () => clearInterval(id);
  }, [timerRunning]);

  /* ───── Auto-submit on timeout ───── */
  useEffect(() => {
    if (timerRunning || secondsLeft > 0 || activeQuestions.length === 0 || results.length > 0) return;
    submitSprint();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, timerRunning]);

  /* ───── Derived ───── */
  const allQuestions = useMemo(() => bank?.questions ?? [], [bank]);

  const activeTopic = useMemo(
    () => TMUA_TOPICS.find((t) => t.id === selectedTopic) ?? TMUA_TOPICS[0],
    [selectedTopic],
  );

  const accuracy = useMemo(() => {
    if (progress.totalAttempted === 0) return 0;
    return Math.round((progress.totalCorrect / progress.totalAttempted) * 100);
  }, [progress.totalCorrect, progress.totalAttempted]);

  const topicCompletion = useMemo(() =>
    TMUA_TOPICS.map((t) => {
      const stats = progress.accuracyByTopic[t.id];
      const pct = stats && stats.attempted > 0 ? Math.round((stats.correct / stats.attempted) * 100) : 0;
      const attempted = stats?.attempted ?? 0;
      return { ...t, pct, attempted };
    }),
  [progress.accuracyByTopic]);

  /* ───── Guided session message ───── */
  const guidedMessage = useMemo(() => {
    const last = progress.examHistory[0];
    if (!last) {
      return "Welcome! Start with a topic from the Learn tab. Read the key points, then launch a sprint to practice.";
    }
    const lastTopics = last.topics.join(", ");
    if (last.total > 0 && (last.score / last.total) < 0.6) {
      return `Last session on ${lastTopics}: ${last.score}/${last.total}. Let\u2019s reinforce that topic \u2014 review the fact sheet, then sprint again.`;
    }
    return `Great work on ${lastTopics} (${last.score}/${last.total}). Try a new topic today or push for a timed exam.`;
  }, [progress.examHistory]);

  const currentQ = activeQuestions[currentIdx] as TMUAQuestion | undefined;

  const formatTime = (secs: number) =>
    `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`;

  /* ───── Sprint builder ───── */
  const buildSprint = useCallback((mode: TMUAExamMode) => {
    let qs = allQuestions.filter((q) => q.topics.includes(selectedTopic));
    if (filterYear !== "all") qs = qs.filter((q) => q.year === filterYear);
    if (filterPaper !== "all") qs = qs.filter((q) => q.paper === Number(filterPaper));

    const excluded = new Set(progress.seenQuestionIds ?? []);
    const unseen = qs.filter((q) => !excluded.has(q.id));
    const pool = unseen.length >= 10 ? unseen : qs;
    const set = shuffle(pool).slice(0, 20);

    setExamMode(mode);
    setSprintTopic(selectedTopic);
    setActiveQuestions(set);
    setCurrentIdx(0);
    setAnswers({});
    setResults([]);

    if (mode === "timed") {
      setSecondsLeft(SPRINT_SECONDS);
      setTimerRunning(true);
    } else {
      setTimerRunning(false);
    }
    setExamStartTime(Date.now());
    setTab("practice");
  }, [allQuestions, selectedTopic, filterYear, filterPaper, progress.seenQuestionIds]);

  /* ───── Submit sprint ───── */
  const submitSprint = useCallback(() => {
    const computed: TMUAPracticeResult[] = activeQuestions.map((q) => ({
      questionId: q.id,
      selected: answers[q.id] ?? null,
      correct: q.correctAnswer,
      isCorrect: (answers[q.id] ?? null) === q.correctAnswer,
      timeTaken: 0,
    }));
    setResults(computed);
    setTimerRunning(false);
    setTab("feedback");

    const topics = [...new Set(activeQuestions.flatMap((q) => q.topics))];
    const year = activeQuestions[0]?.year ?? null;
    const paper = activeQuestions[0]?.paper ?? null;
    const timeUsed = Math.round((Date.now() - examStartTime) / 1000);

    const next = updateTMUAProgressAfterExam(progress, examMode, paper, year, topics, computed, timeUsed);
    setProgress(next);
    saveTMUAProgress(next);
  }, [activeQuestions, answers, examMode, examStartTime, progress]);

  /* ───── Option helpers ───── */
  const optionKeys = (q: TMUAQuestion) =>
    Object.entries(q.options).filter(([, v]) => v.trim() !== "").map(([k]) => k);

  /* ════════════════ RENDER ════════════════ */
  return (
    <main className="page-shell">
      {/* ─── Header ─── */}
      <header className="hero tmua-hero">
        <div>
          <p className="kicker">TMUA Trainer</p>
          <h1>Crack the Cambridge Maths Test</h1>
          <p className="subtitle">360+ past paper questions · Worked solutions · Timed exam simulation</p>
          <Link href="/" className="btn-secondary-link" style={{ marginTop: ".5rem", display: "inline-block" }}>← Back to Hub</Link>
        </div>
        <div className="timer-box tmua-timer">
          <p>Sprint Timer</p>
          <strong>{formatTime(secondsLeft)}</strong>
          <small>{timerRunning ? "Running" : "Stopped"}</small>
        </div>
      </header>

      {/* ─── Guided session banner ─── */}
      {guidedMessage && (
        <section className="guide-banner">
          <p>{guidedMessage}</p>
        </section>
      )}

      {/* ─── Tabs: Dashboard, Learn, Feedback (matching UKMT) ─── */}
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

      {/* ═══════ DASHBOARD ═══════ */}
      {tab === "dashboard" && (
        <section className="panel">
          <h2>TMUA Dashboard</h2>

          {!bank ? (
            <p>Loading question bank…</p>
          ) : (
            <>
              <div className="stats-row">
                <div className="stat"><span className="stat-val">{accuracy}%</span><span className="stat-lbl">Accuracy</span></div>
                <div className="stat"><span className="stat-val">{progress.examHistory.length}</span><span className="stat-lbl">Sprints</span></div>
                <div className="stat"><span className="stat-val">{progress.streak}</span><span className="stat-lbl">Streak</span></div>
              </div>

              <div className="topic-grid">
                {topicCompletion.map((t) => (
                  <article key={t.id}>
                    <h3>{t.label}</h3>
                    <p>{t.description}</p>
                    <div className="progress-bar"><div style={{ width: `${t.pct}%` }} /></div>
                    <p className="muted">{t.pct}% accuracy · {t.attempted} attempted</p>
                  </article>
                ))}
              </div>

              <h3>Past Paper Coverage (Specimen–2023)</h3>
              <p className="muted">Indexed: <strong>{allQuestions.length}</strong> questions across {bank.meta.years.length} years</p>
              <div className="chips">
                {(bank.meta.years ?? []).map((y) => {
                  const count = allQuestions.filter((q) => q.year === y).length;
                  return <span key={y}>{y} ({count})</span>;
                })}
              </div>
            </>
          )}
        </section>
      )}

      {/* ═══════ LEARN ═══════ */}
      {tab === "learn" && (
        <section className="panel">
          <h2>Learn Module <span className="muted">(Review &amp; Sprint)</span></h2>

          <div className="learn-grid">
            {/* Left column: Topic selector + fact sheet */}
            <div>
              <label>Pick today&apos;s topic</label>
              <select value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)}>
                {TMUA_TOPICS.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>

              <div className="fact-card">
                <h3>Fact Sheet: {activeTopic.label}</h3>
                <p>{activeTopic.description}</p>
                <ul>
                  {activeTopic.keyPoints.map((pt) => (
                    <li key={pt}><MathText text={pt} /></li>
                  ))}
                </ul>
                <h4>For Investigation</h4>
                <ul>
                  {activeTopic.forInvestigation.map((pr) => (
                    <li key={pr}>{pr}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right column: Filters + past paper PDFs */}
            <div>
              <h3>Sprint Filters</h3>
              <label>Year</label>
              <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
                <option value="all">All Years</option>
                {(bank?.meta.years ?? []).map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <label style={{ marginTop: ".4rem", display: "block" }}>Paper</label>
              <select value={filterPaper} onChange={(e) => setFilterPaper(e.target.value)}>
                <option value="all">Both Papers</option>
                <option value="1">Paper 1: Mathematical Thinking</option>
                <option value="2">Paper 2: Mathematical Reasoning</option>
              </select>

              <p className="muted" style={{ marginTop: ".6rem" }}>
                {allQuestions.filter((q) => {
                  if (!q.topics.includes(selectedTopic)) return false;
                  if (filterYear !== "all" && q.year !== filterYear) return false;
                  if (filterPaper !== "all" && q.paper !== Number(filterPaper)) return false;
                  return true;
                }).length} questions match
              </p>

              <h3 style={{ marginTop: "1rem" }}>Past Paper PDFs</h3>
              <p className="muted">Official papers — click to open.</p>
              <div className="tmua-paper-links-compact">
                {TMUA_PAST_PAPER_PDFS.filter((p) => p.kind === "questions").map((p) => (
                  <a key={`${p.year}-${p.paper}`} href={p.url} target="_blank" rel="noreferrer" className="tmua-pdf-link">
                    {p.year} P{p.paper}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Sprint launcher */}
          <div className="sprint-launch">
            <button className="sprint-btn" onClick={() => buildSprint("practice")}>
              New Sprint — {activeTopic.label}
            </button>
            <button className="secondary" style={{ marginLeft: ".5rem" }} onClick={() => buildSprint("timed")}>
              Timed Sprint (75 min)
            </button>
            <p className="muted">Up to 20 questions on {activeTopic.label}.</p>
          </div>
        </section>
      )}

      {/* ═══════ PRACTICE — hidden sub-tab of Learn ═══════ */}
      {tab === "practice" && (
        <section className="panel">
          <div className="practice-head">
            <h2>Practice <span className="muted">({activeQuestions.length > 0 ? `${currentIdx + 1} / ${activeQuestions.length}` : "20 Problems"})</span></h2>
            <button className="secondary" onClick={() => setTab("learn")}>← Back to Learn</button>
          </div>

          {sprintTopic && activeQuestions.length > 0 && (
            <div className="sprint-concept-banner">
              <strong>Sprint: {TMUA_TOPICS.find((t) => t.id === sprintTopic)?.label ?? sprintTopic}</strong>
              <span className="muted">{examMode === "timed" ? "Timed" : "Untimed"}</span>
            </div>
          )}

          <p className="warning">Calculators are not permitted in the TMUA.</p>

          {!currentQ ? (
            <div className="empty-state">
              <p>Hit <strong>New Sprint</strong> in the Learn tab to generate questions.</p>
            </div>
          ) : (
            <article className={`question-card ${currentQ.difficulty === "challenging" ? "hard" : ""}`}>
              <div className="q-header">
                <span className="q-badge">{currentQ.year} P{currentQ.paper} Q{currentQ.questionNumber}</span>
                <span className="muted">{currentQ.topicDisplay}</span>
              </div>

              <div className="q-stem">
                <MathText text={currentQ.text} />
                {currentQ.sourcePdf && (
                  <p className="muted" style={{ marginTop: ".5rem", fontSize: ".82rem" }}>
                    <a href={currentQ.sourcePdf} target="_blank" rel="noreferrer">View original PDF</a>
                  </p>
                )}
              </div>

              <div className="options-grid">
                {optionKeys(currentQ).map((key) => {
                  const selected = answers[currentQ.id] === key;
                  return (
                    <button
                      key={`${currentQ.id}-${key}`}
                      className={`option-btn ${selected ? "selected" : ""}`}
                      onClick={() => setAnswers((prev) => ({ ...prev, [currentQ.id]: key }))}
                    >
                      <span className="opt-label">{key}</span>{" "}
                      <MathText text={currentQ.options[key]} />
                    </button>
                  );
                })}
              </div>

              <div className="q-nav">
                <button className="secondary" disabled={currentIdx === 0} onClick={() => setCurrentIdx((i) => i - 1)}>
                  ← Previous
                </button>
                <div className="q-dots">
                  {activeQuestions.map((_, i) => (
                    <button
                      key={i}
                      className={`dot ${i === currentIdx ? "current" : ""} ${answers[activeQuestions[i].id] ? "answered" : ""}`}
                      onClick={() => setCurrentIdx(i)}
                    />
                  ))}
                </div>
                {currentIdx < activeQuestions.length - 1 ? (
                  <button onClick={() => setCurrentIdx((i) => i + 1)}>Next →</button>
                ) : (
                  <button onClick={submitSprint}>Submit Sprint</button>
                )}
              </div>
            </article>
          )}
        </section>
      )}

      {/* ═══════ FEEDBACK ═══════ */}
      {tab === "feedback" && (
        <section className="panel">
          <h2>Feedback &amp; History</h2>

          {/* Current sprint results */}
          {results.length > 0 && (
            <>
              <h3>Latest Sprint</h3>
              <div className="stats-row" style={{ marginBottom: "1rem" }}>
                <div className="stat">
                  <span className="stat-val">{results.filter((r) => r.isCorrect).length}/{results.length}</span>
                  <span className="stat-lbl">Score</span>
                </div>
              </div>
              <div className="question-list">
                {activeQuestions.map((q, idx) => {
                  const r = results.find((r) => r.questionId === q.id);
                  const correct = r?.isCorrect;
                  return (
                    <article key={`fb-${q.id}`} className={correct ? "correct" : "incorrect"}>
                      <h3>Q{idx + 1} — {q.topicDisplay}</h3>
                      <p className="muted">{q.year} Paper {q.paper} Q{q.questionNumber}</p>
                      <p>Your answer: <strong>{r?.selected ?? "—"}</strong> | Correct: <strong>{q.correctAnswer}</strong></p>
                      <p><strong>Solution:</strong> <MathText text={q.workedSolution} /></p>
                      {q.sourcePdf && (
                        <p className="muted" style={{ fontSize: ".82rem" }}>
                          <a href={q.sourcePdf} target="_blank" rel="noreferrer">View original PDF</a>
                        </p>
                      )}
                    </article>
                  );
                })}
              </div>
            </>
          )}

          {/* Sprint history */}
          <h3 style={{ marginTop: "1.5rem" }}>Sprint History</h3>
          {(progress.examHistory ?? []).length === 0 ? (
            <p className="muted">No sprints completed yet.</p>
          ) : (
            <div className="history-list">
              {(progress.examHistory ?? []).map((rec) => {
                const wrongCount = rec.total - rec.score;
                return (
                  <details key={rec.id} className="history-entry">
                    <summary className="history-summary">
                      <span className="history-date">{rec.date}</span>
                      <strong>{rec.mode === "timed" ? "Timed" : "Practice"} — {rec.topics.join(", ")}</strong>
                      {rec.year && <span className="muted"> · {rec.year}</span>}
                      <span className={`history-score ${rec.score === rec.total ? "perfect" : wrongCount > rec.total / 2 ? "weak" : ""}`}>
                        {rec.score}/{rec.total}
                      </span>
                      {wrongCount > 0 && <span className="history-badge">{wrongCount} to review</span>}
                    </summary>
                    <div className="tmua-history-detail">
                      <p className="muted">Time: {formatTime(rec.timeUsed)} · Topics: {rec.topics.join(", ")}</p>
                    </div>
                  </details>
                );
              })}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
