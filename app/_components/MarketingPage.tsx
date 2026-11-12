import Home, { homeCopy } from "./Home";
import ConversionGuide from "./ConversionGuide";
import DiscoveryContent from "./DiscoveryContent";
import { MarketingLanguages } from "./MarketingNavigation";
import { guideMetadata } from "../_data/conversion-guides";
import { homeMetadata, marketingCopy, marketingMetadata } from "../_data/marketing-copy";
import { localizedHref, type Lang, type MarketingPath } from "../_data/languages";
import { DOWNLOAD_URL } from "../_data/releases";

function sectionInfo(lang: Lang, path: MarketingPath) {
  const copy = homeCopy[lang];
  const more = marketingCopy[lang];
  if (path === "/features") return { title: copy.nav[0], description: more.description };
  if (path === "/formats") return { title: more.formats, description: copy.formatsBody };
  return { title: more.how, description: copy.steps.map(([, title]) => title).join(" · ") };
}

export function routeMetadata(lang: Lang, path: MarketingPath) {
  if (path === "/") return homeMetadata(lang);
  if (path === "/pdf-to-audiobook" || path === "/epub-to-mp3") {
    return guideMetadata(path === "/pdf-to-audiobook" ? "pdf" : "epub", lang);
  }
  const { title, description } = sectionInfo(lang, path);
  return marketingMetadata(lang, path, title, description);
}

export default function MarketingPage({ lang, path }: { lang: Lang; path: MarketingPath }) {
  if (path === "/") return <Home lang={lang} />;
  if (path === "/pdf-to-audiobook" || path === "/epub-to-mp3") {
    return <ConversionGuide kind={path === "/pdf-to-audiobook" ? "pdf" : "epub"} lang={lang} />;
  }

  const copy = homeCopy[lang];
  const more = marketingCopy[lang];
  const { title, description } = sectionInfo(lang, path);
  return <main>
    <div className="nav wrap">
      <a className="brand" href={localizedHref("/", lang)}><span className="brandmark">B<span>▶</span></span><strong>Book2Audio <i>GO</i></strong></a>
      <MarketingLanguages lang={lang} path={path} />
    </div>
    <article className="guidePage wrap marketingDetail">
      <nav className="detailNav">{(["/features", "/how-it-works", "/formats"] as const).map((section, index) =>
        <a key={section} href={localizedHref(section, lang)} aria-current={section === path ? "page" : undefined}>{copy.nav[index]}</a>)}</nav>
      <h1>{title}</h1><p className="lead">{description}</p>
      {path === "/features" && <>
        <div className="featureSummaryGrid">{[...more.features, ...copy.cards].map(([label, text]) =>
          <section key={label}><h2>{label}</h2><p>{text}</p></section>)}</div>
        <p>{more.useCases}</p>
      </>}
      {path === "/how-it-works" && <>
        <ol className="guideSteps">{copy.steps.map(([number, label, text]) => <li key={number}><h2>{label}</h2><p>{text}</p></li>)}</ol>
        <p><a className="guideLink" href="/guides/itunes-apple-music" hrefLang="zh-CN">{more.related} →</a></p>
      </>}
      {path === "/formats" && <>
        <p className="formatPill">EPUB · PDF · TXT · DOCX → MP3 / WAV</p>
        <p>{more.useCases}</p>
      </>}
      <a className="primary" href={DOWNLOAD_URL}>{copy.download}</a>
    </article>
    {path === "/formats" && <DiscoveryContent lang={lang} />}
    <footer className="wrap"><p>{copy.footer}<br /><small>{copy.privacy}</small></p></footer>
  </main>;
}
