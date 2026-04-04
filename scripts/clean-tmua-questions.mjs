#!/usr/bin/env node
/**
 * Clean TMUA question bank from PDF-extraction Unicode artifacts
 * and normalize to the app's format.
 *
 * Usage: node scripts/clean-tmua-questions.mjs <input.json> <output.json>
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const inputPath = process.argv[2] || resolve("../Downloads/TMUA_Trainer/question-bank.json");
const outputPath = process.argv[3] || resolve("public/data/tmua-questions.json");

const raw = JSON.parse(readFileSync(inputPath, "utf-8"));

/** Map of PDF-extracted Unicode artifacts → intended characters/LaTeX */
const CHAR_MAP = {
  "\u0754": "x",       // ݔ → x
  "\u0755": "y",       // ݕ → y
  "\u0D4C": " = ",     // ൌ → =
  "\u0D46": "-",       // െ → -
  "\u0B36": "²",       // ଶ → superscript 2
  "\u0B37": "³",       // ଷ → superscript 3
  "\u0B35": "¹",       // ଵ → superscript 1 (sometimes subscript)
  "\u123A": "(",       // ሺ → (
  "\u123B": ")",       // ሻ → )
  "\u073D": "",        // ܽ → accent mark (remove)
  "\u073F": "",        // ܿ → accent mark (remove)
  "\u073E": "",        // ܾ → accent mark (remove)
  "\u0742": "",        // ݂ → diacritic (remove)
  "\u0740": "",        // ݀ → diacritic (remove)
  "\u074A": "",        // ݊ → diacritic (remove)
  "\u074D": "r",       // ݍ → r
  "\u074C": "",        // (invisible) diacritic (remove)
  "\u0D45": "",        // Malayalam vowel sign (remove)
  "\u0D4F": "",        // ൏ → reference mark (remove)
  "\u0BEB": "5",       // ௫ → 5
  "\u0B3F": "",        // ି → Odia vowel sign (remove)
  "\u2217": "*",       // ∗ → *
  "\u25E6": "°",       // ◦ → degree
};

function cleanText(text) {
  if (!text) return text;
  let result = text;
  for (const [from, to] of Object.entries(CHAR_MAP)) {
    result = result.replaceAll(from, to);
  }
  // Normalize whitespace
  result = result.replace(/\s+/g, " ").trim();
  return result;
}

function cleanOptions(options) {
  const cleaned = {};
  for (const [key, val] of Object.entries(options)) {
    cleaned[key] = cleanText(String(val));
  }
  return cleaned;
}

const TOPIC_DISPLAY = {
  "algebra": "Algebra",
  "calculus": "Calculus",
  "combinatorics": "Combinatorics",
  "functions": "Functions",
  "geometry": "Geometry",
  "inequalities": "Inequalities",
  "logic": "Logic & Reasoning",
  "number-theory": "Number Theory",
  "probability": "Probability",
  "proof": "Proof",
  "sequences": "Sequences & Series",
  "statistics": "Statistics",
  "trigonometry": "Trigonometry",
};

const DIFFICULTY_MAP = {
  easy: "standard",
  medium: "standard",
  hard: "challenging",
};

const questions = raw.questions.map((q) => ({
  id: q.id,
  year: String(q.year),
  paper: q.paper,
  questionNumber: q.question_number,
  text: cleanText(q.text),
  options: cleanOptions(q.options),
  correctAnswer: q.correct_answer,
  workedSolution: cleanText(q.worked_solution),
  topics: q.topics || [],
  topicDisplay: (q.topics || []).map((t) => TOPIC_DISPLAY[t] || t).join(", "),
  difficulty: DIFFICULTY_MAP[q.difficulty] || q.difficulty,
  sourcePdf: q.source_pdf || "",
}));

// Build stats
const years = [...new Set(questions.map((q) => q.year))].sort();
const topics = [...new Set(questions.flatMap((q) => q.topics))].sort();
console.log(`Cleaned ${questions.length} questions`);
console.log(`Years: ${years.join(", ")}`);
console.log(`Topics: ${topics.join(", ")}`);
console.log(`Papers: 1, 2`);

const output = {
  meta: {
    source: "TMUA Past Papers (Specimen, 2016–2023)",
    totalQuestions: questions.length,
    years,
    topics,
    papers: [1, 2],
    lastUpdated: new Date().toISOString().slice(0, 10),
  },
  questions,
};

writeFileSync(outputPath, JSON.stringify(output, null, 2));
console.log(`Written to ${outputPath}`);
