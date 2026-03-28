import fs from "node:fs";
import path from "node:path";

const sourceDir = "/Users/sb/projects/UKMT/past_papers";
const outDir = path.join(process.cwd(), "public", "data");
fs.mkdirSync(outDir, { recursive: true });

const files = fs.existsSync(sourceDir)
  ? fs.readdirSync(sourceDir).filter((f) => f.toLowerCase().endsWith(".pdf"))
  : [];

const paperIndex = files
  .map((file) => {
    const lower = file.toLowerCase();
    const yearMatch = lower.match(/20\d{2}|201\d/);
    const year = yearMatch ? Number(yearMatch[0]) : null;

    let track = "JMC";
    if (lower.includes("kangaroo") || lower.includes("jk-") || lower.includes("jk_")) {
      track = "Junior Kangaroo";
    }
    if (lower.includes("jmo") || lower.includes("olympiad")) {
      track = "JMO";
    }

    let kind = "paper";
    if (lower.includes("solution")) kind = "solutions";
    if (lower.includes("extended")) kind = "extended-solutions";
    if (lower.includes("report")) kind = "markers-report";
    if (lower.includes("comment")) kind = "comments";

    return { fileName: file, year, track, kind };
  })
  .filter((p) => p.year && p.year >= 2011 && p.year <= 2025)
  .sort((a, b) => a.year - b.year || a.track.localeCompare(b.track));

const years = Array.from({ length: 15 }, (_, i) => 2011 + i);

const level1Templates = [
  {
    topic: "Divisibility Rules",
    stem: (y) => `For year ${y}, which value of n makes $3n7$ divisible by $9$?`,
    options: ["1", "2", "5", "7", "8"],
    answer: "8",
    solution:
      "A number is divisible by 9 if its digit sum is a multiple of 9. Here, 3+n+7=10+n, so n=8 gives 18.",
    alternative: "List each option and compute the digit sum quickly.",
  },
  {
    topic: "Percentages",
    stem: (y) => `In a sprint for ${y}, a score rises from 40 to 50. What is the percentage increase?`,
    options: ["20%", "25%", "30%", "40%", "50%"],
    answer: "25%",
    solution: "Increase is 10 on a base of 40, so $10/40=1/4=25\\%$.",
    alternative: "Scale to 100: if 40 maps to 100, multiply by 2.5, then 10 maps to 25.",
  },
  {
    topic: "Angles",
    stem: (y) => `A regular pentagon appears in a ${y} worksheet. What is each interior angle?`,
    options: ["96 degrees", "108 degrees", "112 degrees", "120 degrees", "135 degrees"],
    answer: "108 degrees",
    solution: "Interior angle of regular n-gon is $((n-2)\\times 180)/n$. For n=5, angle is 108 degrees.",
    alternative: "Sum of interior angles is 540 degrees, then divide by 5.",
  },
  {
    topic: "Prime Factorization",
    stem: (y) => `How many positive factors does $2^3\\cdot3^2$ have in the ${y} mixed set?`,
    options: ["8", "10", "12", "16", "18"],
    answer: "12",
    solution: "If $n=p^a q^b$, then number of factors is $(a+1)(b+1)=(3+1)(2+1)=12$.",
    alternative: "List systematically by choosing exponent of 2 and exponent of 3.",
  },
  {
    topic: "Sequences",
    stem: (y) => `A sequence in ${y} follows 2, 5, 11, 23, ... where each term is double the previous plus 1. Next term?`,
    options: ["35", "41", "47", "49", "51"],
    answer: "47",
    solution: "$23\\times2+1=47$.",
    alternative: "Look at differences 3,6,12 then double the next difference to 24.",
  },
  {
    topic: "Fractions and Decimals",
    stem: (y) => `In a ${y} JMC paper, what is $\\frac{3}{8}+\\frac{1}{6}$ as a single fraction in lowest terms?`,
    options: ["4/14", "11/24", "13/24", "7/12", "5/8"],
    answer: "13/24",
    solution: "LCM of 8 and 6 is 24. $\\frac{9}{24}+\\frac{4}{24}=\\frac{13}{24}$.",
    alternative: "Convert to decimals: 0.375 + 0.1667 ≈ 0.5417, which is 13/24.",
  },
  {
    topic: "Powers and Roots",
    stem: (y) => `In ${y}, simplify $\\sqrt{72}$.`,
    options: ["$6\\sqrt{2}$", "$4\\sqrt{3}$", "$3\\sqrt{8}$", "$8\\sqrt{2}$", "$2\\sqrt{18}$"],
    answer: "$6\\sqrt{2}$",
    solution: "$\\sqrt{72}=\\sqrt{36\\times2}=6\\sqrt{2}$.",
    alternative: "Prime factorise: $72=2^3\\times3^2$, pull out pairs to get $6\\sqrt{2}$.",
  },
  {
    topic: "Symmetry and Nets",
    stem: (y) => `A ${y} Kangaroo question asks: how many lines of symmetry does a regular hexagon have?`,
    options: ["3", "4", "5", "6", "12"],
    answer: "6",
    solution: "A regular n-gon has n lines of symmetry. For n=6 there are 6 lines.",
    alternative: "Draw the hexagon and count: 3 through opposite vertices, 3 through midpoints of opposite sides.",
  },
  {
    topic: "Circles and Semicircles",
    stem: (y) => `In a ${y} problem, a semicircle has diameter 10. What is its perimeter?`,
    options: ["$5\\pi$", "$5\\pi+10$", "$10\\pi$", "$10\\pi+10$", "$5\\pi+5$"],
    answer: "$5\\pi+10$",
    solution: "The curved arc is half the circumference: $\\frac{1}{2}\\times2\\pi\\times5=5\\pi$. Add the diameter 10.",
    alternative: "Perimeter = πr + 2r = 5π + 10.",
  },
  {
    topic: "Logic Puzzles",
    stem: (y) => `In a ${y} magic square using 1-9, the centre is 5. What is the magic constant?`,
    options: ["12", "13", "14", "15", "16"],
    answer: "15",
    solution: "Sum 1+2+…+9=45. Three rows share the total equally, so each row sums to 15.",
    alternative: "The middle row through the centre is 5 + two numbers summing to 10.",
  },
  {
    topic: "Speed, Distance and Time",
    stem: (y) => `A ${y} JMC question: a cyclist travels 30 km in 1.5 hours. What is the average speed?`,
    options: ["15 km/h", "18 km/h", "20 km/h", "25 km/h", "30 km/h"],
    answer: "20 km/h",
    solution: "Speed = distance / time = 30 / 1.5 = 20 km/h.",
    alternative: "1.5 hours = 90 minutes. 30 km / 90 min = 1/3 km per min = 20 km/h.",
  },
  {
    topic: "Mock Exam Technique",
    stem: (y) => `In the ${y} JMC, there are 25 questions in 60 minutes. Roughly how many seconds per question?`,
    options: ["120", "132", "144", "150", "180"],
    answer: "144",
    solution: "60 minutes = 3600 seconds. 3600/25 = 144 seconds per question.",
    alternative: "60/25 = 2.4 minutes = 2 min 24 sec = 144 seconds.",
  },
];

const level2Templates = [
  {
    topic: "Crossnumber Logic",
    stem: (y) => `A 3-digit crossnumber clue from ${y}: the number is divisible by 6 and 9, and its digits sum to 18. Which option works?`,
    options: ["234", "252", "261", "279", "288"],
    answer: "288",
    solution: "Divisible by 9 means digit sum is a multiple of 9, and divisible by 6 means even and divisible by 3. Only 288 has digit sum 18 and is even.",
    alternative: "Check digit sums first, then check parity.",
    proofPrompt: "Explain why every rejected option fails at least one condition.",
  },
  {
    topic: "Algebraic Modeling",
    stem: (y) => `In ${y}, one ticket and one pen cost 8, while two tickets and one pen cost 13. What is one ticket?`,
    options: ["3", "4", "5", "6", "7"],
    answer: "5",
    solution: "Subtract equations: (2t+p)-(t+p)=13-8 so t=5.",
    alternative: "Use substitution from p=8-t in the second equation.",
    proofPrompt: "Write two equations clearly and justify the subtraction step.",
  },
  {
    topic: "Proof and Uniqueness",
    stem: (y) => `Find all integers n such that $n(n-1)$ is even in a ${y} Olympiad-style warm-up.`,
    options: ["No integers", "Only even n", "Only odd n", "All integers", "Only primes"],
    answer: "All integers",
    solution: "Among consecutive integers n and n-1, one is always even, so their product is always even.",
    alternative: "Use two parity cases: n even or n odd.",
    proofPrompt: "Provide a two-case parity proof and conclude why no exceptions exist.",
  },
  {
    topic: "Fractions and Decimals",
    stem: (y) => `In ${y}, express $0.\\overline{36}$ as a fraction in lowest terms.`,
    options: ["4/11", "36/100", "9/25", "12/33", "36/99"],
    answer: "4/11",
    solution: "Let x = 0.363636…. Then 100x = 36.3636… so 99x = 36, giving x = 36/99 = 4/11.",
    alternative: "Recognise 1/11 = 0.090909… so 4/11 = 0.363636….",
    proofPrompt: "Show the algebraic derivation step by step and prove the fraction is fully simplified.",
  },
  {
    topic: "Powers and Roots",
    stem: (y) => `In ${y}, find the integer n such that $2^n = 8^3 \\div 4^2$.`,
    options: ["3", "4", "5", "6", "7"],
    answer: "5",
    solution: "$8^3 = 2^9$, $4^2 = 2^4$, so $2^9/2^4 = 2^5$, hence n = 5.",
    alternative: "Compute numerically: 512 / 16 = 32 = 2^5.",
    proofPrompt: "Express every term as a power of 2 and justify each index law step.",
  },
  {
    topic: "Symmetry and Nets",
    stem: (y) => `A ${y} Kangaroo puzzle: a cube has faces labelled 1-6 (opposite faces sum to 7). In a particular net, face 1 is adjacent to 2, 3, 4, 5. Which face is opposite face 1?`,
    options: ["2", "3", "4", "5", "6"],
    answer: "6",
    solution: "Opposite faces sum to 7, so the face opposite 1 is 6.",
    alternative: "In the net, the face not adjacent to 1 (and not 1 itself) must be opposite.",
    proofPrompt: "Explain why opposite-face pairs sum to 7 and how the net confirms it.",
  },
  {
    topic: "Circles and Semicircles",
    stem: (y) => `In ${y}, a circle of radius 5 is inscribed in a square. What is the shaded area between them?`,
    options: ["$100-25\\pi$", "$25-25\\pi$", "$100-10\\pi$", "$50-25\\pi$", "$25\\pi-100$"],
    answer: "$100-25\\pi$",
    solution: "Square side = diameter = 10, area 100. Circle area = 25π. Shaded = 100 − 25π.",
    alternative: "Compute numerically: 100 − 78.54… ≈ 21.46.",
    proofPrompt: "Define all dimensions from the constraint and justify each area formula used.",
  },
  {
    topic: "Logic Puzzles",
    stem: (y) => `In a ${y} Kangaroo problem, Amy, Ben and Cat each say 'I came first'. Exactly one tells the truth. Amy actually came last. Who won?`,
    options: ["Amy", "Ben", "Cat", "Cannot tell", "No one"],
    answer: "Ben",
    solution: "Amy lies (she was last). Cat also lies, so Ben tells the truth and came first.",
    alternative: "Test each person as the truth-teller and check consistency.",
    proofPrompt: "Use proof by cases: assume each in turn tells the truth and derive contradictions for two.",
  },
  {
    topic: "Speed, Distance and Time",
    stem: (y) => `A ${y} JMO problem: a car drives 60 km at 30 km/h then returns at 60 km/h. What is the average speed for the whole journey?`,
    options: ["35 km/h", "40 km/h", "42 km/h", "45 km/h", "50 km/h"],
    answer: "40 km/h",
    solution: "Total distance = 120 km. Time out = 2 h, time back = 1 h, total time = 3 h. Average = 120/3 = 40 km/h.",
    alternative: "Use the harmonic mean formula: $2ab/(a+b) = 2(30)(60)/90 = 40$.",
    proofPrompt: "Explain why the arithmetic mean (45) is wrong and derive the harmonic-mean formula.",
  },
  {
    topic: "Mock Exam Technique",
    stem: (y) => `In the ${y} JMC scoring: +5 for correct (Q1-15), +6 for correct (Q16-25), −1 for wrong, 0 for blank. A student answers 18 correctly (12 from Q1-15, 6 from Q16-25) and 4 wrong. What is the score?`,
    options: ["92", "94", "96", "100", "102"],
    answer: "92",
    solution: "$12 \\times 5 + 6 \\times 6 - 4 \\times 1 = 60 + 36 - 4 = 92$.",
    alternative: "Calculate each section separately and combine.",
    proofPrompt: "Show the full calculation with each scoring band explained.",
  },
];

const choiceLabels = ["A", "B", "C", "D", "E"];
const questionBank = [];

for (const year of years) {
  for (let i = 0; i < level1Templates.length; i += 1) {
    const t = level1Templates[i];
    questionBank.push({
      id: `Y${year}-L1-${i + 1}`,
      year,
      source: `JMC ${year}`,
      difficulty: "level1",
      topic: t.topic,
      stem: t.stem(year),
      options: t.options.map((value, idx) => ({ label: choiceLabels[idx], value })),
      answer: t.answer,
      extendedSolution: t.solution,
      alternativeMethod: t.alternative,
    });
  }

  for (let i = 0; i < level2Templates.length; i += 1) {
    const t = level2Templates[i];
    questionBank.push({
      id: `Y${year}-L2-${i + 1}`,
      year,
      source: i === 0 ? `Junior Kangaroo ${year}` : `JMO ${year}`,
      difficulty: "level2",
      topic: t.topic,
      stem: t.stem(year),
      options: t.options.map((value, idx) => ({ label: choiceLabels[idx], value })),
      answer: t.answer,
      extendedSolution: t.solution,
      alternativeMethod: t.alternative,
      proofPrompt: t.proofPrompt,
    });
  }
}

fs.writeFileSync(path.join(outDir, "past-papers.json"), `${JSON.stringify(paperIndex, null, 2)}\n`);
fs.writeFileSync(path.join(outDir, "questions.json"), `${JSON.stringify(questionBank, null, 2)}\n`);

console.log(`Generated ${paperIndex.length} paper entries and ${questionBank.length} questions.`);
