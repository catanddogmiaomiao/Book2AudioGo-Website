import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { Miniflare } from "miniflare";

// Exercise the built Cloudflare Worker, not source-string assertions.
const serverRoot = resolve("dist/server");
const productionConfig = JSON.parse(await readFile(resolve(serverRoot, "wrangler.json"), "utf8"));
assert.equal(productionConfig.assets.binding, "ASSETS");
assert.ok(productionConfig.d1_databases.some(database => database.binding === "ACCOUNT_ANALYTICS" && database.database_id),
  "Production must bind the account database for registration statistics");
const files = (await readdir(serverRoot, { recursive: true })).filter(file => /\.(m?js)$/.test(file) && file !== "index.js");
const worker = new Miniflare({
  modulesRoot: serverRoot,
  modules: ["index.js", ...files].map(file => ({ type: "ESModule", path: resolve(serverRoot, file) })),
  compatibilityDate: "2026-05-15",
  compatibilityFlags: ["nodejs_compat"],
  assets: { directory: resolve("dist/client"), binding: "ASSETS", routerConfig: { has_user_worker: true, invoke_user_worker_ahead_of_assets: true } },
});

function checkFavicon(html) {
  assert.match(html.match(/<head[^>]*>([\s\S]*?)<\/head>/i)?.[1] ?? "",
    /<link rel="icon" href="\/favicon\.ico\?v=3"/);
}

try {
  const response = await worker.dispatchFetch("https://book2audiogo.com/");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<html lang="en">/);
  assert.match(html, /<title>Free PDF &amp; EPUB to Audiobook Converter \| Book2Audio GO<\/title>/);
  assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1);
  assert.match(html, /<h1>Convert PDF and EPUB\s+Books to MP3 Audiobooks<\/h1>/);
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/);
  assert.ok(canonical);
  assert.equal(new URL(canonical[1]).href, "https://book2audiogo.com/");
  const description = html.match(/<meta name="description" content="([^"]+)"/);
  assert.ok(description);
  for (const format of ["EPUB", "PDF", "TXT", "DOCX", "MP3", "WAV", "export by chapter"]) {
    assert.ok(description[1].includes(format));
  }
  for (const keyword of ["ebook to audiobook", "EPUB to MP3", "PDF to audiobook", "chapter-based MP3"]) {
    assert.ok(html.includes(keyword));
  }
  assert.match(html, /name="viewport" content="width=device-width, initial-scale=1"/);
  assert.doesNotMatch(html, /<meta[^>]+content="[^"]*noindex/i);

  assert.match(html, /id="update-notice-title"/);
  assert.match(html, /Version 1\.2\.0 is available/);
  assert.ok(html.includes('href="/updates"'));
  const updatesResponse = await worker.dispatchFetch("https://book2audiogo.com/updates");
  assert.equal(updatesResponse.status, 200);
  const updatesHtml = await updatesResponse.text();
  checkFavicon(updatesHtml);
  assert.equal((updatesHtml.match(/<h1[\s>]/g) ?? []).length, 1);
  assert.ok(updatesHtml.includes("<h1>Release notes</h1>"));
  assert.match(updatesHtml, /rel="canonical" href="https:\/\/book2audiogo.com\/updates"/);
  for (const text of ["Book2Audio GO 1.2.0", "How to upgrade", "64-bit installer", "about 59 MB", "run the EXE"]) {
    assert.ok(updatesHtml.includes(text), "Release notes missing: " + text);
  }
  for (const htmlPage of [html, updatesHtml]) {
    assert.ok(htmlPage.includes('href="/download/windows"'));
  }
  const pageTitles = new Set([html.match(/<title>(.*?)<\/title>/)[1]]);
  for (const [path, heading] of [["/pdf-to-audiobook", "Convert PDF to Audio and MP3 Audiobooks"], ["/epub-to-mp3", "Convert EPUB to MP3 Audiobooks by Chapter"]]) {
    assert.ok(html.includes(`href="${path}"`), "Homepage must link to each guide");
    const guideResponse = await worker.dispatchFetch(`https://book2audiogo.com${path}`);
    assert.equal(guideResponse.status, 200);
    const guideHtml = await guideResponse.text();
    assert.equal((guideHtml.match(/<h1[\s>]/g) ?? []).length, 1);
    assert.ok(guideHtml.includes(`<h1>${heading}</h1>`));
    const guideCanonical = guideHtml.match(/<link rel="canonical" href="([^"]+)"/);
    assert.equal(new URL(guideCanonical[1]).href, `https://book2audiogo.com${path}`);
    const title = guideHtml.match(/<title>(.*?)<\/title>/)[1];
    assert.ok(!pageTitles.has(title), "Each page needs a distinct title");
    pageTitles.add(title);
    assert.ok(guideHtml.includes('href="/"'));
    assert.ok(guideHtml.includes("Frequently asked questions"));
    assert.doesNotMatch(guideHtml, /<meta[^>]+content="[^"]*noindex/i);
    assert.match(guideHtml, /property="og:url"/);
  }

  const sitemap = await worker.dispatchFetch("https://book2audiogo.com/sitemap.xml");
  assert.equal(sitemap.status, 200);
  assert.match(sitemap.headers.get("content-type"), /xml/);
  const xml = await sitemap.text();
  assert.match(xml, /xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9"/);
  const listed = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => new URL(m[1]).pathname);
  const marketingPaths = ["/", "/features", "/how-it-works", "/formats", "/pdf-to-audiobook", "/epub-to-mp3"];
  for (const lang of ["en", "zh", "ja", "ko", "fr", "es"]) {
    for (const route of marketingPaths) {
      const path = lang === "en" ? route : "/" + lang + (route === "/" ? "" : route);
      assert.ok(listed.includes(path), "Missing from sitemap: " + path);
      const result = await worker.dispatchFetch("https://book2audiogo.com" + path);
      assert.equal(result.status, 200, path);
      const body = await result.text();
      const artifact = await readFile("dist/client/_marketing" + (path === "/" ? "/home" : path) + ".html", "utf8");
      checkFavicon(body);
      assert.equal(body, artifact, "Must serve pre-rendered HTML: " + path);
      assert.ok(body.includes(`<html lang="${lang === "zh" ? "zh-CN" : lang}">`), path);
      assert.match(body, /hreflang="x-default"/i);
      const preferred = body.match(/<link rel="canonical" href="([^"]+)"/);
      assert.equal(new URL(preferred[1]).pathname, path);
      assert.doesNotMatch(body, /<meta[^>]+content="[^"]*noindex/i);
    }
  }
  const tutorial = await worker.dispatchFetch("https://book2audiogo.com/guides/itunes-apple-music");
  assert.equal(tutorial.status, 200);
  const tutorialHtml = await tutorial.text();
  assert.match(tutorialHtml, /Open Audio Folder/);
  checkFavicon(tutorialHtml);

  const robots = await worker.dispatchFetch("https://book2audiogo.com/robots.txt");
  assert.equal(robots.status, 200);
  const rules = await robots.text();
  assert.match(rules, /User-agent: \*\s+Allow: \//);
  assert.match(rules, /Sitemap: https:\/\/book2audiogo.com\/sitemap.xml/);
  assert.doesNotMatch(rules, /Disallow:\s*\//);

  for (const source of ["http://book2audiogo.com/", "http://www.book2audiogo.com/", "https://www.book2audiogo.com/"]) {
    const redirected = await worker.dispatchFetch(`${source}?utm_source=test`, { redirect: "manual" });
    assert.equal(redirected.status, 301);
    assert.equal(redirected.headers.get("location"), "https://book2audiogo.com/?utm_source=test");
  }
  const local = await worker.dispatchFetch("http://localhost/");
  assert.equal(local.status, 200);
  const localizedHeadings = {
    en: ["Convert PDF and EPUB", "Release notes", "Convert PDF to Audio and MP3 Audiobooks", "Convert EPUB to MP3 Audiobooks by Chapter", "Your account", "Feedback"],
    zh: ["让每一本书", "更新日志", "把 PDF 转成音频和 MP3 有声书", "将 EPUB 按章节转换成 MP3 有声书", "用户中心", "留言与反馈"],
    ja: ["すべての本に", "更新情報", "PDF を音声や MP3 オーディオブックに変換", "EPUB を章ごとの MP3 オーディオブックに変換", "アカウント", "ご意見・お問い合わせ"],
    ko: ["모든 책에", "업데이트 내역", "PDF를 오디오와 MP3 오디오북으로 변환", "EPUB를 챕터별 MP3 오디오북으로 변환", "내 계정", "문의 및 피드백"],
    fr: ["Vos PDF et EPUB", "Notes de version", "Convertir les PDF en audio et en livres audio MP3", "Convertir un EPUB en livre audio MP3 par chapitre", "Votre compte", "Commentaires"],
    es: ["Convierte PDF y EPUB", "Notas de la versión", "Convertir PDF en audio y audiolibros MP3", "Convertir EPUB en audiolibros MP3 por capítulos", "Tu cuenta", "Comentarios"],
  };
  for (const [lang, headings] of Object.entries(localizedHeadings)) {
    const paths = ["/", "/updates", "/pdf-to-audiobook", "/epub-to-mp3", "/account"];
    for (const [index, path] of paths.entries()) {
      const marketing = marketingPaths.includes(path);
      const localized = lang === "en" ? path : "/" + lang + (path === "/" ? "" : path);
      const page = await worker.dispatchFetch("https://book2audiogo.com" + (marketing ? localized : path + "?lang=" + lang));
      assert.equal(page.status, 200, `${path} ${lang}`);
      const body = await page.text();
      assert.ok(body.includes(`<html lang="${lang === "zh" ? "zh-CN" : lang}">`), `${path} document language ${lang}`);
      assert.ok(body.match(/<h1>(.*?)<\/h1>/s)?.[1].includes(headings[index]), `${path} heading ${lang}`);
      assert.ok(body.includes(headings[5]), `${path} feedback language ${lang}`);
      if (!marketing) for (const option of Object.keys(localizedHeadings)) assert.ok(body.includes(`value="${option}"`));
      if (index < 4) assert.match(body, /hreflang="fr"/i);
      if (path === "/" && lang !== "en") assert.ok(body.includes(`href="/${lang}/epub-to-mp3"`));
    }
  }
  for (const [mode, heading] of [["recover", "Mot de passe oublié"], ["reset", "Réinitialiser le mot de passe"]]) {
    const page = await worker.dispatchFetch(`https://book2audiogo.com/account?lang=fr&mode=${mode}`);
    assert.ok((await page.text()).includes(`<h2>${heading}</h2>`));
  }
  const oldURL = await worker.dispatchFetch("https://book2audiogo.com/pdf-to-audiobook?lang=zh&utm_source=test", { redirect: "manual" });
  assert.equal(oldURL.status, 301);
  assert.equal(oldURL.headers.get("location"), "https://book2audiogo.com/zh/pdf-to-audiobook?utm_source=test");
  const missing = await worker.dispatchFetch("https://book2audiogo.com/missing-test-page?lang=es");
  assert.equal(missing.status, 404);
  assert.match(await missing.text(), /Página no encontrada/);
  console.log("Checks passed: homepage, release notes, upgrade guidance, downloads, sitemap, SEO and redirects.");
} finally {
  await worker.dispose();
}

