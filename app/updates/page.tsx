import type { Metadata } from "next";
import UpdatesContent from "../_components/UpdatesContent";
import { requestLanguage } from "../_data/request-language";
import { releaseCopy } from "../_data/releases";
import { localeAlternates } from "../_data/languages";

const metadata: Metadata = {
  title: "Release Notes & Windows Updates | Book2Audio GO",
  description: "Book2Audio GO Windows updates, reading plans, speech compatibility fixes and upgrade instructions for older versions that cannot start or convert audio.",
  alternates: { canonical: "https://book2audiogo.com/updates" },
  openGraph: { title: "Book2Audio GO release notes", description: "Latest Windows updates and upgrade instructions.", url: "https://book2audiogo.com/updates", type: "website" },
};

export async function generateMetadata(): Promise<Metadata> {
  const lang = await requestLanguage();
  const alternates = localeAlternates("/updates", lang);
  if (lang === "en") return { ...metadata, alternates };
  const copy = releaseCopy[lang];
  const title = copy.title + " | Book2Audio GO";
  return { ...metadata, title, description: copy.intro, alternates,
    openGraph: { title, description: copy.intro, url: alternates.canonical, type: "website" } };
}

export default function UpdatesPage() { return <UpdatesContent />; }
