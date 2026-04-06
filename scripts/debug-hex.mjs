import { readFileSync } from "fs";
const raw = JSON.parse(readFileSync("/Users/sb/Downloads/TMUA_Trainer/question-bank.json", "utf8"));
const q2 = raw.questions.find(q => String(q.year) === "2017" && q.paper === 1 && q.question_number === 2);
const hex = [...q2.text].map(c => c.charCodeAt(0) > 127 ? "[U+" + c.charCodeAt(0).toString(16).padStart(4, "0") + "]" : c).join("");
console.log("RAW:", hex.slice(0, 400));
console.log();
// Also check the D4D char (Malayalam virama — should map to ≠)
const hasD4D = raw.questions.filter(q => q.text.includes("\u0D4D")).length;
console.log("Questions with U+0D4D:", hasD4D);
// Check Specimen P1 Q1
const q1 = raw.questions.find(q => String(q.year) === "Specimen" && q.paper === 1 && q.question_number === 1);
const h1 = [...q1.text].map(c => c.charCodeAt(0) > 127 ? "[U+" + c.charCodeAt(0).toString(16).padStart(4, "0") + "]" : c).join("");
console.log("\nQ1 RAW:", h1.slice(0, 300));
