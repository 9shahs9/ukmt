import type { Metadata } from "next";
import { Spectral, Space_Grotesk } from "next/font/google";

import "./globals.css";

const spectral = Spectral({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-spectral",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-space",
});

export const metadata: Metadata = {
  title: "Maths Mastery Hub — UKMT & TMUA Training",
  description: "UKMT competition prep and TMUA Cambridge admissions test trainer with past papers, timed exams, and worked solutions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${spectral.variable} ${spaceGrotesk.variable}`}>{children}</body>
    </html>
  );
}
