import type { Metadata } from "next";
import "./globals.css";
import "./account/account.css";
import FeedbackWidget from "./_components/FeedbackWidget";
import { LanguageProvider } from "./_components/Language";
import { requestLanguage } from "./_data/request-language";
import { htmlLang, localeAlternates } from "./_data/languages";
import { guideText } from "./_data/guide-copy";

const baseMetadata: Metadata = {
  metadataBase: new URL("https://book2audiogo.com/"),
  title: "Free PDF & EPUB to Audiobook Converter | Book2Audio GO",
  description: "Turn PDF, EPUB, TXT and DOCX books into MP3 or WAV audiobooks on Windows. Core features are free. Preview chapters, choose a voice and export by chapter.",
  openGraph: { title: "Free PDF & EPUB to Audiobook Converter | Book2Audio GO", description: "Download the Windows book to audio app. Core features are free: preview chapters, choose a voice and export MP3 audiobooks.", url: "https://book2audiogo.com/", siteName: "Book2Audio GO", type: "website", locale: "en_US" },
  twitter: { card: "summary", title: "Free PDF & EPUB to Audiobook Converter | Book2Audio GO", description: "Turn your ebooks into chapter-based MP3 audiobooks with free core features on Windows." },
  alternates: { canonical: "https://book2audiogo.com/" },
};

export async function generateMetadata(): Promise<Metadata> {
  const lang = await requestLanguage();
  if (lang === "en") return { ...baseMetadata, alternates: localeAlternates("/", lang) };
  const title = guideText(lang, "A book to audio converter for your own ebooks") + " | Book2Audio GO";
  const description = guideText(lang, "Turn books you already have into audiobooks for your commute, walks or a break from the screen. Book2Audio GO is a downloadable Windows app: import your ebook, check its chapters, choose a voice and save MP3 audio to your computer. The core conversion features are free to use.");
  const alternates = localeAlternates("/", lang);
  return { ...baseMetadata, title, description, alternates,
    openGraph: { ...baseMetadata.openGraph, title, description, url: alternates.canonical, locale: htmlLang(lang).replace("-", "_") },
    twitter: { card: "summary", title, description } };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const lang = await requestLanguage();
  return <html lang={htmlLang(lang)}>
    <head><link rel="icon" href="/favicon.ico?v=3" type="image/vnd.microsoft.icon" sizes="16x16 32x32 48x48" /></head>
    <body><LanguageProvider initial={lang}>{children}<FeedbackWidget /></LanguageProvider></body>
  </html>;
}
