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

export const marketingPaths = ["/", "/features", "/how-it-works", "/formats", "/pdf-to-audiobook", "/epub-to-mp3"] as const;
export type MarketingPath = (typeof marketingPaths)[number];
export function isMarketingPath(value: string): value is MarketingPath {
  return marketingPaths.some(path => path === value);
}

export function marketingRoute(pathname: string): { lang: Lang; path: MarketingPath } | undefined {
  const normalized = pathname.replace(/\/$/, "") || "/";
  const [, first, ...rest] = normalized.split("/");
  const path = isLang(first) ? "/" + rest.join("/") : normalized;
  if (isMarketingPath(path)) return { lang: isLang(first) ? first : "en", path };
}

export function localizedHref(path: string, lang: Lang) {
  const url = new URL(path, "https://book2audiogo.com");
  if (isMarketingPath(url.pathname)) {
    url.searchParams.delete("lang");
    if (lang !== "en") url.pathname = "/" + lang + (url.pathname === "/" ? "" : url.pathname);
  } else if (lang !== "en") {
    url.searchParams.set("lang", lang);
  }
  return url.pathname + url.search + url.hash;
}

export function localeAlternates(path: string, lang: Lang) {
  return {
    canonical: localizedHref(path, lang),
    languages: Object.fromEntries([...languages.map(option => [htmlLang(option), localizedHref(path, option)]), ["x-default", path]]),
  };
}

export function iphoneGuideHref(lang: Lang) {
  return (lang === "zh" ? "" : `/${lang}`) + "/guides/itunes-apple-music";
}
