"use client";

import { useState } from "react";
import Link from "next/link";
import { signInWithEmail } from "@/lib/firebase";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!email || !password || !name) {
      setMessage("All fields are required.");
      return;
    }
    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      const user = await signInWithEmail(email, password);
      // Update display name if the Firebase user was just created
      if (user.displayName !== name) {
        const { updateProfile } = await import("firebase/auth");
        await updateProfile(user, { displayName: name });
      }
      setSuccess(true);
      setMessage(`Account ready for ${email}. You can now go to the home page.`);
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Signup failed.");
    }
  }

  return (
    <main className="page-shell">
      <section className="auth-card" style={{ maxWidth: 460, margin: "3rem auto" }}>
        <h1 style={{ fontSize: "1.6rem" }}>Create your account</h1>
        <p className="muted">Join UKMT Mastery to track your sprint progress.</p>

        {success ? (
          <>
            <p className="success-msg">{message}</p>
            <Link href="/" className="btn-primary" style={{ display: "inline-block", marginTop: "0.8rem", textDecoration: "none" }}>
              Go to Login
            </Link>
          </>
        ) : (
          <form onSubmit={handleSignup} className="signup-form">
            <label>
              Name
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </label>
            <label>
              Email
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </label>
            <label>
              Password
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 4 characters" />
            </label>
            <label>
              Confirm Password
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Re-enter password" />
            </label>
            {message && <p className="error-msg">{message}</p>}
            <button type="submit">Sign Up</button>
            <p className="muted" style={{ marginTop: "0.6rem" }}>
              Already have an account?{" "}
              <Link href="/" style={{ fontWeight: 600 }}>
                Login
              </Link>
            </p>
          </form>
        )}
      </section>
    </main>
  );
}
