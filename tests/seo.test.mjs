import assert from "node:assert/strict";
import { readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { Miniflare } from "miniflare";

// Exercise the built Cloudflare Worker, not source-string assertions.
const serverRoot = resolve("dist/server");
const files = (await readdir(serverRoot, { recursive: true })).filter(file => /\.(m?js)$/.test(file) && file !== "index.js");
const worker = new Miniflare({
  modulesRoot: serverRoot,
  modules: ["index.js", ...files].map(file => ({ type: "ESModule", path: resolve(serverRoot, file) })),
  compatibilityDate: "2026-05-15",
  compatibilityFlags: ["nodejs_compat"],
  assets: { directory: resolve("dist/client"), binding: "ASSETS", routerConfig: { has_user_worker: true, invoke_user_worker_ahead_of_assets: true } },
});

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
  assert.match(html, /Older app will not open or convert audio/);
  assert.ok(html.includes('href="/updates?lang=en"'));
  const updatesResponse = await worker.dispatchFetch("https://book2audiogo.com/updates");
  assert.equal(updatesResponse.status, 200);
  const updatesHtml = await updatesResponse.text();
  assert.equal((updatesHtml.match(/<h1[\s>]/g) ?? []).length, 1);
  assert.ok(updatesHtml.includes("<h1>Release notes</h1>"));
  assert.match(updatesHtml, /rel="canonical" href="https:\/\/book2audiogo.com\/updates"/);
  for (const text of ["Reading plans and reliability update", "How to upgrade", "python312.dll", "_internal", "about 67 MB", "app is running"]) {
    assert.ok(updatesHtml.includes(text), "Release notes missing: " + text);
  }
  for (const htmlPage of [html, updatesHtml]) {
    assert.ok(htmlPage.includes('href="https://pub-f257fbbebf604ed69c35001d3c3ea070.r2.dev/Book2AudioGO-v1.0.0.zip"'));
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
  assert.deepEqual([...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]), ["https://book2audiogo.com/", "https://book2audiogo.com/pdf-to-audiobook", "https://book2audiogo.com/epub-to-mp3", "https://book2audiogo.com/updates"]);

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
  console.log("Checks passed: homepage, release notes, upgrade guidance, downloads, sitemap, SEO and redirects.");
} finally {
  await worker.dispose();
}

