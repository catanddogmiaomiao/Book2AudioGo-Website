"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { htmlLang, isLang, languageLabel, languageName, languages, type Lang } from "../_data/languages";

const Locale = createContext({ lang: "en" as Lang, choose: (_next: Lang) => {} });

export function LanguageProvider({ initial, children }: { initial: Lang; children: ReactNode }) {
  const [lang, setLang] = useState(initial);
  function choose(next: Lang) {
    const url = new URL(window.location.href);
    url.searchParams.set("lang", next);
    window.history.replaceState(window.history.state, "", url);
    document.documentElement.lang = htmlLang(next);
    setLang(next);
  }
  return <Locale.Provider value={{ lang, choose }}>{children}</Locale.Provider>;
}

export const useLanguage = () => useContext(Locale).lang;

export function LanguageMenu() {
  const { lang, choose } = useContext(Locale);
  return <select className="languageMenu" value={lang} aria-label={languageLabel[lang]} onChange={event => {
    const next = event.currentTarget.value;
    if (isLang(next)) choose(next);
  }}>
    {languages.map(option => <option key={option} value={option} lang={htmlLang(option)}>{languageName[option]}</option>)}
  </select>;
}
