import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  // latin-ext covers Vietnamese diacritics so Geist can render the prompts
  // without falling back to a system font.
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "VietEnglish — Flashcards",
  description: "English pronunciation flashcards for Vietnamese speakers.",
  // Belt-and-suspenders against browser auto-translation. The whole pedagogical
  // value depends on the English target words staying in English; if Safari /
  // Chrome / Google Translate rewrite the page, the app is broken. Three
  // signals: lang="vi" (declares the page Vietnamese so translators leave it
  // alone), translate="no" on <html>, and the Google notranslate meta.
  other: {
    google: "notranslate",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      translate="no"
      className={`${geistSans.variable} ${geistMono.variable} notranslate h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
