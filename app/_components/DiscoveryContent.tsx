import { guideText } from "../_data/guide-copy";
import { localizedHref, type Lang } from "../_data/languages";

export default function DiscoveryContent({ lang }: { lang: Lang }) {
  const t = (key: Parameters<typeof guideText>[1]) => guideText(lang, key);
  const guides = [
    ["/pdf-to-audiobook", "PDF to audio and MP3", "Convert a text-based PDF to audiobook audio. Check the extracted reading order, choose the sections you need and export them for listening.", "How to convert a PDF to audio"],
    ["/epub-to-mp3", "EPUB to MP3 audiobooks", "Convert EPUB ebooks to chapter-based MP3 files. Preview the book's detected chapters and choose a voice before exporting.", "How to convert EPUB to MP3"],
  ] as const;
  const questions = [
    ["Is Book2Audio GO free?", "The main ebook-to-audio conversion features are free to use. Download the Windows app from this website and start with a short chapter to check the result."],
    ["Is this an online book to audio converter?", "Book2Audio GO runs as a Windows desktop app, rather than converting books in your browser. Book parsing takes place on your computer; text is sent to an online speech service to generate audio, so an internet connection is required."],
    ["Can I convert PDF and EPUB books to MP3?", "Yes. The app supports EPUB, PDF, TXT and DOCX input, with MP3 and WAV output options. Check the detected chapters and extracted text before exporting. Image-only PDFs need text recognition first."],
    ["Can I listen on my phone?", "After conversion, copy the exported MP3 files to your phone and open them in a compatible audio player. Generating the audiobook requires the Windows app; listening to saved MP3 files does not."],
  ] as const;
  return <section className="discovery wrap" aria-labelledby="conversion-guides">
    <p className="eyebrow">{t("YOUR BOOKS, READY TO LISTEN")}</p>
    <h2 id="conversion-guides">{t("A book to audio converter for your own ebooks")}</h2>
    <p>{t("Turn books you already have into audiobooks for your commute, walks or a break from the screen. Book2Audio GO is a downloadable Windows app: import your ebook, check its chapters, choose a voice and save MP3 audio to your computer. The core conversion features are free to use.")}</p>
    <div className="guideGrid">
      {guides.map(([path, title, body, link]) => <article key={path}>
        <h3><a href={localizedHref(path, lang)}>{t(title)}</a></h3><p>{t(body)}</p>
        <a className="guideLink" href={localizedHref(path, lang)}>{t(link)} →</a>
      </article>)}
    </div>
    <h2>{t("Before you download")}</h2>
    <div className="faqList">{questions.map(([question, answer]) =>
      <details key={question}><summary>{t(question)}</summary><p>{t(answer)}</p></details>)}</div>
  </section>;
}
