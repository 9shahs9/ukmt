#!/usr/bin/env node
/**
 * Clean TMUA question bank from PDF-extraction Unicode artifacts
 * and normalize to the app's format.
 *
 * Two-phase approach:
 *   Phase 1: Simple character replacement (Syriac→letters, Malayalam→operators, etc.)
 *   Phase 2: Context-aware math formatting using temporary placeholders
 *            for superscript/subscript blocks (Odia, Tamil, Telugu, Kannada)
 *
 * Usage: node scripts/clean-tmua-questions.mjs [input.json] [output.json]
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const inputPath = process.argv[2] || resolve("/Users/sb/Downloads/TMUA_Trainer/question-bank.json");
const outputPath = process.argv[3] || resolve("public/data/tmua-questions.json");

const raw = JSON.parse(readFileSync(inputPath, "utf-8"));

/* ═════════════════════════════════════════════════════════════════════════════
 * PHASE 1 — Simple character map (non-math blocks)
 * ═════════════════════════════════════════════════════════════════════════════ */
const CHAR_MAP = {
  // ──── Syriac block → Latin uppercase (offset 1762) ────
  "\u0720": ">",
  "\u0723": "A", "\u0724": "B", "\u0725": "C", "\u0726": "D", "\u0727": "E",
  "\u0728": "F", "\u0729": "G", "\u072A": "H", "\u072B": "I", "\u072C": "J",
  "\u072D": "K", "\u072E": "L", "\u072F": "M", "\u0730": "N", "\u0731": "O",
  "\u0732": "P", "\u0733": "Q", "\u0734": "R", "\u0735": "S", "\u0736": "T",
  "\u0737": "U", "\u0738": "V", "\u0739": "W", "\u073A": "X", "\u073B": "Y",
  "\u073C": "Z",

  // ──── Syriac block → Latin lowercase (offset 1756) ────
  "\u073D": "a", "\u073E": "b", "\u073F": "c", "\u0740": "d", "\u0741": "e",
  "\u0742": "f", "\u0743": "g", "\u0744": "h", "\u0745": "i", "\u0746": "j",
  "\u0747": "k", "\u0748": "l", "\u0749": "m", "\u074A": "n", "\u074B": "o",
  "\u074C": "p", "\u074D": "q", "\u074E": "r", "\u074F": "s", "\u0750": "t",
  "\u0751": "u", "\u0752": "v", "\u0753": "w", "\u0754": "x", "\u0755": "y",
  "\u0756": "z",

  // ──── Additional Syriac (different font encoding) ────
  "\u0709": "A", "\u0716": "T", "\u070C": "D",

  // ──── Malayalam block — operators & brackets ────
  "\u0D45": "+", "\u0D46": "-", "\u0D47": "-", "\u0D48": "\u00D7",
  "\u0D4C": "=", "\u0D4D": "\u2260",
  "\u0D4E": "\u2248", "\u0D4F": "<", "\u0D50": ">", "\u0D51": "\u2264", "\u0D52": "\u2265",
  "\u0D6B": "(", "\u0D6F": ")", "\u0D6C": "(", "\u0D70": ")",

  // ──── Ethiopic block — brackets ────
  "\u123A": "(", "\u123B": ")", "\u123E": "[", "\u123F": "]",
  "\u1240": "(", "\u1241": ")",

  // ──── Latin Extended-B — punctuation & operators ────
  "\u01E1": ",", "\u01E2": ";", "\u01E3": ":", "\u01E4": ". ",
  "\u01E6": "-", "\u01EB": "?", "\u01EE": "\u2018", "\u01EF": "\u2019",
  "\u0200": "/", "\u0202": "\u2212",
  "\u0215": "\u03B2", "\u0217": "*",

  // ──── NKo block — Greek letters ────
  "\u07E8": "\u03C0", "\u07E0": "\u03B8",

  // ──── Cyrillic / Hangul — prime marks ────
  "\u0522": "\u2032",   // Ԣ → ′ (prime)
  "\u11F1": "\u2032",   // ᇱ → ′

  // ──── Sinhala — math operators ────
  "\u0DA7": "\u221A", "\u0DA5": "\u221A",  // √
  "\u0DB1": "\u222B",                        // ∫
  "\u0DCD": "\u03A3",                        // Σ

  // ──── Greek reinterpretations (context-specific) ────
  "\u03A8": "%",    // Ψ → %
  // NOTE: ι (U+03B9) NOT globally replaced — it's theta iota in some contexts
  // We handle degree-context separately below

  // ──── Gujarati digits (used as labels) ────
  "\u0ADA": "(1)", "\u0ADB": "(2)", "\u0ADC": "(3)",

  // ──── Hebrew ────
  "\u05E1": "\u2220",  // ס → ∠
  "\u05EC": "\u222B",  // ׬ → ∫

  // ──── Miscellaneous ────
  "\u0094": "\u2264", "\u0095": "\u2265", "\u0087": "",
  "\u2217": "\u00D7", "\u25E6": "\u00B0",
  "\u0219": "\u03B8", "\u028C": "\u03C0",
  "\u02C6": "^",
  "\u2010": "-",
  "\u018E": "\u2032",  // Ǝ → ′
  "\u0C17": "", "\u0C30": "",  // formatting artifacts, remove
  "\uF8F4": " ", "\uF8F1": " ", "\uF8F2": " ", "\uF8F3": " ",
  "\uF0A7": ":",
  "\u00A7": "", "\u00A8": "", "\u00B8": "", "\u00A9": "", "\u00B9": "",

  // ──── Odia extended digits (these appear outside math contexts) ────
  "\u0B6A": "4", "\u0B6D": "7", "\u0B65": "0", "\u0B40": "",
};


/* ═════════════════════════════════════════════════════════════════════════════
 * PHASE 2 — Math-aware replacement using temporary placeholders
 *
 * PDF extraction uses different Unicode blocks for superscript vs subscript
 * glyphs. We replace them with PUA placeholders first, then resolve based
 * on surrounding context:
 *   - After a letter or ')': superscript  (x²)
 *   - After "log" or "ln":  subscript     (log₁₀)
 *   - Otherwise:            plain digit   (fraction 1/2, number 10)
 * ═════════════════════════════════════════════════════════════════════════════ */

// Superscript source chars → PUA placeholders (U+E000 – U+E011)
const SUP_PH = {
  // Odia superscript digits
  "\u0B34": "\uE000", "\u0B35": "\uE001", "\u0B36": "\uE002", "\u0B37": "\uE003",
  "\u0B38": "\uE004", "\u0B39": "\uE005", "\u0B3A": "\uE006", "\u0B3B": "\uE007",
  "\u0B3C": "\uE008", "\u0B3D": "\uE009",
  "\u0B3E": "\uE00A", "\u0B3F": "\uE00B",  // + and -
  // Telugu superscript digits
  "\u0C2C": "\uE000", "\u0C2D": "\uE001", "\u0C2E": "\uE002", "\u0C2F": "\uE003",
  "\u0C36": "\uE00A", "\u0C37": "\uE00B",
  // Kannada / Telugu superscript variables
  "\u0C8E": "\uE00C", "\u0C8F": "\uE00D", "\u0CE3": "\uE00E",
  "\u0CCE": "\uE00F", "\u0CCF": "\uE010", "\u0CD9": "\uE011",
};

// Subscript source chars → PUA placeholders (U+E020 – U+E028)
const SUB_PH = {
  "\u0BD4": "\uE020", // Tamil ௔ → sub a
  "\u0BD5": "\uE021", // Tamil ௕ → sub b
  "\u0BD6": "\uE022", // Tamil ௖ → sub c
  "\u0BE1": "\uE023", // Tamil ௡ → sub n
  "\u0BEB": "\uE024", // Tamil ௫ → sub x
  "\u0BEC": "\uE025", // Tamil ௬ → sub y
  "\u0BD7": "\uE026", // Tamil ௗ → sub d (dy/dx)
  "\u0BE3": "\uE027", // Tamil ௣ → sub p
  "\u0BE5": "\uE028", // Tamil ௥ → sub r
};

// Placeholder → plain character
const PH_PLAIN = {
  "\uE000": "0", "\uE001": "1", "\uE002": "2", "\uE003": "3",
  "\uE004": "4", "\uE005": "5", "\uE006": "6", "\uE007": "7",
  "\uE008": "8", "\uE009": "9", "\uE00A": "+", "\uE00B": "-",
  "\uE00C": "n", "\uE00D": "m", "\uE00E": "x",
  "\uE00F": "c", "\uE010": "d", "\uE011": "n",
  "\uE020": "a", "\uE021": "b", "\uE022": "c",
  "\uE023": "n", "\uE024": "x", "\uE025": "y",
  "\uE026": "d", "\uE027": "p", "\uE028": "r",
};

// Unicode superscript lookup
const TO_SUP = {
  "0": "\u2070", "1": "\u00B9", "2": "\u00B2", "3": "\u00B3", "4": "\u2074",
  "5": "\u2075", "6": "\u2076", "7": "\u2077", "8": "\u2078", "9": "\u2079",
  "+": "\u207A", "-": "\u207B",
  "n": "\u207F", "m": "\u1D50", "x": "\u02E3",
  "c": "\u1D9C", "d": "\u1D48",
};

// Unicode subscript lookup
const TO_SUB = {
  "0": "\u2080", "1": "\u2081", "2": "\u2082", "3": "\u2083", "4": "\u2084",
  "5": "\u2085", "6": "\u2086", "7": "\u2087", "8": "\u2088", "9": "\u2089",
  "+": "\u208A", "-": "\u208B",
  "a": "\u2090", "e": "\u2091", "n": "\u2099", "x": "\u2093",
  "b": "b", "c": "c", "d": "d", "y": "y", "p": "p", "r": "r",
};

const SUP_RANGE_RE = /[\uE000-\uE011]+/g;
const SUB_RANGE_RE = /[\uE020-\uE028]+/g;

function phToPlain(s) { return [...s].map(c => PH_PLAIN[c] ?? c).join(""); }
function phToSup(s)   { return [...s].map(c => { const p = PH_PLAIN[c]; return p ? (TO_SUP[p] ?? p) : c; }).join(""); }
function phToSub(s)   { return [...s].map(c => { const p = PH_PLAIN[c]; return p ? (TO_SUB[p] ?? p) : c; }).join(""); }

function resolveSuperscriptPH(text) {
  return text.replace(SUP_RANGE_RE, (match, offset) => {
    const before = text.slice(Math.max(0, offset - 8), offset);
    const trimmed = before.replace(/\s+$/, "");
    // After log/ln → subscript
    if (/(?:log|ln)$/.test(trimmed)) return phToSub(match);
    // After letter, ), ′, °, trig, or a subscript placeholder (which represents a letter) → superscript
    if (/[a-zA-Z)\u2032\u00B0\uE020-\uE028]$/.test(trimmed)) return phToSup(match);
    if (/(?:sin|cos|tan|sec|csc|cot)$/.test(trimmed)) return phToSup(match);
    // Default: plain
    return phToPlain(match);
  });
}

function resolveSubscriptPH(text) {
  return text.replace(SUB_RANGE_RE, (match, offset) => {
    const before = text.slice(Math.max(0, offset - 5), offset);
    const trimmed = before.replace(/\s+$/, "");
    // After a letter or closing paren/bracket → subscript (xₙ, aₖ, log₁₀)
    if (/[a-zA-Z)\]]$/.test(trimmed)) return phToSub(match);
    // After anything else (digit, operator, space) → plain variable
    return phToPlain(match);
  });
}


/* ═════════════════════════════════════════════════════════════════════════════
 * Sentence start repairs
 * ═════════════════════════════════════════════════════════════════════════════ */
/* Start-of-text fixes: first letter/word lost during PDF extraction */
const START_FIXES = [
  [/^he /, "The "],
  [/^onsider /, "Consider "],
  [/^is given/, "It is given"],
  [/^iven /, "Given "],
  [/^ive /, "Give "],
  [/^ow many/, "How many"],
  [/^ow /, "How "],
  [/^ome /, "Some "],
  [/^ach /, "Each "],
  [/^hen /, "When "],
  [/^ind /, "Find "],
  [/^uppose /, "Suppose "],
  [/^xpress /, "Express "],
  [/^olve /, "Solve "],
  [/^ence /, "Hence "],
  [/^et ([a-zA-Z])/, "Let $1"],
  [/^alculate /, "Calculate "],
  [/^implify /, "Simplify "],
  [/^etermine /, "Determine "],
  [/^ote /, "Note "],
  [/^riangles/, "Triangles"],
  [/^line (is|segment)/, "A line $1"],
  [/^right /, "A right "],
  [/^region /, "A region "],
  [/^tangent /, "A tangent "],
  [/^circle /, "A circle "],
  [/^curve /, "A curve "],
  [/^infinitely /, "An infinitely "],
  [/^this question/, "In this question"],
  [/^the figure/, "In the figure"],
  [/^the expansion/, "In the expansion"],
  [/^line ([a-z]) /, "The line $1 "],
];

const SENTENCE_FIXES = [
  [/\. hat is/g, ". What is"], [/\. hat are/g, ". What are"],
  [/\. hat can/g, ". What can"], [/\. hich/g, ". Which"],
  [/\. onsider/g, ". Consider"], [/\. uppose/g, ". Suppose"],
  [/\. herefore/g, ". Therefore"], [/\. xpress/g, ". Express"],
  [/\. omplete/g, ". Complete"], [/\. implify/g, ". Simplify"],
  [/\. ind /g, ". Find "], [/\. he /g, ". The "],
  [/\. his /g, ". This "], [/\. ll /g, ". All "],
  [/\. et /g, ". Let "], [/\. ence/g, ". Hence"],
  [/\. ote /g, ". Note "], [/\. ow many/g, ". How many"],
  [/\. ow,/g, ". Now,"], [/\. se /g, ". Use "],
  [/\. olve/g, ". Solve"], [/\. f /g, ". If "],
  [/\. o /g, ". So "], [/\. iven/g, ". Given"],
  [/\. ondition/g, ". Condition"], [/\. tate/g, ". State"],
  [/\. alculate/g, ". Calculate"], [/\. etermine/g, ". Determine"],
  [/\. ow /g, ". How "], [/\. or /g, ". For "],
  // After closing paren/bracket (lost capital after domain statement)
  [/\) hat is/g, ") What is"], [/\) hat are/g, ") What are"],
  [/\) ind /g, ") Find "], [/\) hen /g, ") When "],
  [/\) ow /g, ") How "], [/\) etermine/g, ") Determine"],
  // Broader fixes for lost capitals after various separators
  [/(\d) hich /g, "$1. Which "],
  [/(\d) hat is/g, "$1. What is"],
  // Fallback: isolated " hich" without period (lost sentence boundary)
  [/([^\s.]) hich /g, "$1. Which "],
];


/* ═════════════════════════════════════════════════════════════════════════════
 * Main cleaning function
 * ═════════════════════════════════════════════════════════════════════════════ */
function cleanText(text) {
  if (!text) return text;
  let r = text;

  // Phase 1a: Replace superscript block chars with PUA placeholders
  for (const [from, to] of Object.entries(SUP_PH)) r = r.replaceAll(from, to);

  // Phase 1b: Replace subscript block chars with PUA placeholders
  for (const [from, to] of Object.entries(SUB_PH)) r = r.replaceAll(from, to);

  // Phase 1c: Simple character map
  for (const [from, to] of Object.entries(CHAR_MAP)) r = r.replaceAll(from, to);

  // Phase 2: Resolve math placeholders in context
  r = resolveSuperscriptPH(r);
  r = resolveSubscriptPH(r);

  // Phase 2.5: Normalize whitespace before sentence repairs
  r = r.replace(/\s+/g, " ").trim();

  // Phase 3a: Fix broken sentence starts (missing first letter from PDF extraction)
  for (const [pat, rep] of START_FIXES) {
    if (pat.test(r)) { r = r.replace(pat, rep); break; }
  }

  // Phase 3b: Fix broken sentence starts after ". " (Ǥ replacement artifact)
  for (const [pat, rep] of SENTENCE_FIXES) r = r.replace(pat, rep);

  // Phase 4: Greek iota used as degree (30ι → 30°)
  r = r.replace(/(\d)\u03B9/g, "$1\u00B0");

  // Phase 5: Normalize whitespace & cleanup
  r = r.replace(/\s+/g, " ").trim();
  r = r.replace(/\u2260=/g, "\u2260"); // fix ≠= → ≠
  r = r.replace(/\u0338=/g, "\u2260"); // fix ̸= → ≠

  return r;
}

function cleanOptions(options) {
  const cleaned = {};
  for (const [key, val] of Object.entries(options)) {
    cleaned[key] = cleanText(String(val));
  }
  return cleaned;
}


/* ═════════════════════════════════════════════════════════════════════════════
 * Output
 * ═════════════════════════════════════════════════════════════════════════════ */
const TOPIC_DISPLAY = {
  "algebra": "Algebra", "calculus": "Calculus", "combinatorics": "Combinatorics",
  "functions": "Functions", "geometry": "Geometry", "inequalities": "Inequalities",
  "logic": "Logic & Reasoning", "number-theory": "Number Theory",
  "probability": "Probability", "proof": "Proof", "sequences": "Sequences & Series",
  "statistics": "Statistics", "trigonometry": "Trigonometry",
};

const DIFFICULTY_MAP = { easy: "standard", medium: "standard", hard: "challenging" };

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

const years = [...new Set(questions.map((q) => q.year))].sort();
const topics = [...new Set(questions.flatMap((q) => q.topics))].sort();
console.log(`Cleaned ${questions.length} questions`);
console.log(`Years: ${years.join(", ")}`);
console.log(`Topics: ${topics.join(", ")}`);

// Sample: show the specific problem question (2017 P1 Q2)
const sample = questions.find(q => q.id === "2017-P1-Q2");
if (sample) {
  console.log("\n--- Sample: 2017 P1 Q2 ---");
  console.log("TEXT:", sample.text.slice(0, 200));
  console.log("OPTIONS:", JSON.stringify(sample.options));
}

const output = {
  meta: {
    source: "TMUA Past Papers (Specimen, 2016\u20132023)",
    totalQuestions: questions.length,
    years, topics,
    papers: [1, 2],
    lastUpdated: new Date().toISOString().slice(0, 10),
  },
  questions,
};

writeFileSync(outputPath, JSON.stringify(output, null, 2));
console.log(`\nWritten to ${outputPath}`);
