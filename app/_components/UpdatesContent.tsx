"use client";

import { DOWNLOAD_URL, RELEASE_DATE, releaseCopy, releaseDate } from "../_data/releases";
import { localizedHref } from "../_data/languages";
import { LanguageMenu, useLanguage } from "./Language";

export default function UpdatesContent() {
  const lang = useLanguage();
  const t = releaseCopy[lang];
  return <main className="updatesPage wrap">
    <nav className="updatesNav" aria-label={t.nav}>
      <a className="brand" href={localizedHref("/", lang)}><span className="brandmark">B<span>▶</span></span><strong>Book2Audio <i>GO</i></strong></a>
      <LanguageMenu />
    </nav>
    <header className="updatesHeader"><a className="updateReadMore" href={localizedHref("/", lang)}>← {t.back}</a><p className="eyebrow">BOOK2AUDIO GO</p><h1>{t.title}</h1><p className="lead">{t.intro}</p></header>
    <article className="releaseCard" aria-labelledby="release-title">
      <p className="updateMeta"><span>{t.badge}</span><time dateTime={RELEASE_DATE}>{releaseDate(lang)}</time></p>
      <h2 id="release-title">{t.releaseTitle}</h2><p className="releasePlatform">{t.platform}</p>
      <a className="primary" href={DOWNLOAD_URL}>{t.download}<span aria-hidden="true"> ↗</span></a>
      <div className="releaseGroups">{t.groups.map(group => <section key={group.title}><h3>{group.title}</h3><ul>{group.items.map(item => <li key={item}>{item}</li>)}</ul></section>)}</div>
      <section className="upgradeGuide" aria-labelledby="upgrade-title"><h3 id="upgrade-title">{t.upgradeTitle}</h3><ol>{t.upgradeSteps.map(step => <li key={step}>{step}</li>)}</ol></section>
    </article>
    <section className="releaseQuestions" aria-labelledby="questions-title"><h2 id="questions-title">{t.questionsTitle}</h2><div className="faqList">{t.questions.map(q => <details key={q.question}><summary>{q.question}</summary><p>{q.answer}</p></details>)}</div></section>
    <footer className="updatesFooter"><a className="updateReadMore" href={localizedHref("/", lang)}>← {t.back}</a><a className="updateDownload" href={DOWNLOAD_URL}>{t.download} ↗</a></footer>
  </main>;
}
