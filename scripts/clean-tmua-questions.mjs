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

/** ────────── PDF-extracted Unicode artifacts → intended characters ──────────
 *
 * The TMUA question bank was extracted from PDFs that used custom math fonts.
 * The extraction tool mapped glyph indices to wrong Unicode code points
 * (Syriac, Odia, Tamil, Malayalam, Telugu, Kannada, Ethiopic, Latin Extended-B).
 *
 * Two systematic offsets were discovered for the Syriac block:
 *   • Uppercase A-Z: codepoint − 1762 = ASCII value
 *   • Lowercase a-z: codepoint − 1756 = ASCII value
 *
 * Other blocks are mapped individually from contextual analysis.
 */
const CHAR_MAP = {
  // ──── Syriac block → Latin uppercase (offset 1762) ────
  "\u0720": ">",       // ܠ → > (symbol)
  "\u0723": "A",       // ܣ → A (geometry label)
  "\u0724": "B",       // ܤ → B
  "\u0725": "C",       // ܥ → C
  "\u0726": "D",       // ܦ → D
  "\u0727": "E",       // ܧ → E
  "\u0728": "F",       // ܨ → F
  "\u0729": "G",       // ܩ → G
  "\u072A": "H",       // ܪ → H
  "\u072B": "I",       // ܫ → I
  "\u072C": "J",       // ܬ → J
  "\u072D": "K",       // ­ → K
  "\u072E": "L",       // ® → L
  "\u072F": "M",       // ܯ → M
  "\u0730": "N",       // ܰ → N
  "\u0731": "O",       // ܱ → O (pyramid vertex)
  "\u0732": "P",       // ܲ → P (point label)
  "\u0733": "Q",       // ܳ → Q
  "\u0734": "R",       // ܴ → R
  "\u0735": "S",       // ܵ → S (set label)
  "\u0736": "T",       // ܶ → T
  "\u0737": "U",       // ܷ → U
  "\u0738": "V",       // ܸ → V
  "\u0739": "W",       // ܹ → W
  "\u073A": "X",       // ܺ → X (triangle XYZ)
  "\u073B": "Y",       // ܻ → Y
  "\u073C": "Z",       // ܼ → Z

  // ──── Syriac block → Latin lowercase (offset 1756) ────
  "\u073D": "a",       // ܽ → a (variable) — was WRONGLY removed!
  "\u073E": "b",       // ܾ → b — was WRONGLY removed!
  "\u073F": "c",       // ܿ → c — was WRONGLY removed!
  "\u0740": "d",       // ݀ → d — was WRONGLY removed!
  "\u0741": "e",       // ݁ → e
  "\u0742": "f",       // ݂ → f — was WRONGLY removed!
  "\u0743": "g",       // ݃ → g
  "\u0744": "h",       // ݄ → h
  "\u0745": "i",       // ݅ → i
  "\u0746": "j",       // ݆ → j
  "\u0747": "k",       // ݇ → k
  "\u0748": "l",       // ݈ → l
  "\u0749": "m",       // ݉ → m — was WRONGLY removed!
  "\u074A": "n",       // ݊ → n — was WRONGLY removed!
  "\u074B": "o",       // ݋ → o
  "\u074C": "p",       // ݌ → p — was WRONGLY removed!
  "\u074D": "q",       // ݍ → q — was WRONGLY mapped to r!
  "\u074E": "r",       // ݎ → r
  "\u074F": "s",       // ݏ → s
  "\u0750": "t",       // ݐ → t
  "\u0751": "u",       // ݑ → u
  "\u0752": "v",       // ݒ → v
  "\u0753": "w",       // ݓ → w
  "\u0754": "x",       // ݔ → x
  "\u0755": "y",       // ݕ → y
  "\u0756": "z",       // ݖ → z

  // ──── Malayalam block ────
  "\u0D45": "+",       // ൅ → + (addition) — was WRONGLY removed!
  "\u0D46": "-",       // െ → - (subtraction)
  "\u0D4C": "=",       // ൌ → =
  "\u0D4F": "<",       // ൏ → < — was WRONGLY removed!
  "\u0D50": ">",       // ൐ → >
  "\u0D51": "≤",       // ൑ → ≤
  "\u0D52": "≥",       // ൒ → ≥
  "\u0D6B": "(",       // ൫ → ( (parenthesis, Malayalam digit 5)
  "\u0D6F": ")",       // ൯ → ) (parenthesis, Malayalam digit 9)

  // ──── Odia block — superscript digits & operators ────
  "\u0B34": "0",       // ଴ → 0
  "\u0B35": "1",       // ଵ → 1
  "\u0B36": "2",       // ଶ → 2
  "\u0B37": "3",       // ଷ → 3
  "\u0B38": "4",       // ସ → 4
  "\u0B39": "5",       // ହ → 5
  "\u0B3A": "6",       // ଺ → 6
  "\u0B3B": "7",       // ଻ → 7
  "\u0B3C": "8",       // ଼ → 8
  "\u0B3D": "9",       // ଽ → 9
  "\u0B3E": "+",       // ା → + (subscript/superscript plus)
  "\u0B3F": "-",       // ି → - (subscript minus) — was WRONGLY removed!

  // ──── Tamil block — subscript letters ────
  "\u0BD4": "a",       // ௔ → subscript a (e.g. log_a)
  "\u0BD5": "b",       // ௕ → subscript b
  "\u0BD6": "c",       // ௖ → subscript c
  "\u0BE1": "n",       // ௡ → subscript n (e.g. a_n, S_n)
  "\u0BEB": "x",       // ௫ → subscript x — was WRONGLY mapped to 5!
  "\u0BEC": "y",       // ௬ → subscript y (e.g. b^{xy})

  // ──── Telugu block — superscript digits & operators ────
  "\u0C2C": "0",       // బ → 0
  "\u0C2D": "1",       // భ → 1
  "\u0C2E": "2",       // మ → 2
  "\u0C2F": "3",       // య → 3
  "\u0C30": "",        // ర → (formatting artifact, remove)
  "\u0C36": "+",       // శ → + (superscript plus in exponents)
  "\u0C37": "-",       // ష → - (superscript minus in exponents)

  // ──── Kannada block — superscript variables ────
  "\u0C8E": "n",       // ೎ → n (exponent variable)
  "\u0C8F": "m",       // ೏ → m (exponent variable)
  "\u0CE3": "x",       // ೣ → x (exponent variable)

  // ──── Ethiopic block — brackets ────
  "\u123A": "(",       // ሺ → (
  "\u123B": ")",       // ሻ → )
  "\u123E": "[",       // ሾ → [
  "\u123F": "]",       // ሿ → ]
  "\u1240": "(",       // ቀ → ( (large parenthesis)
  "\u1241": ")",       // ቁ → )

  // ──── Latin Extended-B — punctuation & operators ────
  "\u01E1": ",",       // ǡ → , (comma)
  "\u01E3": ":",       // ǣ → : (colon, ratio notation)
  "\u01E4": ". ",      // Ǥ → . (period + space; consumes next capital letter)
  "\u01E6": "-",       // Ǧ → - (hyphen, e.g. x-axis)
  "\u01EB": "?",       // ǫ → ? (question mark)
  "\u0217": "*",       // ȗ → * (statement label)

  // ──── NKo block ────
  "\u07E8": "π",       // ߨ → π (pi)

  // ──── Miscellaneous ────
  "\u0094": "≤",       // control char → ≤
  "\uF8F4": " ",       // private use → space
  "\u2217": "*",       // ∗ → *
  "\u25E6": "°",       // ◦ → degree
  "\u0C17": "",        // గ → (unclear, remove; only 1 occurrence)

  // ──── Additional low-frequency fixes ────
  "\u0B6A": "4",       // ୪ → 4 (Odia digit 4)
  "\u0B6D": "7",       // ୭ → 7 (Odia digit 7)
  "\u0B65": "0",       // Odia → 0
  "\u07E0": "θ",       // ߠ → θ (theta from NKo block)
  "\u0219": "θ",       // ș → θ (garbled theta)
  "\u028C": "π",       // ʌ → π (garbled pi)
  "\u05E1": "∠",       // ס → ∠ (Hebrew → angle sign)
  "\u0D47": "-",       // േ → - (Malayalam vowel sign)
  "\u0D48": "×",       // ൈ → × (Malayalam)
  "\u01EE": "'",       // Ǯ → ' (single quote)
  "\u01EF": "'",       // ǯ → ' (single quote)
  "\u0709": "A",       // ܉ → A (Syriac, different font encoding)
  "\u0716": "T",       // ܖ → T
  "\u070C": "D",       // ܌ → D
  "\u0D4D": "",        // ് → (Malayalam virama, remove)
  "\u0B40": "",        // ୀ → (Odia vowel sign, remove)
};

/**
 * After Ǥ → ". " replacement, the first letter of the next word is consumed.
 * Fix common broken sentence starts: ". hich" → ". Which", ". he " → ". The ", etc.
 */
const SENTENCE_FIXES = [
  [/\. hat is/g, ". What is"],
  [/\. hat are/g, ". What are"],
  [/\. hat can/g, ". What can"],
  [/\. hich/g, ". Which"],
  [/\. onsider/g, ". Consider"],
  [/\. uppose/g, ". Suppose"],
  [/\. herefore/g, ". Therefore"],
  [/\. xpress/g, ". Express"],
  [/\. omplete/g, ". Complete"],
  [/\. implify/g, ". Simplify"],
  [/\. ind /g, ". Find "],
  [/\. he /g, ". The "],
  [/\. his /g, ". This "],
  [/\. ll /g, ". All "],
  [/\. et /g, ". Let "],
  [/\. ence/g, ". Hence"],
  [/\. ote /g, ". Note "],
  [/\. ow many/g, ". How many"],
  [/\. ow,/g, ". Now,"],
  [/\. se /g, ". Use "],
  [/\. olve/g, ". Solve"],
  [/\. f /g, ". If "],
  [/\. o /g, ". So "],
  [/\. iven/g, ". Given"],
  [/\. ondition/g, ". Condition"],
  [/\. tate/g, ". State"],
  [/\. ence/g, ". Hence"],
];

function cleanText(text) {
  if (!text) return text;
  let result = text;
  for (const [from, to] of Object.entries(CHAR_MAP)) {
    result = result.replaceAll(from, to);
  }
  // Fix broken sentence starts after Ǥ → ". " replacement
  for (const [pattern, replacement] of SENTENCE_FIXES) {
    result = result.replace(pattern, replacement);
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
