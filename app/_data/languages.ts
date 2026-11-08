export const languages = ["en", "zh", "ja", "ko", "fr", "es"] as const;
export type Lang = (typeof languages)[number];
export const isLang = (value: unknown): value is Lang => languages.some(lang => lang === value);
export const languageName: Record<Lang, string> = {
  en: "English", zh: "简体中文", ja: "日本語", ko: "한국어", fr: "Français", es: "Español",
};
export const languageLabel: Record<Lang, string> = {
  en: "Language", zh: "语言", ja: "言語", ko: "언어", fr: "Langue", es: "Idioma",
};
export const htmlLang = (lang: Lang) => lang === "zh" ? "zh-CN" : lang;
export const paddleLang = (lang: Lang) => lang === "zh" ? "zh-Hans" : lang;

type Translations = readonly [string, string, string, string, string];
export function localize<K extends string>(copy: Record<K, Translations>) {
  return (lang: Lang, key: K, values?: Record<string, string | number>) => {
    const message = lang === "en" ? key : copy[key][languages.indexOf(lang) - 1];
    return values ? message.replace(/\{(\w+)\}/g, (match, name) => String(values[name] ?? match)) : message;
  };
}

export function localizedHref(path: string, lang: Lang) {
  const url = new URL(path, "https://book2audiogo.com");
  if (lang !== "en") url.searchParams.set("lang", lang);
  return url.pathname + url.search + url.hash;
}

export function localeAlternates(path: string, lang: Lang) {
  return {
    canonical: localizedHref(path, lang),
    languages: Object.fromEntries([...languages.map(option => [htmlLang(option), localizedHref(path, option)]), ["x-default", path]]),
  };
}
