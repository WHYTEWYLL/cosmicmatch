import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "How Compatible Are You, Really?",
  description:
    "A 2-minute quiz that maps your relationship DNA across 7 dimensions. Take the test with your partner and discover your cosmic compatibility.",
  openGraph: {
    title: "How Compatible Are You, Really?",
    description: "Take the 2-minute couple compatibility quiz and discover your relationship DNA.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="stars" />
        <main className="relative z-10 min-h-screen">{children}</main>
      </body>
    </html>
  );
}
