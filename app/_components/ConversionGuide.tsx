import { getGuide, type GuideKind } from "../_data/conversion-guides";
import { guideText } from "../_data/guide-copy";
import { localizedHref, type Lang, type MarketingPath } from "../_data/languages";
import { DOWNLOAD_URL as download } from "../_data/releases";
import { MarketingLanguages } from "./MarketingNavigation";

export default function ConversionGuide({ kind, lang }: { kind: GuideKind; lang: Lang }) {
  const guide = getGuide(kind, lang);
  const t = (key: Parameters<typeof guideText>[1]) => guideText(lang, key);
  return <main>
    <nav className="nav wrap"><a className="brand" href={localizedHref("/", lang)}><span className="brandmark">B<span>▶</span></span><strong>Book2Audio <i>GO</i></strong></a><div className="accountNavControls"><a className="guideLink" href={localizedHref("/", lang)}>{t("Home")}</a><MarketingLanguages lang={lang} path={guide.path as MarketingPath} /></div></nav>
    <article className="guidePage wrap">
      <p className="eyebrow">{t("WINDOWS APP · FREE CORE FEATURES")}</p>
      <h1>{guide.h1}</h1><p className="lead">{guide.intro}</p>
      <a className="primary" href={download}>{t("Download for Windows")}</a><p className="note">{t("Windows 10/11 · Internet required for speech synthesis")}</p>
      <section><h2>{guide.useTitle}</h2><p>{guide.useText}</p></section>
      <section><h2>{t(kind === "pdf" ? "How to convert a PDF to audio" : "How to convert EPUB to MP3")}</h2><ol className="guideSteps">{guide.steps.map(([title,body]) => <li key={title}><h3>{title}</h3><p>{body}</p></li>)}</ol></section>
      <section><h2>{guide.checkTitle}</h2><ul>{guide.checks.map(text => <li key={text}>{text}</li>)}</ul></section>
      <section><h2>{t("Frequently asked questions")}</h2><div className="faqList">{guide.faqs.map(([question,answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></section>
      <section className="guideClosing"><h2>{t("Try a short chapter first")}</h2><p>{t("Choose a voice, check the result and turn the rest of your reading into audio when you are ready. TXT and DOCX files are also supported, with MP3 and WAV output options.")}</p><a className="primary" href={download}>{t("Download Book2Audio GO")}</a></section>
      <p><a className="guideLink" href={localizedHref(guide.relatedPath, lang)}>{guide.relatedTitle} →</a></p><p><a className="guideLink" href={localizedHref("/", lang)}>{t("Explore Book2Audio GO features")} →</a></p>
    </article>
    <footer className="wrap"><p>{t("Book2Audio GO · Book to audio on Windows")}</p><p>{t("Core features are free. Text is sent to an online speech service for narration.")}</p></footer>
  </main>;
}
