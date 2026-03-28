"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";

import type { UserProgress } from "@/lib/types";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId,
);

const app = isFirebaseConfigured ? (getApps().length ? getApp() : initializeApp(firebaseConfig)) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
const provider = new GoogleAuthProvider();

export async function signInWithEmail(email: string, password: string): Promise<User> {
  if (!auth) throw new Error("Firebase is not configured.");

  try {
    const signedIn = await signInWithEmailAndPassword(auth, email, password);
    return signedIn.user;
  } catch {
    const created = await createUserWithEmailAndPassword(auth, email, password);
    return created.user;
  }
}

export async function signInWithGoogle(): Promise<User> {
  if (!auth) throw new Error("Firebase is not configured.");
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function signOutUser(): Promise<void> {
  if (!auth) return;
  await signOut(auth);
}

export function subscribeToAuth(callback: (user: User | null) => void): () => void {
  if (!auth) {
    callback(null);
    return () => undefined;
  }

  return onAuthStateChanged(auth, callback);
}

export async function loadCloudProgress(userId: string): Promise<UserProgress | null> {
  if (!db) return null;
  const snap = await getDoc(doc(db, "progress", userId));
  if (!snap.exists()) return null;
  return snap.data() as UserProgress;
}

export async function saveCloudProgress(progress: UserProgress): Promise<void> {
  if (!db) return;
  await setDoc(doc(db, "progress", progress.userId), progress, { merge: true });
}
