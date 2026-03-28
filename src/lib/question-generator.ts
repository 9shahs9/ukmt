import type { Difficulty, PracticeQuestion } from "@/lib/types";

/* ══════════ Helpers ══════════ */

let counter = 0;
function uid(): string {
  return `gen-${Date.now()}-${++counter}-${Math.random().toString(36).slice(2, 7)}`;
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sample<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a), y = Math.abs(b);
  while (y) { [x, y] = [y, x % y]; }
  return x;
}

function lcm(a: number, b: number): number { return (a / gcd(a, b)) * b; }

function buildOpts(correct: string, pool: string[]): { label: string; value: string }[] {
  const unique = Array.from(new Set([correct, ...pool.filter((v) => v !== correct)])).slice(0, 5);
  while (unique.length < 5) unique.push(`${correct}(?)`);
  const vals = shuffle(unique);
  return vals.map((v, i) => ({ label: String.fromCharCode(65 + i), value: v }));
}

function q(
  topic: string,
  diff: Difficulty,
  stem: string,
  correct: string,
  distractors: string[],
  sol: string,
  alt: string,
  proof?: string,
): PracticeQuestion {
  return {
    id: uid(),
    year: randInt(2011, 2025),
    source: diff === "level1" ? "Generated JMC" : "Generated JMO",
    difficulty: diff,
    topic,
    stem,
    options: buildOpts(correct, distractors),
    answer: correct,
    extendedSolution: sol,
    alternativeMethod: alt,
    ...(proof ? { proofPrompt: proof } : {}),
    generated: true,
  };
}

type QGen = () => PracticeQuestion;

/* ══════════ DIVISIBILITY RULES ══════════ */

function divByDigitSum9(): PracticeQuestion {
  const a = randInt(1, 9), b = randInt(0, 9);
  const partial = a + b;
  let need = (9 - (partial % 9)) % 9;
  if (need === 0) need = 9;
  const ds = [need, (need + 2) % 10 || 1, (need + 4) % 10 || 2, (need + 5) % 10 || 3, (need + 7) % 10 || 4];
  return q("Divisibility Rules", "level1",
    `Which digit $d$ makes $${a}d${b}$ divisible by $9$?`,
    String(need), ds.slice(1).map(String),
    `Digit sum = ${a}+d+${b} = ${partial}+d. For divisibility by 9, need ${partial}+d to be a multiple of 9, so d = ${need}.`,
    "Test each option's digit sum.");
}

function divByDigitSum3(): PracticeQuestion {
  const a = randInt(1, 9), b = randInt(0, 9), c = randInt(0, 9);
  const partial = a + b + c;
  let need = (3 - (partial % 3)) % 3;
  // multiple solutions; pick the smallest positive
  const digits = [need, need + 3, need + 6].filter((d) => d >= 0 && d <= 9);
  const correct = sample(digits);
  const ds = Array.from({ length: 4 }, () => randInt(0, 9)).filter((d) => !digits.includes(d));
  while (ds.length < 4) ds.push(randInt(0, 9));
  return q("Divisibility Rules", "level1",
    `Which digit $d$ could make $${a}${b}d${c}$ divisible by $3$?`,
    String(correct), ds.slice(0, 4).map(String),
    `Digit sum = ${partial}+d. We need this divisible by 3. d = ${correct} gives ${partial + correct}.`,
    "Check each option: sum mod 3 must equal 0.");
}

function divBy11Check(): PracticeQuestion {
  const a = randInt(1, 9), b = randInt(0, 9), c = randInt(0, 9), d = randInt(0, 9);
  const num = a * 1000 + b * 100 + c * 10 + d;
  const altSum = (a - b + c - d);
  const isDivisible = altSum % 11 === 0;
  return q("Divisibility Rules", "level1",
    `Is $${num}$ divisible by $11$?`,
    isDivisible ? "Yes" : "No", isDivisible ? ["No", "Only by 3", "Only by 7", "Cannot tell"] : ["Yes", "Only by 3", "Only by 7", "Cannot tell"],
    `Alternating sum: ${a}−${b}+${c}−${d} = ${altSum}. ${Math.abs(altSum)} ${altSum % 11 === 0 ? "is" : "is not"} divisible by 11.`,
    "Use the alternating digit-sum rule for 11.");
}

function divWhichDivisible(): PracticeQuestion {
  const divisor = sample([4, 6, 8, 12]);
  const base = randInt(10, 40) * divisor;
  const wrong = [base + 1, base + 2, base - 1, base + divisor - 1];
  return q("Divisibility Rules", "level1",
    `Which of these is divisible by ${divisor}?`,
    String(base), wrong.map(String),
    `${base} ÷ ${divisor} = ${base / divisor}, an integer. The others leave remainders.`,
    `Test each: divide by ${divisor} and check for a whole number.`);
}

/* ══════════ PERCENTAGES ══════════ */

function pctIncrease(): PracticeQuestion {
  const base = sample([20, 25, 30, 40, 50, 60, 75, 80, 100, 120, 150, 200]);
  const inc = randInt(1, Math.floor(base * 0.8));
  const pct = Math.round((inc / base) * 100);
  const ds = [pct + 5, pct + 10, Math.max(1, pct - 5), Math.max(1, pct - 10)];
  return q("Percentages", "level1",
    `A score rises from ${base} to ${base + inc}. What is the percentage increase?`,
    `${pct}%`, ds.map((d) => `${d}%`),
    `Increase = ${inc}, base = ${base}. $${inc}/${base} \\times 100 = ${pct}\\%$.`,
    "Scale the base to 100 mentally.");
}

function pctOfValue(): PracticeQuestion {
  const pct = sample([5, 10, 15, 20, 25, 30, 40, 50, 60, 75]);
  const base = sample([40, 60, 80, 120, 150, 200, 250, 300, 400, 500]);
  const ans = (pct / 100) * base;
  const ds = [ans + 5, ans + 10, Math.max(1, ans - 5), Math.max(1, ans - 10)];
  return q("Percentages", "level1",
    `What is ${pct}% of ${base}?`,
    String(ans), ds.map(String),
    `$${pct}/100 \\times ${base} = ${ans}$.`,
    `Find 10% first (${base / 10}), then scale.`);
}

function pctReverse(): PracticeQuestion {
  const pctOff = sample([10, 15, 20, 25, 30, 40, 50]);
  const original = sample([40, 50, 60, 80, 100, 120, 150, 200]);
  const sale = original * (100 - pctOff) / 100;
  const ds = [original + 10, original - 10, Math.round(sale * 1.1), Math.round(sale * 0.9)];
  return q("Percentages", "level1",
    `After a ${pctOff}% discount, an item costs £${sale}. What was the original price?`,
    `£${original}`, ds.map((d) => `£${d}`),
    `Sale price = ${100 - pctOff}% of original. So original = $${sale} \\div ${(100 - pctOff) / 100} = £${original}$.`,
    `${sale} represents ${100 - pctOff}%. Find 1% then multiply by 100.`);
}

/* ══════════ PRIME FACTORIZATION ══════════ */

function factorCount(): PracticeQuestion {
  const a = randInt(1, 7), b = randInt(1, 5);
  const cnt = (a + 1) * (b + 1);
  const ds = [cnt + 2, cnt + 4, Math.max(2, cnt - 2), Math.max(2, cnt - 4)];
  return q("Prime Factorization", "level1",
    `How many positive factors does $2^{${a}} \\cdot 3^{${b}}$ have?`,
    String(cnt), ds.map(String),
    `$(${a}+1)(${b}+1) = ${cnt}$ factors.`,
    "List factors by choosing each exponent independently.");
}

function hcfQuestion(): PracticeQuestion {
  const p = randInt(1, 3), q2 = randInt(1, 3), r = randInt(0, 2), s = randInt(0, 2);
  const x = Math.pow(2, p) * Math.pow(3, r) * (r > 0 ? 1 : 1);
  const a = Math.pow(2, p + randInt(0, 2)) * Math.pow(3, r) * Math.pow(5, randInt(0, 1));
  const b = Math.pow(2, p) * Math.pow(3, r + randInt(0, 2)) * Math.pow(7, randInt(0, 1));
  const h = gcd(a, b);
  const ds = [h * 2, h * 3, Math.max(1, Math.floor(h / 2)), h + 1];
  return q("Prime Factorization", "level1",
    `What is the HCF of ${a} and ${b}?`,
    String(h), ds.map(String),
    `Factorise: ${a} and ${b}. Take the minimum power of each common prime. HCF = ${h}.`,
    "Use the Euclidean algorithm: repeatedly divide the larger by the smaller.");
}

function lcmQuestion(): PracticeQuestion {
  const a = sample([4, 6, 8, 9, 10, 12, 14, 15, 18, 20]);
  const b = sample([6, 8, 9, 10, 12, 14, 15, 18, 20, 21]);
  const l = lcm(a, b);
  const ds = [l + a, l + b, a * b, Math.max(1, l - a)];
  return q("Prime Factorization", "level1",
    `What is the LCM of ${a} and ${b}?`,
    String(l), ds.map(String),
    `Factorise both and take max powers. LCM = ${l}.`,
    `LCM = ${a}×${b} / HCF(${a},${b}) = ${a * b}/${gcd(a, b)} = ${l}.`);
}

/* ══════════ ANGLES ══════════ */

function interiorAngle(): PracticeQuestion {
  const n = sample([3, 4, 5, 6, 8, 9, 10, 12]);
  const angle = ((n - 2) * 180) / n;
  const ds = [angle + 6, angle - 6, angle + 12, angle - 12].map((d) => `${d}°`);
  return q("Angles", "level1",
    `What is each interior angle of a regular ${n}-gon?`,
    `${angle}°`, ds,
    `$\\frac{(${n}-2)\\times 180}{${n}} = ${angle}°$.`,
    `Sum = ${(n - 2) * 180}°, divide by ${n}.`);
}

function exteriorAngle(): PracticeQuestion {
  const n = sample([3, 4, 5, 6, 8, 9, 10, 12, 15, 18, 20]);
  const ext = 360 / n;
  const ds = [ext + 5, ext + 10, Math.max(1, ext - 5), ext * 2].map((d) => `${d}°`);
  return q("Angles", "level1",
    `What is each exterior angle of a regular ${n}-gon?`,
    `${ext}°`, ds,
    `Exterior angles sum to 360°. Each = $360/${n} = ${ext}°$.`,
    `Interior + exterior = 180°; find interior first.`);
}

function triangleAngle(): PracticeQuestion {
  const a = randInt(20, 80), b = randInt(20, 140 - a);
  const c = 180 - a - b;
  const ds = [c + 5, c + 10, c - 5, c + 15].map((d) => `${d}°`);
  return q("Angles", "level1",
    `A triangle has angles ${a}° and ${b}°. What is the third angle?`,
    `${c}°`, ds,
    `Angles in a triangle sum to 180°. Third = $180 - ${a} - ${b} = ${c}°$.`,
    "Use the angle-sum property directly.");
}

function straightLine(): PracticeQuestion {
  const a = randInt(30, 110), b = randInt(20, 140 - a);
  const x = 180 - a - b;
  const ds = [x + 5, x + 10, x - 5, 360 - a - b].map((d) => `${d}°`);
  return q("Angles", "level1",
    `Three angles on a straight line are ${a}°, ${b}°, and x°. Find x.`,
    `${x}°`, ds,
    `Angles on a straight line sum to 180°. $x = 180 - ${a} - ${b} = ${x}°$.`,
    "Subtract the known angles from 180.");
}

/* ══════════ FRACTIONS AND DECIMALS ══════════ */

function fractionAdd(): PracticeQuestion {
  const pairs: [number, number, number, number][] = [];
  for (let b = 2; b <= 12; b++) for (let d = 2; d <= 12; d++) if (b !== d) pairs.push([randInt(1, b - 1), b, randInt(1, d - 1), d]);
  const [a, b, c, d] = sample(pairs);
  const num = a * d + c * b, den = b * d;
  const g = gcd(num, den);
  const rn = num / g, rd = den / g;
  const correct = `${rn}/${rd}`;
  return q("Fractions and Decimals", "level1",
    `What is $\\frac{${a}}{${b}} + \\frac{${c}}{${d}}$ in lowest terms?`,
    correct, [`${rn + 1}/${rd}`, `${rn}/${rd + 1}`, `${Math.max(1, rn - 1)}/${rd}`, `${a + c}/${b + d}`],
    `Common denominator ${den}. $\\frac{${a * d}}{${den}}+\\frac{${c * b}}{${den}}=\\frac{${num}}{${den}}=\\frac{${rn}}{${rd}}$.`,
    "Convert to decimals, add, convert back.");
}

function fractionMultiply(): PracticeQuestion {
  const a = randInt(1, 9), b = randInt(2, 10), c = randInt(1, 9), d = randInt(2, 10);
  const num = a * c, den = b * d;
  const g = gcd(num, den);
  const rn = num / g, rd = den / g;
  const correct = rd === 1 ? String(rn) : `${rn}/${rd}`;
  return q("Fractions and Decimals", "level1",
    `What is $\\frac{${a}}{${b}} \\times \\frac{${c}}{${d}}$ in lowest terms?`,
    correct, [`${rn + 1}/${rd}`, `${rn}/${Math.max(1, rd - 1)}`, `${a * c}/${b + d}`, `${Math.max(1, rn - 1)}/${rd}`],
    `Multiply tops and bottoms: $\\frac{${num}}{${den}} = \\frac{${rn}}{${rd}}$.`,
    "Cancel common factors before multiplying.");
}

function fractionToDecimal(): PracticeQuestion {
  const fracs: [number, number, string][] = [
    [1, 8, "0.125"], [3, 8, "0.375"], [5, 8, "0.625"], [7, 8, "0.875"],
    [1, 5, "0.2"], [2, 5, "0.4"], [3, 5, "0.6"], [4, 5, "0.8"],
    [1, 4, "0.25"], [3, 4, "0.75"], [1, 3, "0.333..."], [2, 3, "0.666..."],
    [1, 6, "0.1666..."], [5, 6, "0.8333..."], [1, 7, "0.142857..."], [3, 7, "0.428571..."],
  ];
  const [a, b, dec] = sample(fracs);
  return q("Fractions and Decimals", "level1",
    `Convert $\\frac{${a}}{${b}}$ to a decimal.`,
    dec, ["0.5", "0.333...", "0.75", "0.125"].filter((d) => d !== dec),
    `$${a} \\div ${b} = ${dec}$.`,
    "Use long division or recognise benchmark fractions.");
}

/* ══════════ POWERS AND ROOTS ══════════ */

function powerSimplify(): PracticeQuestion {
  const base = sample([2, 3, 5, 7]);
  const m = randInt(2, 6), n = randInt(1, 5);
  const total = m + n;
  return q("Powers and Roots", "level1",
    `Simplify $${base}^{${m}} \\times ${base}^{${n}}$.`,
    `${base}^${total}`, [`${base}^${m * n}`, `${base}^${Math.max(1, total - 1)}`, `${base}^${total + 1}`, `${base * base}^${m}`],
    `$a^m \\times a^n = a^{m+n} = ${base}^{${total}}$.`,
    `Compute: ${Math.pow(base, m)} × ${Math.pow(base, n)} = ${Math.pow(base, total)} = ${base}^${total}.`);
}

function sqrtSimplify(): PracticeQuestion {
  const inner = sample([8, 12, 18, 20, 27, 32, 45, 48, 50, 72, 75, 98, 128, 200]);
  // find largest perfect square factor
  let factor = 1;
  for (let k = Math.floor(Math.sqrt(inner)); k >= 2; k--) {
    if (inner % (k * k) === 0) { factor = k; break; }
  }
  const remainder = inner / (factor * factor);
  const correct = remainder === 1 ? String(factor) : `${factor}√${remainder}`;
  return q("Powers and Roots", "level1",
    `Simplify $\\sqrt{${inner}}$.`,
    correct, [`${factor + 1}√${remainder}`, `${Math.max(1, factor - 1)}√${remainder}`, `√${inner}`, `${factor}√${remainder + 1}`],
    `$\\sqrt{${inner}} = \\sqrt{${factor * factor} \\times ${remainder}} = ${correct}$.`,
    `Prime factorise ${inner}, pull out pairs.`);
}

function powerOfPower(): PracticeQuestion {
  const base = sample([2, 3, 5]);
  const m = randInt(2, 4), n = randInt(2, 3);
  const total = m * n;
  return q("Powers and Roots", "level1",
    `Simplify $(${base}^{${m}})^{${n}}$.`,
    `${base}^${total}`, [`${base}^${m + n}`, `${base}^${total + 1}`, `${base}^${Math.max(1, total - 1)}`, `${base * n}^${m}`],
    `$(a^m)^n = a^{mn} = ${base}^{${total}}$.`,
    `Compute: ${Math.pow(base, m)} raised to the ${n} = ${Math.pow(base, total)}.`);
}

function perfectSquareCube(): PracticeQuestion {
  const sq = randInt(4, 15);
  const val = sq * sq;
  return q("Powers and Roots", "level1",
    `What is $\\sqrt{${val}}$?`,
    String(sq), [String(sq + 1), String(sq - 1), String(sq + 2), String(Math.max(1, sq - 2))],
    `$${sq}^2 = ${val}$, so $\\sqrt{${val}} = ${sq}$.`,
    "Know perfect squares up to 225.");
}

/* ══════════ AREA AND PERIMETER ══════════ */

function rectArea(): PracticeQuestion {
  const l = randInt(3, 20), w = randInt(2, 15);
  const area = l * w;
  return q("Area and Perimeter", "level1",
    `A rectangle is ${l} cm by ${w} cm. What is its area?`,
    `${area} cm²`, [`${area + l} cm²`, `${2 * (l + w)} cm²`, `${area - w} cm²`, `${area + 5} cm²`],
    `Area = length × width = ${l} × ${w} = ${area} cm².`,
    "Multiply the two side lengths.");
}

function triangleArea(): PracticeQuestion {
  const b = randInt(4, 20), h = randInt(3, 16);
  const area = (b * h) / 2;
  const aStr = Number.isInteger(area) ? String(area) : area.toFixed(1);
  return q("Area and Perimeter", "level1",
    `A triangle has base ${b} cm and height ${h} cm. What is its area?`,
    `${aStr} cm²`, [`${b * h} cm²`, `${area + 3} cm²`, `${Math.max(1, area - 3)} cm²`, `${area + 5} cm²`].map((s) => s),
    `Area = $\\frac{1}{2} \\times ${b} \\times ${h} = ${aStr}$ cm².`,
    "Half base times height.");
}

function compositePerimeter(): PracticeQuestion {
  const a = randInt(4, 12), b = randInt(3, 10), cut = randInt(1, Math.min(a, b) - 1);
  const perim = 2 * a + 2 * b + 2 * cut;
  return q("Area and Perimeter", "level1",
    `An L-shape is made by cutting a ${cut}×${cut} square from a ${a}×${b} rectangle. What is its perimeter?`,
    `${perim} cm`, [`${2 * (a + b)} cm`, `${perim + 2} cm`, `${perim - 2} cm`, `${perim + 4} cm`],
    `Cutting a corner adds 2×${cut} to the rectangle perimeter. P = ${2 * (a + b)} + ${2 * cut} = ${perim} cm.`,
    "Trace around the outside and count every edge.");
}

function shadedArea(): PracticeQuestion {
  const big = randInt(6, 15), small = randInt(2, big - 2);
  const shaded = big * big - small * small;
  return q("Area and Perimeter", "level1",
    `A ${small}×${small} square is cut from a ${big}×${big} square. What is the shaded area?`,
    `${shaded} cm²`, [`${big * big} cm²`, `${shaded + 4} cm²`, `${shaded - 4} cm²`, `${small * small} cm²`],
    `$${big}^2 - ${small}^2 = ${big * big} - ${small * small} = ${shaded}$ cm².`,
    "Subtract the smaller area from the larger.");
}

/* ══════════ SYMMETRY AND NETS ══════════ */

function linesOfSymmetry(): PracticeQuestion {
  const shapes: [string, number][] = [
    ["equilateral triangle", 3], ["square", 4], ["regular pentagon", 5],
    ["regular hexagon", 6], ["regular octagon", 8], ["regular heptagon", 7],
    ["regular nonagon", 9], ["regular decagon", 10], ["regular dodecagon", 12],
  ];
  const [shape, n] = sample(shapes);
  return q("Symmetry and Nets", "level1",
    `How many lines of symmetry does a ${shape} have?`,
    String(n), [String(n + 1), String(Math.max(1, n - 1)), String(n * 2), String(Math.max(1, n - 2))].map(String),
    `A regular n-gon has n lines of symmetry. n = ${n}.`,
    "Draw and count: lines through vertices and midpoints of opposite sides.");
}

function rotationalOrder(): PracticeQuestion {
  const shapes: [string, number][] = [
    ["equilateral triangle", 3], ["square", 4], ["regular pentagon", 5],
    ["regular hexagon", 6], ["parallelogram", 2], ["rectangle", 2],
  ];
  const [shape, order] = sample(shapes);
  return q("Symmetry and Nets", "level1",
    `What is the order of rotational symmetry of a ${shape}?`,
    String(order), [String(order + 1), String(Math.max(1, order - 1)), String(order * 2), "1"].map(String),
    `A ${shape} maps onto itself ${order} times during a full 360° rotation.`,
    `Each rotation of ${360 / order}° gives the same shape.`);
}

function cubeNetOpposite(): PracticeQuestion {
  const top = randInt(1, 6);
  const opp = 7 - top;
  return q("Symmetry and Nets", "level1",
    `A cube has faces 1-6 where opposite faces sum to 7. Which face is opposite ${top}?`,
    String(opp), [String(top), String((top % 6) + 1), String(((top + 1) % 6) + 1), String(((top + 2) % 6) + 1)].map(String),
    `Opposite faces sum to 7. ${top} + ? = 7, so ? = ${opp}.`,
    "Standard die convention: 1↔6, 2↔5, 3↔4.");
}

/* ══════════ CIRCLES AND SEMICIRCLES ══════════ */

function circleArea(): PracticeQuestion {
  const r = randInt(2, 12);
  const area = `${r * r}π`;
  return q("Circles and Semicircles", "level1",
    `What is the area of a circle with radius ${r}?`,
    area, [`${2 * r}π`, `${r * r + r}π`, `${r * (r + 1)}π`, `${r}π`],
    `Area = $\\pi r^2 = \\pi \\times ${r}^2 = ${r * r}\\pi$.`,
    "Square the radius, multiply by π.");
}

function semicirclePerimeter(): PracticeQuestion {
  const r = randInt(2, 10);
  const d = 2 * r;
  const correct = `${r}π+${d}`;
  return q("Circles and Semicircles", "level1",
    `A semicircle has diameter ${d}. What is its perimeter (in terms of π)?`,
    correct, [`${d}π`, `${r}π`, `${r}π+${r}`, `${d}π+${d}`],
    `Curved part = $\\pi r = ${r}\\pi$. Add diameter ${d}. Total = $${r}\\pi + ${d}$.`,
    "Half circumference plus the diameter.");
}

function circleCircumference(): PracticeQuestion {
  const r = randInt(2, 15);
  const circ = `${2 * r}π`;
  return q("Circles and Semicircles", "level1",
    `What is the circumference of a circle with radius ${r}?`,
    circ, [`${r}π`, `${r * r}π`, `${2 * r + 1}π`, `${r + 1}π`],
    `$C = 2\\pi r = 2 \\times ${r} \\times \\pi = ${2 * r}\\pi$.`,
    "Diameter × π, or 2πr.");
}

function shadedCircleSquare(): PracticeQuestion {
  const r = sample([3, 4, 5, 6, 7, 8]);
  const side = 2 * r;
  const correct = `${side * side}-${r * r}π`;
  return q("Circles and Semicircles", "level2",
    `A circle of radius ${r} is inscribed in a square. What is the shaded area between them?`,
    correct, [`${r * r}π`, `${side * side}`, `${side * side}+${r * r}π`, `${side * side}-${r}π`],
    `Square area = ${side}² = ${side * side}. Circle area = ${r * r}π. Shaded = $${side * side} - ${r * r}\\pi$.`,
    "Compute both areas, subtract.",
    "Justify why the square's side equals the circle's diameter.");
}

/* ══════════ SEQUENCES ══════════ */

function arithmeticNext(): PracticeQuestion {
  const a = randInt(1, 20), d = randInt(2, 15);
  const terms = [a, a + d, a + 2 * d, a + 3 * d];
  const next = a + 4 * d;
  return q("Sequences", "level1",
    `Sequence: ${terms.join(", ")}, ... What is the next term?`,
    String(next), [String(next + d), String(next - 1), String(next + 1), String(next + 2 * d)],
    `Common difference = ${d}. Next = ${terms[3]} + ${d} = ${next}.`,
    "Check differences between consecutive terms.");
}

function geometricNext(): PracticeQuestion {
  const a = sample([2, 3, 5]);
  const r = sample([2, 3]);
  const terms = [a, a * r, a * r * r, a * r * r * r];
  const next = a * Math.pow(r, 4);
  return q("Sequences", "level1",
    `Sequence: ${terms.join(", ")}, ... What is the next term?`,
    String(next), [String(next + a), String(next * 2), String(Math.max(1, next - a)), String(next + r)],
    `Common ratio = ${r}. Next = ${terms[3]} × ${r} = ${next}.`,
    "Divide consecutive terms to find the ratio.");
}

function fibLikeNext(): PracticeQuestion {
  const a = randInt(1, 8), b = randInt(1, 8);
  const c = a + b, d = b + c, e = c + d;
  return q("Sequences", "level1",
    `Each term is the sum of the two before: ${a}, ${b}, ${c}, ${d}, ... Next term?`,
    String(e), [String(e + 1), String(e - 1), String(d * 2), String(e + 2)],
    `${c} + ${d} = ${e}.`,
    "Add the last two terms.");
}

function nthTermArithmetic(): PracticeQuestion {
  const a = randInt(1, 10), d = randInt(2, 8);
  const n = randInt(10, 25);
  const ans = a + (n - 1) * d;
  return q("Sequences", "level1",
    `An arithmetic sequence starts ${a}, ${a + d}, ${a + 2 * d}, ... What is the ${n}th term?`,
    String(ans), [String(ans + d), String(ans - d), String(a * n), String(ans + 1)],
    `$a_n = ${a} + (${n}-1) \\times ${d} = ${ans}$.`,
    `Use the formula a + (n−1)d.`);
}

/* ══════════ EQUATIONS / ALGEBRAIC MODELING ══════════ */

function simultaneousSimple(): PracticeQuestion {
  const x = randInt(2, 12), y = randInt(1, 10);
  const s = x + y, t = 2 * x + y;
  return q("Algebraic Modeling", "level2",
    `One apple and one banana cost ${s}p. Two apples and one banana cost ${t}p. What is one apple?`,
    `${x}p`, [`${y}p`, `${x + 1}p`, `${Math.max(1, x - 1)}p`, `${s}p`],
    `Subtract: $(2a+b)-(a+b) = ${t}-${s}$, so $a = ${x}$p.`,
    "Substitute: $b = ${s} - a$ into the second equation.",
    "Write both equations and justify the subtraction step.");
}

function ageProblem(): PracticeQuestion {
  const diff = randInt(15, 35);
  const childNow = randInt(5, 20);
  const parentNow = childNow + diff;
  const sumNow = childNow + parentNow;
  return q("Algebraic Modeling", "level2",
    `A parent is ${diff} years older than their child. Their ages sum to ${sumNow}. How old is the child?`,
    String(childNow), [String(childNow + 2), String(childNow - 2), String(parentNow), String(Math.max(1, childNow - 1))],
    `Let child = c. Then $c + (c+${diff}) = ${sumNow}$, so $2c = ${sumNow - diff}$, $c = ${childNow}$.`,
    "Trial and improvement: guess the child's age and check.",
    "Set up the equation clearly and solve step by step.");
}

function costProblem(): PracticeQuestion {
  const a = randInt(2, 8), b = randInt(1, 6);
  const n1 = randInt(2, 5), m1 = randInt(1, 4);
  const n2 = randInt(1, 4), m2 = randInt(2, 5);
  const total1 = n1 * a + m1 * b;
  const total2 = n2 * a + m2 * b;
  return q("Algebraic Modeling", "level2",
    `${n1} pens and ${m1} rulers cost £${total1}. ${n2} pens and ${m2} rulers cost £${total2}. What is one pen?`,
    `£${a}`, [`£${b}`, `£${a + 1}`, `£${Math.max(1, a - 1)}`, `£${a + 2}`],
    `Solve simultaneously: ${n1}p+${m1}r=${total1} and ${n2}p+${m2}r=${total2}. p = £${a}.`,
    "Eliminate one variable by matching coefficients.",
    "Show how you eliminate one variable.");
}

/* ══════════ CROSSNUMBER LOGIC ══════════ */

function crossnumberDivCombo(): PracticeQuestion {
  const d1 = sample([6, 12, 15, 18]);
  const d2 = sample([4, 5, 9, 7].filter((x) => x !== d1));
  const l = lcm(d1, d2);
  const mult = randInt(1, Math.floor(999 / l));
  const correct = l * mult;
  const wrongs = [correct + 1, correct + 2, correct - 1, correct + d1];
  return q("Crossnumber Logic", "level2",
    `Find a number divisible by both ${d1} and ${d2} closest to ${correct + randInt(-3, 3)}.`,
    String(correct), wrongs.map(String),
    `LCM(${d1},${d2}) = ${l}. Nearest multiple: ${correct}.`,
    `Test each option for divisibility by both.`,
    "Explain each divisibility check.");
}

function digitProduct(): PracticeQuestion {
  const a = randInt(2, 4), b = randInt(2, 5), c = randInt(1, 4);
  const prod = a * b * c;
  const num = a * 100 + b * 10 + c;
  const wrongs = [num + 10, num - 10, num + 1, num + 100];
  return q("Crossnumber Logic", "level2",
    `A 3-digit number has digit product ${prod} and digit sum ${a + b + c}. The hundreds digit is ${a}. What is the number?`,
    String(num), wrongs.map(String),
    `Hundreds = ${a}. Need $${a} \\times t \\times u = ${prod}$ and $${a}+t+u=${a + b + c}$. So t=${b}, u=${c}. Number = ${num}.`,
    "Factorise the digit product systematically.",
    "Show why other digit combinations fail.");
}

/* ══════════ LOGIC PUZZLES ══════════ */

function magicConstant(): PracticeQuestion {
  const lo = randInt(0, 20);
  const hi = lo + 8;
  const magic = 3 * (lo + 4);
  return q("Logic Puzzles", "level2",
    `A 3×3 magic square uses consecutive integers from ${lo} to ${hi}. What is the magic constant?`,
    String(magic), [String(magic + 1), String(magic - 1), String(magic + 3), String(Math.max(1, magic - 3))],
    `Sum = $\\frac{9(${lo}+${hi})}{2} = ${(9 * (lo + hi)) / 2}$. Each row = $${(9 * (lo + hi)) / 2}/3 = ${magic}$.`,
    "The constant is 3× the middle number of the set.",
    "Prove the formula for consecutive-integer magic squares.");
}

function truthLiar(): PracticeQuestion {
  const names = shuffle(["Amy", "Ben", "Cat", "Dan", "Eve"]).slice(0, 3);
  const winner = sample(names);
  const loser = sample(names.filter((n) => n !== winner));
  return q("Logic Puzzles", "level2",
    `${names.join(", ")} each say "I came first". Exactly one tells the truth. ${loser} actually came last. Who won?`,
    winner, names.filter((n) => n !== winner),
    `${loser} lies (came last). The other non-winner also lies. So ${winner} tells the truth and came first.`,
    "Test each person as the truth-teller and check for contradictions.",
    "Use proof by cases: assume each in turn tells the truth.");
}

function logicElimination(): PracticeQuestion {
  const items = shuffle(["red", "blue", "green"]);
  const people = shuffle(["Alex", "Blake", "Casey"]);
  const ans = people[0];
  return q("Logic Puzzles", "level2",
    `${people[0]}, ${people[1]}, and ${people[2]} each have a ${items[0]}, ${items[1]}, or ${items[2]} hat. ${people[1]} doesn't have ${items[0]}. ${people[2]} has ${items[2]}. Who has ${items[0]}?`,
    ans, [people[1], people[2], "Nobody", "Cannot tell"],
    `${people[2]} → ${items[2]}. ${people[1]} ≠ ${items[0]}, so ${people[1]} → ${items[1]}. That leaves ${people[0]} → ${items[0]}.`,
    "Use an elimination grid.",
    "Show all deduction steps and why no other assignment works.");
}

/* ══════════ SPEED, DISTANCE AND TIME ══════════ */

function basicSDT(): PracticeQuestion {
  const s = sample([20, 30, 40, 50, 60, 80]);
  const t = sample([1.5, 2, 2.5, 3, 4, 5]);
  const d = s * t;
  return q("Speed, Distance and Time", "level2",
    `A car travels at ${s} km/h for ${t} hours. How far does it go?`,
    `${d} km`, [`${d + s} km`, `${d - s} km`, `${s + t} km`, `${d / 2} km`],
    `Distance = speed × time = ${s} × ${t} = ${d} km.`,
    "Use D = S × T directly.");
}

function harmonicMean(): PracticeQuestion {
  const d = sample([40, 60, 80, 100, 120]);
  const s1 = sample([20, 30, 40, 50]);
  const s2 = s1 * 2;
  const avg = (2 * s1 * s2) / (s1 + s2);
  const arith = (s1 + s2) / 2;
  return q("Speed, Distance and Time", "level2",
    `A car drives ${d} km at ${s1} km/h then returns at ${s2} km/h. What is the average speed?`,
    `${avg} km/h`, [`${arith} km/h`, `${avg + 5} km/h`, `${Math.max(10, avg - 5)} km/h`, `${avg + 10} km/h`],
    `Total distance = ${2 * d} km. Total time = ${d}/${s1} + ${d}/${s2} = ${d / s1 + d / s2} h. Average = ${avg} km/h.`,
    `Harmonic mean: $\\frac{2 \\times ${s1} \\times ${s2}}{${s1}+${s2}} = ${avg}$.`,
    "Explain why the arithmetic mean is wrong here.");
}

function findTime(): PracticeQuestion {
  const s = sample([30, 40, 50, 60, 80, 100]);
  const d = s * sample([2, 3, 4, 5]);
  const t = d / s;
  return q("Speed, Distance and Time", "level2",
    `How long to travel ${d} km at ${s} km/h?`,
    `${t} hours`, [`${t + 1} hours`, `${Math.max(0.5, t - 1)} hours`, `${t + 0.5} hours`, `${t * 2} hours`],
    `Time = distance / speed = ${d} / ${s} = ${t} hours.`,
    "Rearrange D = S × T.");
}

/* ══════════ PROOF AND UNIQUENESS ══════════ */

function parityProduct(): PracticeQuestion {
  return q("Proof and Uniqueness", "level2",
    "Which statement about $n(n-1)$ is true for ALL integers n?",
    "Always even", ["Always odd", "Even only when n is even", "Odd only when n is odd", "Sometimes prime"],
    "Consecutive integers have opposite parity; one is always even, so the product is always even.",
    "Test cases: n=3 → 6✓, n=4 → 12✓.",
    "Write a two-case parity proof.");
}

function sumConsecutive(): PracticeQuestion {
  const k = sample([3, 5, 7]);
  return q("Proof and Uniqueness", "level2",
    `The sum of ${k} consecutive integers is always divisible by…`,
    String(k), [String(k + 1), String(k - 1), "2", String(k * 2)],
    `Let the integers be $n, n+1, \\ldots, n+${k - 1}$. Sum = $${k}n + ${(k * (k - 1)) / 2}$. Since ${(k * (k - 1)) / 2} is divisible by ${k} when ${k} is odd, the total is always divisible by ${k}.`,
    `Try examples: e.g. 1+2+3 = 6 = 3×2.`,
    "Prove using algebra and state the general rule.");
}

function proofOddProduct(): PracticeQuestion {
  return q("Proof and Uniqueness", "level2",
    "If a and b are both odd, what can we say about ab?",
    "Always odd", ["Always even", "Could be either", "Always prime", "Always a perfect square"],
    "Odd × odd = odd. Let $a = 2m+1$, $b = 2n+1$. Then $ab = 4mn+2m+2n+1 = 2(2mn+m+n)+1$, which is odd.",
    "Test: 3×5=15 (odd), 7×9=63 (odd).",
    "Write the algebraic proof using 2m+1 notation.");
}

function proofSquareParity(): PracticeQuestion {
  return q("Proof and Uniqueness", "level2",
    "If $n^2$ is even, what must be true about n?",
    "n must be even", ["n must be odd", "n could be either", "n must be prime", "n must be positive"],
    "Contrapositive: if n is odd, $n^2 = (2k+1)^2 = 4k^2+4k+1$ is odd. So if $n^2$ is even, n must be even.",
    "Test: 4²=16✓, 6²=36✓; 3²=9 (odd) confirms converse.",
    "Prove by contrapositive.");
}

/* ══════════ MOCK EXAM TECHNIQUE ══════════ */

function secondsPerQ(): PracticeQuestion {
  const total = sample([25, 30, 20]);
  const mins = sample([60, 90, 120]);
  const secs = (mins * 60) / total;
  return q("Mock Exam Technique", "level1",
    `An exam has ${total} questions in ${mins} minutes. How many seconds per question?`,
    String(secs), [String(secs + 6), String(Math.max(6, secs - 6)), String(secs + 12), String(Math.max(6, secs - 12))],
    `${mins} min = ${mins * 60} s. ${mins * 60}/${total} = ${secs} s.`,
    `${mins}/${total} minutes each, convert to seconds.`);
}

function scoreCalc(): PracticeQuestion {
  const correct = randInt(12, 22);
  const wrong = randInt(2, 25 - correct);
  const blank = 25 - correct - wrong;
  const score = correct * 5 - wrong;
  return q("Mock Exam Technique", "level1",
    `JMC scoring: +5 correct, −1 wrong, 0 blank. A student answers ${correct} right, ${wrong} wrong, ${blank} blank. Score?`,
    String(score), [String(score + 5), String(score - 5), String(correct * 5), String(score + wrong)],
    `$${correct} \\times 5 - ${wrong} \\times 1 = ${correct * 5} - ${wrong} = ${score}$.`,
    "Calculate each part separately.");
}

function pacingStrategy(): PracticeQuestion {
  const easy = randInt(15, 20);
  const hard = 25 - easy;
  const easyTime = easy * 90;
  const hardTime = hard * 180;
  const total = easyTime + hardTime;
  const minutes = total / 60;
  return q("Mock Exam Technique", "level1",
    `Strategy: spend 90s on each of the ${easy} easier questions and 180s on the ${hard} harder ones. Total time needed?`,
    `${minutes} min`, [`${minutes + 5} min`, `${minutes - 5} min`, `60 min`, `${minutes + 10} min`],
    `${easy}×90 + ${hard}×180 = ${easyTime} + ${hardTime} = ${total}s = ${minutes} min.`,
    "Convert all to seconds, add, then convert back to minutes.");
}

/* ══════════ Topic → generators map ══════════ */

const topicGenerators: Record<string, QGen[]> = {
  "Divisibility Rules": [divByDigitSum9, divByDigitSum3, divBy11Check, divWhichDivisible],
  "Percentages": [pctIncrease, pctOfValue, pctReverse],
  "Prime Factorization": [factorCount, hcfQuestion, lcmQuestion],
  "Angles": [interiorAngle, exteriorAngle, triangleAngle, straightLine],
  "Fractions and Decimals": [fractionAdd, fractionMultiply, fractionToDecimal],
  "Powers and Roots": [powerSimplify, sqrtSimplify, powerOfPower, perfectSquareCube],
  "Area and Perimeter": [rectArea, triangleArea, compositePerimeter, shadedArea],
  "Symmetry and Nets": [linesOfSymmetry, rotationalOrder, cubeNetOpposite],
  "Circles and Semicircles": [circleArea, semicirclePerimeter, circleCircumference, shadedCircleSquare],
  "Sequences": [arithmeticNext, geometricNext, fibLikeNext, nthTermArithmetic],
  "Crossnumber Logic": [crossnumberDivCombo, digitProduct],
  "Algebraic Modeling": [simultaneousSimple, ageProblem, costProblem],
  "Proof and Uniqueness": [parityProduct, sumConsecutive, proofOddProduct, proofSquareParity],
  "Logic Puzzles": [magicConstant, truthLiar, logicElimination],
  "Speed, Distance and Time": [basicSDT, harmonicMean, findTime],
  "Mock Exam Technique": [secondsPerQ, scoreCalc, pacingStrategy],
};

/* ══════════ Concept → topic(s) map ══════════ */

const conceptTopics: Record<string, string[]> = {
  "Divisibility Rules": ["Divisibility Rules"],
  "Prime Factorization": ["Prime Factorization"],
  "Fractions, Decimals and Percentages": ["Fractions and Decimals", "Percentages"],
  "Powers and Roots": ["Powers and Roots"],
  "Angles in Polygons": ["Angles"],
  "Area and Perimeter": ["Area and Perimeter"],
  "Symmetry and Nets": ["Symmetry and Nets"],
  "Circles and Semicircles": ["Circles and Semicircles"],
  "Equations from Word Problems": ["Algebraic Modeling"],
  "Sequences and Patterns": ["Sequences", "Crossnumber Logic"],
  "Logic Puzzles": ["Logic Puzzles"],
  "Speed, Distance and Time": ["Speed, Distance and Time"],
  "Proof Writing and Uniqueness": ["Proof and Uniqueness"],
  "Mock Exams and Timed Practice": ["Mock Exam Technique"],
};

/* ══════════ Public API ══════════ */

/** Generate `count` unique questions for a concept, avoiding stems already seen. */
export function generateForConcept(
  concept: string,
  count: number,
  excludeIds: Set<string>,
): PracticeQuestion[] {
  const topics = conceptTopics[concept] ?? Object.keys(topicGenerators);
  const gens = topics.flatMap((t) => topicGenerators[t] ?? []);
  if (gens.length === 0) return [];

  const result: PracticeQuestion[] = [];
  const seenStems = new Set<string>();
  let attempts = 0;
  const maxAttempts = count * 50; // safety valve

  while (result.length < count && attempts < maxAttempts) {
    attempts++;
    const gen = sample(gens);
    const question = gen();
    if (excludeIds.has(question.id) || seenStems.has(question.stem)) continue;
    seenStems.add(question.stem);
    result.push(question);
  }

  return result;
}

/** Legacy: generate questions matching a difficulty from a source pool (used as fallback). */
export function generateSimilarQuestions(
  source: PracticeQuestion[],
  count: number,
  difficulty: Difficulty,
): PracticeQuestion[] {
  if (count <= 0 || source.length === 0) return [];
  const allGens = Object.values(topicGenerators).flat();
  const result: PracticeQuestion[] = [];
  const seenStems = new Set<string>();

  for (let i = 0; i < count * 30 && result.length < count; i++) {
    const gen = sample(allGens);
    const question = gen();
    if (seenStems.has(question.stem)) continue;
    if (question.difficulty !== difficulty) continue;
    seenStems.add(question.stem);
    result.push(question);
  }

  // If not enough at right difficulty, relax constraint
  if (result.length < count) {
    for (let i = 0; i < count * 10 && result.length < count; i++) {
      const gen = sample(allGens);
      const question = gen();
      if (!seenStems.has(question.stem)) {
        seenStems.add(question.stem);
        result.push(question);
      }
    }
  }

  return result;
}
