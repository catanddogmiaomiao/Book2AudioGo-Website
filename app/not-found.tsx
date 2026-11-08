"use client";

import { guideText } from "./_data/guide-copy";
import { localizedHref, localize } from "./_data/languages";
import { LanguageMenu, useLanguage } from "./_components/Language";

const text = localize({
  "Page not found": ["找不到页面", "ページが見つかりません", "페이지를 찾을 수 없습니다", "Page introuvable", "Página no encontrada"],
  "This page may have moved. Return to the homepage to continue.": [
    "页面可能已移动，可以返回首页继续浏览。", "ページが移動した可能性があります。ホームに戻ってください。",
    "페이지가 이동했을 수 있습니다. 홈페이지로 돌아가세요.", "Cette page a peut-être été déplacée. Revenez à l’accueil pour continuer.",
    "Es posible que la página se haya movido. Vuelve al inicio para continuar.",
  ],
});

export default function NotFound() {
  const lang = useLanguage();
  return <main className="wrap guidePage">
    <LanguageMenu />
    <p className="eyebrow">404</p>
    <h1>{text(lang, "Page not found")}</h1>
    <p>{text(lang, "This page may have moved. Return to the homepage to continue.")}</p>
    <a className="primary" href={localizedHref("/", lang)}>{guideText(lang, "Home")}</a>
  </main>;
}
