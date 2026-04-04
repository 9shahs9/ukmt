"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  isFirebaseConfigured,
  signInWithEmail,
  signInWithGoogle,
  signOutUser,
  subscribeToAuth,
} from "@/lib/firebase";

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("Student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMessage, setAuthMessage] = useState("");

  useEffect(() => {
    if (isFirebaseConfigured) {
      const unsub = subscribeToAuth((user) => {
        if (user) {
          setUserId(user.uid);
          setDisplayName(user.displayName ?? user.email?.split("@")[0] ?? "Student");
        } else {
          setUserId(null);
          setDisplayName("Student");
        }
      });
      return () => unsub();
    }
    const stored = window.localStorage.getItem("ukmt-user");
    if (stored) {
      try {
        const u = JSON.parse(stored) as { id: string; name: string };
        setUserId(u.id);
        setDisplayName(u.name);
      } catch { /* ignore */ }
    }
  }, []);

  async function handleLogin() {
    if (!email || !password) { setAuthMessage("Enter both email and password."); return; }
    if (isFirebaseConfigured) {
      try {
        const user = await signInWithEmail(email, password);
        setUserId(user.uid);
        setDisplayName(user.displayName ?? user.email?.split("@")[0] ?? "Student");
        setAuthMessage("");
      } catch (err: unknown) {
        setAuthMessage(err instanceof Error ? err.message : "Login failed.");
      }
    } else {
      const id = email.trim().toLowerCase();
      const name = id.split("@")[0];
      window.localStorage.setItem("ukmt-user", JSON.stringify({ id, name }));
      setUserId(id);
      setDisplayName(name);
      setAuthMessage("");
    }
  }

  async function handleGoogleLogin() {
    try {
      const user = await signInWithGoogle();
      setUserId(user.uid);
      setDisplayName(user.displayName ?? user.email?.split("@")[0] ?? "Student");
      setAuthMessage("");
    } catch (err: unknown) {
      setAuthMessage(err instanceof Error ? err.message : "Google sign-in failed.");
    }
  }

  async function handleSignOut() {
    if (isFirebaseConfigured) await signOutUser();
    window.localStorage.removeItem("ukmt-user");
    setUserId(null);
    setDisplayName("Student");
  }

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

      {/* ─── Auth ─── */}
      <section className="auth-card">
        {!userId ? (
          <>
            <h2>Login</h2>
            <div className="auth-grid">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" autoComplete="email" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" autoComplete="current-password" />
              <button onClick={handleLogin}>Login / Sign Up</button>
              {isFirebaseConfigured && <button className="secondary" onClick={handleGoogleLogin}>Sign in with Google</button>}
            </div>
            {authMessage && <p className="error-msg">{authMessage}</p>}
            <p className="muted" style={{ marginTop: ".5rem" }}>
              New here? <Link href="/signup" style={{ fontWeight: 600 }}>Create an account</Link>
            </p>
          </>
        ) : (
          <div className="signed-in">
            <p>Signed in as <strong>{displayName}</strong></p>
            <button className="secondary" onClick={handleSignOut}>Sign out</button>
          </div>
        )}
      </section>

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
