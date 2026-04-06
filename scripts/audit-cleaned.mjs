#!/usr/bin/env node
import { readFileSync } from "fs";

const d = JSON.parse(readFileSync("public/data/tmua-questions.json", "utf-8"));

// Check remaining " hich "
const withHich = d.questions.filter(q => / hich /.test(q.text));
console.log("Questions with ' hich':", withHich.length);
for (const q of withHich) {
  const m = q.text.match(/.{0,30} hich .{0,20}/);
  console.log("  ", q.id, ":", m ? m[0].trim() : "");
}

// Find unexpected non-ASCII in cleaned output
const EXPECTED_RE = /[\u00B0\u00B2\u00B3\u00B9\u00D7\u00F7\u2013\u2014\u2018\u2019\u201C\u201D\u2032\u207A-\u207F\u1D50\u02E3\u1D9C\u1D48\u2070-\u2079\u2080-\u2089\u2090-\u2099\u2093\u2212\u2220\u221A\u2248\u2260\u2264\u2265\u222B\u03A3\u03B2\u03B8\u03B9\u03C0\u03BE\u00B7\u2075-\u2079]/;

let issueCount = 0;
for (const q of d.questions) {
  const all = q.text + " " + Object.values(q.options).join(" ") + " " + (q.workedSolution || "");
  const unexpected = [...all].filter(c => {
    const cp = c.codePointAt(0);
    return cp > 127 && !EXPECTED_RE.test(c);
  });
  if (unexpected.length > 0) {
    const unique = [...new Set(unexpected)].map(c => "U+" + c.codePointAt(0).toString(16).padStart(4, "0") + " " + c);
    if (issueCount < 10) console.log("\n" + q.id, unique.join(", "));
    issueCount++;
  }
}
console.log("\nTotal questions with unexpected non-ASCII:", issueCount);
