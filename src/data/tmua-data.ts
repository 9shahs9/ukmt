export const TMUA_TOPICS = [
  {
    id: "algebra", label: "Algebra", description: "Equations, polynomials, simultaneous equations, completing the square",
    keyPoints: [
      "Completing the square: $x^2 + bx + c = (x + b/2)^2 - (b/2)^2 + c$",
      "Discriminant $\\Delta = b^2 - 4ac$ determines nature of roots",
      "Factor theorem: if $f(a) = 0$ then $(x - a)$ is a factor of $f(x)$",
      "For simultaneous equations, substitution is often cleaner than elimination",
    ],
    forInvestigation: [
      "When does a quadratic have rational roots?",
      "How can you spot a hidden quadratic (e.g. in trigonometric or exponential form)?",
    ],
  },
  {
    id: "calculus", label: "Calculus", description: "Differentiation, integration, areas, rates of change",
    keyPoints: [
      "Chain rule: $\\frac{d}{dx}[f(g(x))] = f'(g(x)) \\cdot g'(x)$",
      "Product rule: $(uv)' = u'v + uv'$",
      "Stationary points: solve $f'(x) = 0$, classify with $f''(x)$",
      "Integration by substitution reverses the chain rule",
      "Area between curves: $\\int_a^b |f(x) - g(x)|\\,dx$",
    ],
    forInvestigation: [
      "When should you use integration by parts vs substitution?",
      "How do you handle improper integrals on TMUA?",
    ],
  },
  {
    id: "combinatorics", label: "Combinatorics", description: "Counting principles, permutations, combinations",
    keyPoints: [
      "$\\binom{n}{r} = \\frac{n!}{r!(n-r)!}$",
      "Multiplication principle: if task A has $m$ ways and task B has $n$ ways, there are $mn$ ways total",
      "Complement counting: count what you don't want and subtract",
      "Careful about overcounting — divide by symmetries",
    ],
    forInvestigation: [
      "When should you use permutations vs combinations?",
      "How does the pigeonhole principle help in TMUA problems?",
    ],
  },
  {
    id: "functions", label: "Functions", description: "Domain, range, composition, inverses, transformations",
    keyPoints: [
      "A function is invertible iff it is one-to-one (injective)",
      "$(f \\circ g)(x) = f(g(x))$ — apply $g$ first, then $f$",
      "Vertical stretch by $a$: $y = af(x)$; horizontal stretch by $1/a$: $y = f(ax)$",
      "Domain of composite: domain of inner function restricted so output is in domain of outer",
    ],
    forInvestigation: [
      "How do you find the range of a composite function?",
      "What transformations does $y = |f(x)|$ vs $y = f(|x|)$ represent?",
    ],
  },
  {
    id: "geometry", label: "Geometry", description: "Coordinate geometry, circles, lines, areas, vectors",
    keyPoints: [
      "Distance formula: $d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$",
      "Circle: $(x - a)^2 + (y - b)^2 = r^2$, centre $(a,b)$, radius $r$",
      "Perpendicular gradients multiply to $-1$",
      "Midpoint: $\\left(\\frac{x_1+x_2}{2}, \\frac{y_1+y_2}{2}\\right)$",
    ],
    forInvestigation: [
      "How do you find the equation of a tangent to a circle at a given point?",
      "When is using vectors more efficient than coordinate methods?",
    ],
  },
  {
    id: "inequalities", label: "Inequalities", description: "Solving and manipulating algebraic inequalities",
    keyPoints: [
      "Multiplying/dividing by a negative reverses the inequality sign",
      "For $(x - a)(x - b) > 0$: sketch or use a sign table",
      "Modulus inequalities: $|f(x)| < a \\Leftrightarrow -a < f(x) < a$",
      "Never assume a variable is positive unless stated",
    ],
    forInvestigation: [
      "How do you handle inequalities with unknown denominators?",
      "When can you square both sides of an inequality safely?",
    ],
  },
  {
    id: "logic", label: "Logic & Reasoning", description: "Logical deduction, proof analysis, argument evaluation",
    keyPoints: [
      "Converse of $P \\Rightarrow Q$ is $Q \\Rightarrow P$ — not logically equivalent",
      "Contrapositive of $P \\Rightarrow Q$ is $\\neg Q \\Rightarrow \\neg P$ — logically equivalent",
      "A counterexample disproves a universal statement",
      "Necessary vs sufficient: $P$ sufficient for $Q$ means $P \\Rightarrow Q$",
    ],
    forInvestigation: [
      "What makes an argument valid vs sound?",
      "How do you identify the flaw in a given mathematical proof?",
    ],
  },
  {
    id: "number-theory", label: "Number Theory", description: "Primes, divisibility, modular arithmetic",
    keyPoints: [
      "Fundamental theorem: every integer > 1 has a unique prime factorisation",
      "If $a | b$ and $a | c$ then $a | (bx + cy)$ for any integers $x, y$",
      "Modular arithmetic: $a \\equiv b \\pmod{n}$ means $n | (a - b)$",
      "Last digit problems: look at powers modulo 10",
    ],
    forInvestigation: [
      "How do you prove a number is irrational?",
      "When is Fermat's little theorem useful for TMUA?",
    ],
  },
  {
    id: "probability", label: "Probability", description: "Conditional probability, distributions, expected values",
    keyPoints: [
      "Conditional probability: $P(A|B) = \\frac{P(A \\cap B)}{P(B)}$",
      "Independent events: $P(A \\cap B) = P(A) \\cdot P(B)$",
      "Expected value: $E(X) = \\sum x_i P(X = x_i)$",
      "Tree diagrams systematise conditional probability",
    ],
    forInvestigation: [
      "How do you spot when events are NOT independent?",
      "When should you use complementary probability?",
    ],
  },
  {
    id: "proof", label: "Proof", description: "Proof by contradiction, induction, counterexamples",
    keyPoints: [
      "Direct proof: assume premises, derive conclusion step-by-step",
      "Contradiction: assume the negation, derive an impossibility",
      "Induction: base case + inductive step (assume for $k$, prove for $k+1$)",
      "One counterexample is enough to disprove a conjecture",
    ],
    forInvestigation: [
      "How do you choose between proof by contradiction and direct proof?",
      "What are common errors in induction proofs?",
    ],
  },
  {
    id: "sequences", label: "Sequences & Series", description: "Arithmetic, geometric, convergence, sums",
    keyPoints: [
      "Arithmetic: $u_n = a + (n-1)d$, sum $S_n = \\frac{n}{2}(2a + (n-1)d)$",
      "Geometric: $u_n = ar^{n-1}$, sum $S_n = \\frac{a(1 - r^n)}{1 - r}$",
      "Infinite geometric sum: $S_\\infty = \\frac{a}{1-r}$ when $|r| < 1$",
      "Recurrence relations: write out first few terms to spot patterns",
    ],
    forInvestigation: [
      "How do you prove a sequence converges?",
      "When does a sum to infinity exist for non-geometric series?",
    ],
  },
  {
    id: "statistics", label: "Statistics", description: "Mean, variance, data interpretation",
    keyPoints: [
      "Mean: $\\bar{x} = \\frac{\\sum x_i}{n}$",
      "Variance: $\\sigma^2 = \\frac{\\sum(x_i - \\bar{x})^2}{n}$",
      "Coding: if $y = ax + b$ then $\\bar{y} = a\\bar{x} + b$ and $\\sigma_y = |a|\\sigma_x$",
      "Read data questions carefully — check units and scales",
    ],
    forInvestigation: [
      "How does removing an outlier affect mean vs median?",
      "When is standard deviation more useful than interquartile range?",
    ],
  },
  {
    id: "trigonometry", label: "Trigonometry", description: "Identities, equations, graphs, radians",
    keyPoints: [
      "$\\sin^2\\theta + \\cos^2\\theta = 1$",
      "Double angle: $\\sin 2\\theta = 2\\sin\\theta\\cos\\theta$, $\\cos 2\\theta = \\cos^2\\theta - \\sin^2\\theta$",
      "For $a\\sin\\theta + b\\cos\\theta$, use $R\\sin(\\theta + \\alpha)$ form",
      "Always check the given domain for number of solutions",
    ],
    forInvestigation: [
      "How do you convert between degree and radian fluently?",
      "What substitutions help with $\\sin^2\\theta$ or $\\cos^2\\theta$ equations?",
    ],
  },
] as const;

export const TMUA_YEARS = ["Specimen", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023"] as const;

export const TMUA_PAPERS = [
  { number: 1, title: "Paper 1: Mathematical Thinking", duration: 75, questions: 20, description: "Tests mathematical knowledge and problem-solving" },
  { number: 2, title: "Paper 2: Mathematical Reasoning", duration: 75, questions: 20, description: "Tests logical reasoning and proof analysis" },
] as const;

export const TMUA_PAST_PAPER_PDFS: { year: string; paper: number; kind: string; url: string }[] = [
  { year: "Specimen", paper: 1, kind: "questions", url: "https://uat-wp.s3.eu-west-2.amazonaws.com/wp-content/uploads/2024/05/07141417/TMUA-early-specimen-paper-1.pdf" },
  { year: "Specimen", paper: 1, kind: "answers", url: "https://uat-wp.s3.eu-west-2.amazonaws.com/wp-content/uploads/2024/05/07141418/TMUA-early-specimen-paper-1-worked-answers.pdf" },
  { year: "Specimen", paper: 2, kind: "questions", url: "https://uat-wp.s3.eu-west-2.amazonaws.com/wp-content/uploads/2024/05/07141413/TMUA-early-specimen-paper-2.pdf" },
  { year: "Specimen", paper: 2, kind: "answers", url: "https://uat-wp.s3.eu-west-2.amazonaws.com/wp-content/uploads/2024/05/07141415/TMUA-early-specimen-paper-2-worked-answers.pdf" },
  { year: "Specimen", paper: 0, kind: "answer-keys", url: "https://uat-wp.s3.eu-west-2.amazonaws.com/wp-content/uploads/2024/05/07141414/TMUA-early-specimen-paper-answer-keys.pdf" },
  { year: "2016", paper: 1, kind: "questions", url: "https://uat-wp.s3.eu-west-2.amazonaws.com/wp-content/uploads/2024/05/07125112/TMUA-2016-paper-1.pdf" },
  { year: "2016", paper: 1, kind: "answers", url: "https://uat-wp.s3.eu-west-2.amazonaws.com/wp-content/uploads/2024/05/07125113/TMUA-2016-paper-1-worked-answers.pdf" },
  { year: "2016", paper: 2, kind: "questions", url: "https://uat-wp.s3.eu-west-2.amazonaws.com/wp-content/uploads/2024/05/07125102/TMUA-2016-paper-2.pdf" },
  { year: "2016", paper: 2, kind: "answers", url: "https://uat-wp.s3.eu-west-2.amazonaws.com/wp-content/uploads/2024/05/07125106/TMUA-2016-paper-2-worked-answers.pdf" },
  { year: "2016", paper: 0, kind: "answer-keys", url: "https://uat-wp.s3.eu-west-2.amazonaws.com/wp-content/uploads/2024/05/07125113/TMUA-2016-answer-keys.pdf" },
  { year: "2017", paper: 1, kind: "questions", url: "https://uat-wp.s3.eu-west-2.amazonaws.com/wp-content/uploads/2024/05/07125230/TMUA-2017-paper-1.pdf" },
  { year: "2017", paper: 1, kind: "answers", url: "https://uat-wp.s3.eu-west-2.amazonaws.com/wp-content/uploads/2024/05/07125231/TMUA-2017-paper-1-worked-answers.pdf" },
  { year: "2017", paper: 2, kind: "questions", url: "https://uat-wp.s3.eu-west-2.amazonaws.com/wp-content/uploads/2024/05/07125224/TMUA-2017-paper-2.pdf" },
  { year: "2017", paper: 2, kind: "answers", url: "https://uat-wp.s3.eu-west-2.amazonaws.com/wp-content/uploads/2024/05/07125228/TMUA-2017-paper-2-worked-answers.pdf" },
  { year: "2017", paper: 0, kind: "answer-keys", url: "https://uat-wp.s3.eu-west-2.amazonaws.com/wp-content/uploads/2024/05/07125232/TMUA-2017-answer-keys.pdf" },
  { year: "2018", paper: 1, kind: "questions", url: "https://uat-wp.s3.eu-west-2.amazonaws.com/wp-content/uploads/2024/05/07125407/TMUA-2018-paper-1.pdf" },
  { year: "2018", paper: 1, kind: "answers", url: "https://uat-wp.s3.eu-west-2.amazonaws.com/wp-content/uploads/2024/05/07125413/TMUA-2018-paper-1-worked-answers.pdf" },
  { year: "2018", paper: 2, kind: "questions", url: "https://uat-wp.s3.eu-west-2.amazonaws.com/wp-content/uploads/2024/05/07125404/TMUA-2018-paper-2.pdf" },
  { year: "2018", paper: 2, kind: "answers", url: "https://uat-wp.s3.eu-west-2.amazonaws.com/wp-content/uploads/2024/05/07125406/TMUA-2018-paper-2-worked-answers.pdf" },
  { year: "2018", paper: 0, kind: "answer-keys", url: "https://uat-wp.s3.eu-west-2.amazonaws.com/wp-content/uploads/2024/05/07125413/TMUA-2018-answer-keys.pdf" },
  { year: "2019", paper: 1, kind: "questions", url: "https://uat-wp.s3.eu-west-2.amazonaws.com/wp-content/uploads/2024/05/07140825/TMUA-2019-paper-1.pdf" },
  { year: "2019", paper: 1, kind: "answers", url: "https://uat-wp.s3.eu-west-2.amazonaws.com/wp-content/uploads/2024/05/07140826/TMUA-2019-paper-1-worked-answers.pdf" },
  { year: "2019", paper: 2, kind: "questions", url: "https://uat-wp.s3.eu-west-2.amazonaws.com/wp-content/uploads/2024/05/07140823/TMUA-2019-paper-2.pdf" },
  { year: "2019", paper: 2, kind: "answers", url: "https://uat-wp.s3.eu-west-2.amazonaws.com/wp-content/uploads/2024/05/07140824/TMUA-2019-paper-2-worked-answers.pdf" },
  { year: "2019", paper: 0, kind: "answer-keys", url: "https://uat-wp.s3.eu-west-2.amazonaws.com/wp-content/uploads/2024/05/07140827/TMUA-2019-answer-keys.pdf" },
  { year: "2020", paper: 1, kind: "questions", url: "https://uat-wp.s3.eu-west-2.amazonaws.com/wp-content/uploads/2024/05/07140953/TMUA-2020-paper-1.pdf" },
  { year: "2020", paper: 1, kind: "answers", url: "https://uat-wp.s3.eu-west-2.amazonaws.com/wp-content/uploads/2024/05/07140955/TMUA-2020-paper-1-worked-answers.pdf" },
  { year: "2020", paper: 2, kind: "questions", url: "https://uat-wp.s3.eu-west-2.amazonaws.com/wp-content/uploads/2024/05/07140951/TMUA-2020-paper-2.pdf" },
  { year: "2020", paper: 2, kind: "answers", url: "https://uat-wp.s3.eu-west-2.amazonaws.com/wp-content/uploads/2024/05/07140952/TMUA-2020-paper-2-worked-answers.pdf" },
  { year: "2020", paper: 0, kind: "answer-keys", url: "https://uat-wp.s3.eu-west-2.amazonaws.com/wp-content/uploads/2024/05/07140956/TMUA-2020-answer-keys.pdf" },
  { year: "2021", paper: 1, kind: "questions", url: "https://uat-wp.s3.eu-west-2.amazonaws.com/wp-content/uploads/2024/05/07141119/TMUA-2021-paper-1.pdf" },
  { year: "2021", paper: 1, kind: "answers", url: "https://uat-wp.s3.eu-west-2.amazonaws.com/wp-content/uploads/2024/05/07141121/TMUA-2021-paper-1-worked-answers.pdf" },
  { year: "2021", paper: 2, kind: "questions", url: "https://uat-wp.s3.eu-west-2.amazonaws.com/wp-content/uploads/2024/05/07141117/TMUA-2021-paper-2.pdf" },
  { year: "2021", paper: 2, kind: "answers", url: "https://uat-wp.s3.eu-west-2.amazonaws.com/wp-content/uploads/2024/05/07141118/TMUA-2021-paper-2-worked-answers.pdf" },
  { year: "2021", paper: 0, kind: "answer-keys", url: "https://uat-wp.s3.eu-west-2.amazonaws.com/wp-content/uploads/2024/05/07141122/TMUA-2021-answer-keys.pdf" },
  { year: "2022", paper: 1, kind: "questions", url: "https://uat-wp.s3.eu-west-2.amazonaws.com/wp-content/uploads/2024/05/07141241/TMUA-2022-paper-1.pdf" },
  { year: "2022", paper: 1, kind: "answers", url: "https://uat-wp.s3.eu-west-2.amazonaws.com/wp-content/uploads/2024/06/04105226/TMUA-2022-paper-1-worked-answers.pdf" },
  { year: "2022", paper: 2, kind: "questions", url: "https://uat-wp.s3.eu-west-2.amazonaws.com/wp-content/uploads/2024/05/07141239/TMUA-2022-paper-2.pdf" },
  { year: "2022", paper: 2, kind: "answers", url: "https://uat-wp.s3.eu-west-2.amazonaws.com/wp-content/uploads/2024/06/04105227/TMUA-2022-paper-2-worked-answers.pdf" },
  { year: "2022", paper: 0, kind: "answer-keys", url: "https://uat-wp.s3.eu-west-2.amazonaws.com/wp-content/uploads/2024/05/07141242/TMUA-2022-answer-keys.pdf" },
  { year: "2023", paper: 1, kind: "questions", url: "https://uat-wp.s3.eu-west-2.amazonaws.com/wp-content/uploads/2024/04/30144109/TMUA-2023-paper-1.pdf" },
  { year: "2023", paper: 1, kind: "answers", url: "https://uat-wp.s3.eu-west-2.amazonaws.com/wp-content/uploads/2024/06/04105227/TMUA-2023-paper-1-worked-answers.pdf" },
  { year: "2023", paper: 2, kind: "questions", url: "https://uat-wp.s3.eu-west-2.amazonaws.com/wp-content/uploads/2024/04/30144111/TMUA-2023-paper-2.pdf" },
  { year: "2023", paper: 2, kind: "answers", url: "https://uat-wp.s3.eu-west-2.amazonaws.com/wp-content/uploads/2024/06/04105226/TMUA-2023-paper-2-worked-answers.pdf" },
  { year: "2023", paper: 0, kind: "answer-keys", url: "https://uat-wp.s3.eu-west-2.amazonaws.com/wp-content/uploads/2024/04/30144123/TMUA-2023-answer-keys.pdf" },
];
