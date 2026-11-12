import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { Miniflare } from "miniflare";

const server = resolve("dist/server");
const client = resolve("dist/client");
const files = (await readdir(server, { recursive: true }))
  .filter(file => /\.(m?js)$/.test(file) && file !== "index.js");
const sitemap = await readFile("public/sitemap.xml", "utf8");
const paths = Array.from(sitemap.matchAll(/<loc>([^<]+)<\/loc>/g), match => new URL(match[1]).pathname)
  .filter(path => path !== "/updates" && path !== "/guides/itunes-apple-music");
const worker = new Miniflare({
  modulesRoot: server,
  modules: ["index.js", ...files].map(file => ({ type: "ESModule", path: resolve(server, file) })),
  compatibilityDate: "2026-05-15",
  compatibilityFlags: ["nodejs_compat"],
  assets: { directory: client, binding: "ASSETS", routerConfig: { has_user_worker: true, invoke_user_worker_ahead_of_assets: true } },
});

const pages = [];
try {
  for (const path of paths) {
    const response = await worker.dispatchFetch("http://localhost" + path, { redirect: "manual" });
    const html = await response.text();
    if (response.status !== 200 || !html.includes("<h1>")) {
      throw new Error(`Cannot pre-render ${path}: HTTP ${response.status}`);
    }
    pages.push({ path, html });
  }
} finally {
  await worker.dispose();
}

for (const { path, html } of pages) {
  const file = resolve(client, "_marketing" + (path === "/" ? "/home" : path) + ".html");
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, html);
}
console.log(`Pre-rendered ${pages.length} public marketing pages.`);
