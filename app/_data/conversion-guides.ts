import type { Metadata } from "next";
import { htmlLang, localeAlternates, localizedHref, type Lang } from "./languages";
import { translatedGuides } from "./translated-guides";

const site = "https://book2audiogo.com";

const guides = {
  pdf: {
    path: "/pdf-to-audiobook",
    title: "PDF to Audio Converter for Windows | Book2Audio GO",
    description: "Convert PDF books to MP3 audiobooks with Book2Audio GO for Windows. Core features are free. Preview extracted text, choose a voice and export by chapter.",
    h1: "Convert PDF to Audio and MP3 Audiobooks",
    intro: "Give your PDF books, notes and documents a voice. Book2Audio GO is a downloadable Windows PDF to audio converter with free core features. Check the extracted text, select a voice and save audiobook files to listen to later.",
    useTitle: "Make a PDF you already own easier to listen to",
    useText: "A saved MP3 lets you listen to a document away from your computer, without keeping a PDF reader open. Use Book2Audio GO for text-based books, long notes or reading material you want to hear on a walk. Preview the text first: document layout can affect how paragraphs and headings are extracted.",
    steps: [
      ["Download and open the Windows app", "Download Book2Audio GO, extract the archive and open the application from the extracted folder. Keep an internet connection available for speech synthesis."],
      ["Import your PDF and analyze its chapters", "Choose your PDF file and select Analyze chapters. Open the detected sections in the text preview. Check that paragraphs follow the correct reading order and remove unwanted sections from your export selection."],
      ["Choose a voice and test a short section", "Select a voice that matches the document language, adjust the speaking speed and use the voice preview. Export a short section first to check the actual document narration."],
      ["Export PDF audio as MP3", "Choose MP3 and a save folder, then export your selected chapters. Open the generated files in an audio player before converting the rest of the document. Copy the files to your phone when they are ready."],
    ],
    checkTitle: "Which PDFs work best?",
    checks: ["Start with a PDF whose text can be selected or copied. A scanned or image-only PDF needs OCR text recognition before conversion; this app does not promise built-in OCR.", "Check multi-column pages, tables, footnotes and headers in the text preview. Their extracted order may differ from the visual page layout.", "Chapter detection depends on the source document. Verify the detected sections instead of assuming every PDF has a usable table of contents."],
    faqs: [
      ["Can I convert PDF to audio for free?", "The main conversion features in Book2Audio GO are free to use. Download the Windows app, select a PDF and test a short section before exporting more audio."],
      ["Is this a PDF to audio online tool?", "This is a Windows download, not a browser upload converter. Document parsing happens on your computer, while the extracted text is sent to an online speech service for audio generation."],
      ["Does it read the full text or make a summary?", "Book2Audio GO converts the extracted text of your selected sections into speech. This workflow is for listening to the text, rather than generating a podcast or an AI summary."],
      ["Can I save the audiobook to my phone?", "Yes. Export MP3 files on Windows, then copy them to your phone. Use an audio player that supports local MP3 playback."],
    ],
    relatedPath: "/epub-to-mp3", relatedTitle: "Working with an ebook instead? Convert EPUB to MP3",
  },
  epub: {
    path: "/epub-to-mp3",
    title: "EPUB to MP3 Audiobook Converter | Book2Audio GO",
    description: "Convert EPUB to MP3 audiobooks on Windows with free core features. Preview detected chapters, choose a voice and export chapter-based MP3 with Book2Audio GO.",
    h1: "Convert EPUB to MP3 Audiobooks by Chapter",
    intro: "Turn your EPUB ebooks into audio files you can take with you. Book2Audio GO is a downloadable Windows EPUB to MP3 converter with free core features, chapter previews and selectable multilingual voices.",
    useTitle: "Keep your ebook organized as chapter-based MP3",
    useText: "An EPUB usually contains reading order and chapter information that can help organize an audiobook. Book2Audio GO detects the book's structure so you can preview and select chapters before converting them. Separate chapter files make it easier to choose what to listen to, without searching through one long recording.",
    steps: [
      ["Download Book2Audio GO for Windows", "Download the app, extract the archive and open it from the extracted folder. The main conversion features are free; no browser upload is needed to import your ebook."],
      ["Open your EPUB and check its chapters", "Choose the EPUB file and select Analyze chapters. Review the detected table of contents, chapter order and text previews. Select only the chapters you want to hear."],
      ["Pick the narration voice and speed", "Choose a voice matching the ebook's language, adjust the speaking speed and try the voice preview. Convert one short chapter to check how the narration sounds with your book."],
      ["Export your chapters as MP3", "Choose MP3 output and a save folder, then export the selected chapters. Listen to a generated file to check the result, then copy the chapter files to your phone or other compatible player."],
    ],
    checkTitle: "Check your EPUB before converting the whole book",
    checks: ["Use an EPUB that the app can open and extract as text. It does not remove ebook DRM or unlock encrypted books.", "Check chapter order and the text preview. Some EPUB tables of contents contain nested headings or entries without their own body text.", "Convert a short chapter before a long batch. Speech synthesis needs an internet connection; book parsing is local, but the text is sent to an online speech service to generate narration."],
    faqs: [
      ["Can I convert EPUB to MP3 for free?", "The core ebook-to-audio conversion features are free to use in Book2Audio GO. Download the Windows app and start by exporting a short chapter."],
      ["Does it create one MP3 per chapter?", "You can select detected chapters and export chapter-based MP3 files. Check the table of contents and the extracted chapter text before exporting."],
      ["Can I convert EPUB to audiobook online?", "Book2Audio GO is a Windows desktop app. You import the EPUB on your computer, rather than uploading the book through this website. Online speech synthesis still requires an internet connection."],
      ["Which ebook languages can I listen to?", "The app includes Chinese, English, Japanese and Korean voice options. Choose a voice matching the source text; selecting a different voice does not translate the book."],
    ],
    relatedPath: "/pdf-to-audiobook", relatedTitle: "Have a PDF document? Convert PDF to audio",
  },
};

export type GuideKind = keyof typeof guides;

export function getGuide(kind: GuideKind, lang: Lang) {
  return lang === "en" ? guides[kind] : { ...guides[kind], ...translatedGuides[lang][kind], description: translatedGuides[lang][kind].intro };
}

export function guideMetadata(kind: GuideKind, lang: Lang): Metadata {
  const guide = getGuide(kind, lang);
  return {
    title: lang === "en" ? guide.title : guide.title + " | Book2Audio GO", description: guide.description,
    alternates: localeAlternates(guide.path, lang),
    openGraph: { title: guide.title, description: guide.description, url: site + localizedHref(guide.path, lang), siteName: "Book2Audio GO", type: "website", locale: htmlLang(lang).replace("-", "_") },
    twitter: { card: "summary", title: guide.title, description: guide.description },
  };
}
