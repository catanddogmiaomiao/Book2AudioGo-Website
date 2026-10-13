import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://book2audiogo.com/"),
  title: "Book2Audio GO – Convert Ebooks to MP3 Audiobooks",
  description: "Convert EPUB, PDF, TXT and DOCX ebooks into MP3 or WAV audiobooks. Use chapter splitting to export audio by chapter with Book2Audio GO for Windows.",
  alternates: { canonical: "https://book2audiogo.com/" },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
