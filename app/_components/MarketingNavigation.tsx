import { htmlLang, languageLabel, languageName, languages, localizedHref, type Lang, type MarketingPath } from "../_data/languages";

export function MarketingLanguages({ lang, path }: { lang: Lang; path: MarketingPath }) {
  return <nav className="marketingLanguages" aria-label={languageLabel[lang]}>
    {languages.map(option => <a key={option} href={localizedHref(path, option)}
      lang={htmlLang(option)} hrefLang={htmlLang(option)} aria-label={languageName[option]}
      aria-current={option === lang ? "page" : undefined}>{option.toUpperCase()}</a>)}
  </nav>;
}
