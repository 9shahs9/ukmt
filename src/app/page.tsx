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
              {isFirebaseConfigured && (
                <button className="google-btn" onClick={handleGoogleLogin}>
                  <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Sign in with Google
                </button>
              )}
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
