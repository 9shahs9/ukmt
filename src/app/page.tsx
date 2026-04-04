import Link from "next/link";

export default function Home() {
  return (
    <main className="page-shell hub-page">
      <header className="hero hub-hero">
        <div>
          <p className="kicker">Maths Mastery Hub</p>
          <h1>Train. Practice. Excel.</h1>
          <p className="subtitle">
            Choose your track below — UKMT competition prep or TMUA Cambridge admissions training.
          </p>
        </div>
      </header>

      <div className="hub-grid">
        <Link href="/ukmt" className="hub-card">
          <div className="hub-card-icon">📐</div>
          <h2>UKMT Mastery</h2>
          <p className="hub-card-sub">The 20-Minute Sprint</p>
          <p>
            JMC, Junior Kangaroo &amp; JMO practice with procedurally generated questions,
            concept fact sheets, timed sprints and extended solutions.
          </p>
          <ul>
            <li>16 topics across 4 areas</li>
            <li>Past paper browser (2015–2025)</li>
            <li>Progress tracking &amp; streak system</li>
          </ul>
          <span className="hub-card-cta">Start UKMT Training →</span>
        </Link>

        <Link href="/tmua" className="hub-card tmua">
          <div className="hub-card-icon">🎓</div>
          <h2>TMUA Trainer</h2>
          <p className="hub-card-sub">Crack the Cambridge Maths Test</p>
          <p>
            360+ past paper questions from Specimen to 2023 with worked solutions,
            topic filters, timed exam simulation and performance analytics.
          </p>
          <ul>
            <li>Paper 1 &amp; Paper 2 coverage</li>
            <li>13 topic categories</li>
            <li>Official past paper PDFs</li>
          </ul>
          <span className="hub-card-cta">Start TMUA Training →</span>
        </Link>
      </div>
    </main>
  );
}
