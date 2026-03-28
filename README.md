# UKMT Mastery: The 20-Minute Sprint

A mobile-first Next.js web app for high-intensity UKMT preparation across:
- JMC (Junior Mathematical Challenge)
- Junior Kangaroo
- JMO (Junior Mathematical Olympiad)

## What Is Implemented

- Authentication and profile flow:
  - Email/password sign-in
  - Google SSO button
  - Firebase Auth + Firestore support when env vars are provided
  - Local demo fallback when Firebase is not configured
- Dashboard with a 4-week mastery tracker:
  - Week 1 Number Theory
  - Week 2 Geometry
  - Week 3 Algebra and Logic
  - Week 4 Proof
- Learn module (4-minute structure):
  - 2-minute fact sheet
  - For Investigation section
  - 2-minute video segment with either:
    - custom playlist URL input
    - automatic concept-specific UKMT YouTube search link
- Practice module:
  - 20-question sprint engine
  - 15 Level 1 JMC-style MCQs
  - 5 Level 2 Kangaroo/JMO-style questions
  - Explicit practice warning: calculators and measuring instruments are forbidden
- Feedback loop:
  - Per-question extended solution
  - Alternative method for each item
  - Optional proof-training text boxes for JMO-style items
- Math rendering:
  - KaTeX via react-katex
- Data layer:
  - JSON question bank by year and difficulty
  - JSON past-paper index generated from source paper filenames

## Source Files Used

- `concepts.txt` copied from source Concepts file
- `brokendown_concepts.txt` copied from source Brokendown Concepts file
- Past-paper filenames read from the source `past_papers` folder and indexed into:
  - `public/data/past-papers.json`

## Stack

- Next.js 16 (App Router)
- TypeScript
- ESLint (flat config)
- Firebase (optional for auth + persistence)
- KaTeX (math rendering)

## Run Locally

```bash
npm install
npm run generate:data
npm run dev
```

Open `http://localhost:3000`.

## Firebase Setup (Optional)

Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

If these are unset, the app runs in local demo mode with localStorage persistence.

## Validation

- `npm run lint` passes
- `npm run build` passes
