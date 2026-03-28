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
  title: "UKMT Mastery: The 20-Minute Sprint",
  description: "JMC, Junior Kangaroo, and JMO mastery trainer with sprint practice and extended solutions.",
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
