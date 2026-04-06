#!/usr/bin/env node
/**
 * Audit all non-ASCII characters in the raw TMUA question bank.
 * Usage: node scripts/audit-chars.mjs
 */
import { readFileSync } from "fs";

const raw = JSON.parse(readFileSync("/Users/sb/Downloads/TMUA_Trainer/question-bank.json", "utf-8"));
const charFreq = {};

for (const q of raw.questions) {
  const allText = q.text + "|" + Object.values(q.options).join("|") + "|" + (q.worked_solution || "");
  for (let i = 0; i < allText.length; i++) {
    const cp = allText.codePointAt(i);
    if (cp > 127) {
      const key = "U+" + cp.toString(16).padStart(4, "0");
      if (!charFreq[key]) charFreq[key] = { char: allText[i], count: 0, contexts: [] };
      charFreq[key].count++;
      if (charFreq[key].contexts.length < 3) {
        charFreq[key].contexts.push(allText.slice(Math.max(0, i - 8), i + 8).replace(/\n/g, " "));
      }
    }
  }
}

const sorted = Object.entries(charFreq).sort((a, b) => b[1].count - a[1].count);
console.log("Total unique non-ASCII:", sorted.length);
console.log();
for (const [key, val] of sorted) {
  console.log(`${key} ${val.char} x${val.count}  ctx: ${val.contexts.join(" | ")}`);
}
