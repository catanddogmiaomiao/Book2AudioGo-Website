export default function DiscoveryContent() {
  return <section className="discovery wrap" aria-labelledby="conversion-guides">
    <p className="eyebrow">YOUR BOOKS, READY TO LISTEN</p>
    <h2 id="conversion-guides">A book to audio converter for your own ebooks</h2>
    <p>Turn books you already have into audiobooks for your commute, walks or a break from the screen. Book2Audio GO is a downloadable Windows app: import your ebook, check its chapters, choose a voice and save MP3 audio to your computer. The core conversion features are free to use.</p>
    <div className="guideGrid">
      <article><h3><a href="/pdf-to-audiobook">PDF to audio and MP3</a></h3><p>Convert a text-based PDF to audiobook audio. Check the extracted reading order, choose the sections you need and export them for listening.</p><a className="guideLink" href="/pdf-to-audiobook">How to convert a PDF to audio →</a></article>
      <article><h3><a href="/epub-to-mp3">EPUB to MP3 audiobooks</a></h3><p>Convert EPUB ebooks to chapter-based MP3 files. Preview the book's detected chapters and choose a voice before exporting.</p><a className="guideLink" href="/epub-to-mp3">How to convert EPUB to MP3 →</a></article>
    </div>
    <h2>Before you download</h2>
    <div className="faqList">
      <details><summary>Is Book2Audio GO free?</summary><p>The main ebook-to-audio conversion features are free to use. Download the Windows app from this website and start with a short chapter to check the result.</p></details>
      <details><summary>Is this an online book to audio converter?</summary><p>Book2Audio GO runs as a Windows desktop app, rather than converting books in your browser. Book parsing takes place on your computer; text is sent to an online speech service to generate audio, so an internet connection is required.</p></details>
      <details><summary>Can I convert PDF and EPUB books to MP3?</summary><p>Yes. The app supports EPUB, PDF, TXT and DOCX input, with MP3 and WAV output options. Check the detected chapters and extracted text before exporting. Image-only PDFs need text recognition first.</p></details>
      <details><summary>Can I listen on my phone?</summary><p>After conversion, copy the exported MP3 files to your phone and open them in a compatible audio player. Generating the audiobook requires the Windows app; listening to saved MP3 files does not.</p></details>
    </div>
  </section>;
}
