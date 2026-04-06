#!/usr/bin/env node
/**
 * Morph TMUA question bank for practice mode.
 *
 * Prevents rote learning by:
 *   1. Shuffling answer option order (re-mapping correct answer letter)
 *   2. Removing year, paper, questionNumber, sourcePdf identifiers
 *   3. Generating anonymized IDs (topic-based, deterministic)
 *   4. Randomising distractor presentation
 *
 * Usage: node scripts/morph-tmua-questions.mjs [input.json] [output.json]
 *
 * The script uses a seeded PRNG so the output is deterministic per run
 * (re-run to get a fresh shuffle).
 */

import { readFileSync, writeFileSync } from "fs";
import { createHash } from "crypto";
import { resolve } from "path";

const inputPath = process.argv[2] || resolve("public/data/tmua-questions.json");
const outputPath = process.argv[3] || resolve("public/data/tmua-questions.json");

const raw = JSON.parse(readFileSync(inputPath, "utf-8"));

// ─── Seeded PRNG (mulberry32) for deterministic shuffles ───
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Derive a numeric seed from the question id
function seedFromId(id) {
  const hash = createHash("md5").update(id).digest();
  return hash.readUInt32LE(0);
}

// Fisher-Yates shuffle with provided rng
function shuffle(arr, rng) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const OPTION_LETTERS = "ABCDEFGH".split("");

function morphQuestion(q, index) {
  const rng = mulberry32(seedFromId(q.id));

  // ── 1. Shuffle options ──
  const entries = Object.entries(q.options).filter(([, v]) => v && v.trim() !== "");
  const shuffled = shuffle(entries, rng);

  // Build new options object and find new correct answer letter
  const newOptions = {};
  let newCorrectAnswer = q.correctAnswer;
  shuffled.forEach(([origKey, value], idx) => {
    const newKey = OPTION_LETTERS[idx];
    newOptions[newKey] = value;
    if (origKey === q.correctAnswer) {
      newCorrectAnswer = newKey;
    }
  });

  // ── 2. Build anonymous ID ──
  const primaryTopic = (q.topics && q.topics[0]) || "general";
  const anonId = `${primaryTopic}-${String(index + 1).padStart(3, "0")}`;

  // ── 3. Strip identifying fields ──
  return {
    id: anonId,
    text: q.text,
    options: newOptions,
    correctAnswer: newCorrectAnswer,
    workedSolution: q.workedSolution || "",
    topics: q.topics || [],
    topicDisplay: q.topicDisplay || "",
    difficulty: q.difficulty || "standard",
    // year, paper, questionNumber, sourcePdf deliberately omitted
  };
}

// ── Process all questions ──
const morphed = raw.questions.map((q, i) => morphQuestion(q, i));

// ── Build output ──
const topics = [...new Set(morphed.flatMap((q) => q.topics))].sort();

const output = {
  meta: {
    source: "TMUA-style practice questions (morphed from past papers)",
    totalQuestions: morphed.length,
    topics,
    papers: [1, 2],
    lastUpdated: new Date().toISOString().slice(0, 10),
  },
  questions: morphed,
};

writeFileSync(outputPath, JSON.stringify(output, null, 2));

// Stats
const withOptions = morphed.filter((q) => Object.keys(q.options).length >= 4).length;
console.log(`Morphed ${morphed.length} questions (${withOptions} with 4+ options)`);
console.log(`Topics: ${topics.join(", ")}`);
console.log(`Year/paper/sourcePdf fields removed`);
console.log(`Option order shuffled, correct answers re-mapped`);
console.log(`Written to ${outputPath}`);
