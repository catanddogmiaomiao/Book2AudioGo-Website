import type { Metadata } from "next";
import "./globals.css";
import FeedbackWidget from "./_components/FeedbackWidget";

export const metadata: Metadata = {
  metadataBase: new URL("https://book2audiogo.com/"),
  title: "Free PDF & EPUB to Audiobook Converter | Book2Audio GO",
  description: "Turn PDF, EPUB, TXT and DOCX books into MP3 or WAV audiobooks on Windows. Core features are free. Preview chapters, choose a voice and export by chapter.",
  openGraph: { title: "Free PDF & EPUB to Audiobook Converter | Book2Audio GO", description: "Download the Windows book to audio app. Core features are free: preview chapters, choose a voice and export MP3 audiobooks.", url: "https://book2audiogo.com/", siteName: "Book2Audio GO", type: "website", locale: "en_US" },
  twitter: { card: "summary", title: "Free PDF & EPUB to Audiobook Converter | Book2Audio GO", description: "Turn your ebooks into chapter-based MP3 audiobooks with free core features on Windows." },
  alternates: { canonical: "https://book2audiogo.com/" },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}<FeedbackWidget /></body></html>;
}
