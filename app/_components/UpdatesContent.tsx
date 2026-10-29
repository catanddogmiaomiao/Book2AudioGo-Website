"use client";

import { useEffect, useState } from "react";
import { DOWNLOAD_URL, RELEASE_DATE, releaseCopy, type ReleaseLang } from "../_data/releases";

const languages: ReleaseLang[] = ["en", "zh", "ja", "ko"];

export default function UpdatesContent() {
  const [lang, setLang] = useState<ReleaseLang>("en");
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("lang");
    if (languages.includes(requested as ReleaseLang)) setLang(requested as ReleaseLang);
  }, []);
  useEffect(() => { document.documentElement.lang = lang === "zh" ? "zh-CN" : lang; }, [lang]);
  const t = releaseCopy[lang];
  function chooseLanguage(next: ReleaseLang) {
    setLang(next);
    const url = new URL(window.location.href);
    url.searchParams.set("lang", next);
    window.history.replaceState(null, "", url);
  }
  return <main className="updatesPage wrap">
    <nav className="updatesNav" aria-label="Updates navigation">
      <a className="brand" href={`/?lang=${lang}`}><span className="brandmark">B<span>▶</span></span><strong>Book2Audio <i>GO</i></strong></a>
      <div className="language" aria-label="Language">{languages.map(l => <button key={l} type="button" aria-pressed={lang === l} className={lang === l ? "active" : ""} onClick={() => chooseLanguage(l)}>{l.toUpperCase()}</button>)}</div>
    </nav>
    <header className="updatesHeader"><a className="updateReadMore" href={`/?lang=${lang}`}>← {t.back}</a><p className="eyebrow">BOOK2AUDIO GO</p><h1>{t.title}</h1><p className="lead">{t.intro}</p></header>
    <article className="releaseCard" aria-labelledby="release-title">
      <p className="updateMeta"><span>{t.badge}</span><time dateTime={RELEASE_DATE}>2026.10.29</time></p>
      <h2 id="release-title">{t.releaseTitle}</h2><p className="releasePlatform">{t.platform}</p>
      <a className="primary" href={DOWNLOAD_URL}>{t.download}<span aria-hidden="true"> ↗</span></a>
      <div className="releaseGroups">{t.groups.map(group => <section key={group.title}><h3>{group.title}</h3><ul>{group.items.map(item => <li key={item}>{item}</li>)}</ul></section>)}</div>
      <section className="upgradeGuide" aria-labelledby="upgrade-title"><h3 id="upgrade-title">{t.upgradeTitle}</h3><ol>{t.upgradeSteps.map(step => <li key={step}>{step}</li>)}</ol></section>
    </article>
    <section className="releaseQuestions" aria-labelledby="questions-title"><h2 id="questions-title">{t.questionsTitle}</h2><div className="faqList">{t.questions.map(q => <details key={q.question}><summary>{q.question}</summary><p>{q.answer}</p></details>)}</div></section>
    <footer className="updatesFooter"><a className="updateReadMore" href={`/?lang=${lang}`}>← {t.back}</a><a className="updateDownload" href={DOWNLOAD_URL}>{t.download} ↗</a></footer>
  </main>;
}
