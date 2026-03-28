import type { ConceptFactSheet, TopicPlan } from "@/lib/types";

export const topicPlan: TopicPlan[] = [
  {
    id: 1,
    title: "Topic 1: Number Theory",
    focus: "Mental arithmetic and number properties",
    goals: [
      "Prime numbers and factorization",
      "Divisibility rules for 3, 4, 9, and 11",
      "Fractions, decimals, percentages without a calculator",
      "Square and cube fluency for crossnumber-style tasks",
    ],
  },
  {
    id: 2,
    title: "Topic 2: Geometry",
    focus: "Deduction from shape properties",
    goals: [
      "Angle facts in lines, triangles, and polygons",
      "Area and perimeter in composite diagrams",
      "Symmetry, reflections, and nets",
      "Circle and semicircle perimeter/area reasoning",
    ],
  },
  {
    id: 3,
    title: "Topic 3: Algebra and Logic",
    focus: "Modeling and puzzle strategies",
    goals: [
      "Forming equations from words",
      "Pattern and sequence recognition",
      "Magic-square and truth-teller style logic",
      "Speed-distance-time problem setup",
    ],
  },
  {
    id: 4,
    title: "Topic 4: Proof",
    focus: "Rigorous written explanations",
    goals: [
      "Write full prose-based reasoning",
      "Use variables and assumptions explicitly",
      "Show uniqueness and eliminate alternatives",
      "Simulate timed papers with post-sprint analysis",
    ],
  },
];

export const conceptSheets: ConceptFactSheet[] = [
  {
    concept: "Divisibility Rules",
    summary: "Fast divisibility checks create speed advantages in JMC-style multiple-choice rounds.",
    keyPoints: [
      "A number is divisible by 3 or 9 if its digit sum is divisible by 3 or 9.",
      "Divisibility by 11 uses alternating digit sums.",
      "Combining tests (like 2 and 3) helps for 6, while 2 and 9 helps for 18.",
    ],
    forInvestigation: [
      "Why does alternating-sum logic detect divisibility by 11?",
      "Create a 4-digit number divisible by 9 and 11, then justify every condition.",
    ],
    suggestedVideoQuery: "UKMT Junior Math divisibility rules",
    topic: 1,
  },
  {
    concept: "Prime Factorization",
    summary: "Expressing numbers in prime powers is a universal tactic for HCF, LCM, and factor counts.",
    keyPoints: [
      "Write every integer as a product of prime powers.",
      "Number of factors of $p^a q^b$ is $(a+1)(b+1)$.",
      "LCM uses max exponents; HCF uses min exponents.",
    ],
    forInvestigation: [
      "How many factors of 360 are perfect squares?",
      "Compare two methods for finding the HCF of 540 and 756.",
    ],
    suggestedVideoQuery: "UKMT Junior Math prime factorization",
    topic: 1,
  },
  {
    concept: "Angles in Polygons",
    summary: "Most geometry marks come from chaining simple angle facts cleanly.",
    keyPoints: [
      "Sum of interior angles in an n-gon is $(n-2)\\times180$.",
      "Regular polygon interior angle is $((n-2)\\times180)/n$.",
      "Exterior angles of any convex polygon sum to 360 degrees.",
    ],
    forInvestigation: [
      "Find all regular polygons whose interior angle is an integer multiple of 12 degrees.",
      "Can two different regular polygons share an exterior angle? Prove it.",
    ],
    suggestedVideoQuery: "UKMT Junior Math polygon angles",
    topic: 2,
  },
  {
    concept: "Area and Perimeter",
    summary: "Composite regions reward decomposition and strategic subtraction.",
    keyPoints: [
      "Split complex regions into rectangles, triangles, and circles.",
      "Perimeter can include hidden edges after cuts or folds.",
      "Keep units consistent before comparing values.",
    ],
    forInvestigation: [
      "Two shapes have equal area but different perimeter. Build an example.",
      "Design a rectangle-triangle composite with perimeter 40 and maximal area.",
    ],
    suggestedVideoQuery: "UKMT Junior Math area perimeter composite shapes",
    topic: 2,
  },
  {
    concept: "Equations from Word Problems",
    summary: "Translate carefully first, then solve. Most errors happen before algebra begins.",
    keyPoints: [
      "Assign variables with meaning and units.",
      "Build one equation per independent relationship.",
      "Always substitute back to validate context.",
    ],
    forInvestigation: [
      "Write two different stories that lead to the same simultaneous equations.",
      "Show why one extra equation can over-constrain a model.",
    ],
    suggestedVideoQuery: "UKMT Junior Math algebra word problems",
    topic: 3,
  },
  {
    concept: "Sequences and Patterns",
    summary: "Pattern spotting plus justification is essential in both JMC and Kangaroo settings.",
    keyPoints: [
      "Look at first differences, then second differences.",
      "Check multiplicative and recursive relationships.",
      "Write a rule and test it against multiple terms.",
    ],
    forInvestigation: [
      "Construct two distinct sequence rules that share the first five terms.",
      "When does a recursive rule guarantee a unique sequence?",
    ],
    suggestedVideoQuery: "UKMT Junior Math sequences patterns",
    topic: 3,
  },
  {
    concept: "Proof Writing and Uniqueness",
    summary: "JMO-style work rewards complete arguments, not just final answers.",
    keyPoints: [
      "State assumptions and definitions first.",
      "Use parity, contradiction, or casework deliberately.",
      "End by proving no other solutions are possible.",
    ],
    forInvestigation: [
      "Rewrite a numerical solution into a full proof with justification in each step.",
      "Find a statement that is true for many examples but false in general, then explain why.",
    ],
    suggestedVideoQuery: "UKMT Junior Math Olympiad proof writing",
    topic: 4,
  },
  {
    concept: "Fractions, Decimals and Percentages",
    summary: "Converting fluently between fractions, decimals and percentages is essential when calculators are forbidden.",
    keyPoints: [
      "$1/8 = 0.125 = 12.5\\%$. Memorise key benchmarks: halves, quarters, fifths, eighths.",
      "To add fractions find the LCM of denominators; to multiply, multiply tops and bottoms then simplify.",
      "Percentage change = $(\\text{change}/\\text{original})\\times 100$.",
    ],
    forInvestigation: [
      "Which unit fractions $1/n$ have terminating decimals? Explain why.",
      "Show that $0.\\overline{142857} = 1/7$ using long division.",
    ],
    suggestedVideoQuery: "UKMT Junior Math fractions decimals percentages",
    topic: 1,
  },
  {
    concept: "Powers and Roots",
    summary: "Fluency with squares, cubes and their roots powers crossnumber solving and estimation.",
    keyPoints: [
      "Know perfect squares up to $15^2=225$ and cubes up to $10^3=1000$.",
      "$a^m \\times a^n = a^{m+n}$; $(a^m)^n = a^{mn}$; $a^0 = 1$.",
      "$\\sqrt{ab} = \\sqrt{a}\\sqrt{b}$ helps simplify surds like $\\sqrt{72}=6\\sqrt{2}$.",
    ],
    forInvestigation: [
      "Find all two-digit numbers that are both a perfect square and a perfect cube.",
      "Why is $\\sqrt{2}$ irrational? Outline a proof by contradiction.",
    ],
    suggestedVideoQuery: "UKMT Junior Math powers roots indices",
    topic: 1,
  },
  {
    concept: "Symmetry and Nets",
    summary: "Visualising reflections, rotations and 3-D folding is tested across JMC, Kangaroo and JMO.",
    keyPoints: [
      "Reflectional symmetry: a shape is unchanged when reflected in its line of symmetry.",
      "Rotational symmetry of order n means n rotations (each $360/n$ degrees) map the shape to itself.",
      "A cube has 11 distinct nets. Opposite faces never share an edge in any net.",
    ],
    forInvestigation: [
      "Which letters of the alphabet have both reflectional and rotational symmetry?",
      "Draw all 11 hexomino nets of a cube and verify opposite-face pairs.",
    ],
    suggestedVideoQuery: "UKMT Junior Math symmetry nets cubes",
    topic: 2,
  },
  {
    concept: "Circles and Semicircles",
    summary: "Circle problems reward leaving answers in terms of π and combining area/arc formulae.",
    keyPoints: [
      "Area $= \\pi r^2$; Circumference $= 2\\pi r$.",
      "Semicircle perimeter = $\\pi r + 2r$ (curved arc plus diameter).",
      "Shaded-region questions: subtract the smaller area from the larger.",
    ],
    forInvestigation: [
      "A circle is inscribed in a square of side 10. Find the shaded area between them.",
      "How does the ratio of areas change if you inscribe a square inside a circle instead?",
    ],
    suggestedVideoQuery: "UKMT Junior Math circles semicircles area",
    topic: 2,
  },
  {
    concept: "Logic Puzzles",
    summary: "Magic squares, truth-teller/liar problems and grid logic appear frequently in Kangaroo and JMO.",
    keyPoints: [
      "In a 3×3 magic square with entries 1-9, the magic constant is 15.",
      "Truth-teller/liar strategy: assume one speaker tells the truth and check for contradictions.",
      "Grid logic: use elimination tables, marking definite Yes/No in every cell.",
    ],
    forInvestigation: [
      "How many distinct 3×3 magic squares exist using 1-9? (Count rotations/reflections as one.)",
      "Design a truth-teller/liar puzzle with exactly two liars among four people.",
    ],
    suggestedVideoQuery: "UKMT Junior Math logic puzzles magic squares",
    topic: 3,
  },
  {
    concept: "Speed, Distance and Time",
    summary: "Rate problems require careful unit handling and often combine two journeys or average speeds.",
    keyPoints: [
      "$\\text{Distance} = \\text{Speed} \\times \\text{Time}$; rearrange for any unknown.",
      "Average speed for a round trip is NOT the average of the two speeds; use total distance / total time.",
      "Convert units consistently: km/h ↔ m/s by multiplying/dividing by 3.6.",
    ],
    forInvestigation: [
      "A car travels 60 km at 30 km/h and returns at 60 km/h. Show the average speed is 40 km/h, not 45.",
      "Two trains approach each other. Set up equations for when and where they meet.",
    ],
    suggestedVideoQuery: "UKMT Junior Math speed distance time problems",
    topic: 3,
  },
  {
    concept: "Mock Exams and Timed Practice",
    summary: "Simulating real exam conditions builds stamina, pacing and the discipline to leave hard questions.",
    keyPoints: [
      "JMC: 25 questions in 60 minutes (~2.4 min each). Marks: +5, +4, −1, 0 for A-E/blank.",
      "Junior Kangaroo: 25 questions in 60 minutes. No negative marking.",
      "JMO Section A: 10 short answers (60 min). Section B: 6 long proofs (120 min).",
    ],
    forInvestigation: [
      "Run a full 25-question mock under timed conditions and record which questions you skipped.",
      "Analyse your mock: which topics cost the most time? Redirect study accordingly.",
    ],
    suggestedVideoQuery: "UKMT JMC JMO exam technique timed practice",
    topic: 4,
  },
];
