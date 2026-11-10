import assert from "node:assert/strict";
import { readdir, mkdtemp, rm } from "node:fs/promises";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { Miniflare } from "miniflare";

const serverRoot = resolve("dist/server");
const files = (await readdir(serverRoot, { recursive: true })).filter(file => /\.(m?js)$/.test(file) && file !== "index.js");
const storage = await mkdtemp(join(tmpdir(), "book-feedback-test-"));
const config = {
  modulesRoot: serverRoot,
  modules: ["index.js", ...files].map(file => ({ type: "ESModule", path: resolve(serverRoot, file) })),
  compatibilityDate: "2026-05-15", compatibilityFlags: ["nodejs_compat"],
  cf: { country: "JP", region: "Tokyo" },
  assets: { directory: resolve("dist/client"), binding: "ASSETS", routerConfig: { has_user_worker: true, invoke_user_worker_ahead_of_assets: false } },
  durableObjects: { FEEDBACK_INBOX: { className: "FeedbackInbox", useSQLite: true },
    DOWNLOAD_STATS: { className: "DownloadStats", useSQLite: true } },
  durableObjectsPersist: storage,
  d1Databases: { ACCOUNT_ANALYTICS: "download-report-fixture" },
  bindings: { FEEDBACK_ADMIN_KEY_HASH: createHash("sha256").update("test-only-admin-key").digest("hex") },
};
let worker = new Miniflare(config);
const key = "test-only-admin-key";
const auth = "Basic " + Buffer.from("admin:" + key).toString("base64");
const url = "https://book2audiogo.com";
const payload = { id: crypto.randomUUID(), kind: "issue", message: "中文测试留言 <script>alert(1)</script>", email: "test@example.com", lang: "zh", page: "/", rating: 2, website: "" };
const post = (data, extraHeaders = {}) => worker.dispatchFetch(url + "/api/feedback", { method: "POST", headers: { "Content-Type": "application/json", Origin: url, "CF-Connecting-IP": "192.0.2.10", ...extraHeaders }, body: JSON.stringify(data) });
try {
  const metrics = await worker.getD1Database("ACCOUNT_ANALYTICS");
  await metrics.batch([
    metrics.prepare("CREATE TABLE product_events (event_name TEXT, installation_id TEXT, received_at INTEGER)"),
    metrics.prepare("CREATE TABLE purchase_completed (received_at INTEGER)"),
    metrics.prepare("CREATE TABLE users (created INTEGER, email_verified_at INTEGER, registration_country TEXT, registration_region TEXT)"),
  ]);
  await metrics.batch([
    metrics.prepare(`INSERT INTO product_events VALUES
      ('app_open','install-a',unixepoch()),('conversion_completed','install-a',unixepoch()),
      ('conversion_failed','install-a',unixepoch()),('app_open','install-b',unixepoch()-172800)`),
    metrics.prepare("INSERT INTO purchase_completed VALUES(unixepoch())"),
    metrics.prepare("INSERT INTO users VALUES(unixepoch(),unixepoch(),'JP','Tokyo'),(unixepoch()-172800,NULL,NULL,NULL)"),
  ]);
  const html = await (await worker.dispatchFetch(url + "/")).text();
  assert.match(html, /feedbackLauncher/);
  assert.match(html, /<dialog/);
  assert.equal((await worker.dispatchFetch(url + "/api/feedback")).status, 405);
  assert.equal((await worker.dispatchFetch(url + "/admin/feedback")).status, 401);
  assert.equal((await worker.dispatchFetch(url + "/api/admin/feedback")).status, 401);
  assert.equal((await worker.dispatchFetch(url + "/api/admin/feedback", { headers: { Authorization: "Basic " + Buffer.from("admin:wrong").toString("base64") } })).status, 401);
  const downloads = url + "/download/windows";
  const report = url + "/admin/downloads";
  assert.equal((await worker.dispatchFetch(report)).status, 401);
  assert.equal((await worker.dispatchFetch(downloads, { method: "POST", redirect: "manual" })).status, 405);
  for (const options of [{ method: "HEAD" }, { headers: { "Sec-Purpose": "prefetch" } }, {}, {}]) {
    options.headers = { ...options.headers, "CF-Connecting-IP": "192.0.2.33" };
    const response = await worker.dispatchFetch(downloads, { ...options, redirect: "manual" });
    assert.equal(response.status, 302);
    assert.equal(response.headers.get("Cache-Control"), "no-store");
    assert.match(response.headers.get("Location"), /\/Book2AudioGo-1\.2\.0-windows-x64-setup\.exe$/);
  }
  const downloadReport = async (days = 30) => {
    const response = await worker.dispatchFetch(report + "?days=" + days, { headers: { Authorization: auth } });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("Cache-Control"), "no-store");
    return response.text();
  };
  for (let i = 0; i < 20; i++) {
    if ((await downloadReport()).includes("累计 <strong>2</strong>")) break;
    await new Promise(resolve => setTimeout(resolve, 25));
  }
  assert.match(await downloadReport(), /今天 <strong>2<\/strong> 次 · 累计 <strong>2<\/strong>/);
  assert.match(await downloadReport(), /已记录来源 2 次。去重 IP 为各日去重后相加，共 1/);
  assert.doesNotMatch(await downloadReport(), /192\.0\.2\.33/);
  assert.match(await downloadReport(), /<td>日本<\/td>\s*<td>Tokyo<\/td><td>2<\/td><td>1<\/td>/);
  assert.match(await downloadReport(1), /活跃安装<\/dt><dd>1/);
  assert.match(await downloadReport(7), /活跃安装<\/dt><dd>2/);
  assert.match(await downloadReport(), /失败率<\/dt><dd>50\.0%/);
  assert.match(await downloadReport(), /正式付款订单<\/dt><dd>1/);
  assert.match(await downloadReport(1), /当前注册总数<\/dt><dd>2/);
  assert.match(await downloadReport(1), /所选周期新增<\/dt><dd>1/);
  assert.match(await downloadReport(7), /所选周期新增<\/dt><dd>2/);
  assert.match(await downloadReport(), /<td>未知<\/td>\s*<td>—<\/td><td>1<\/td>/);
  assert.equal((await post(payload, { Origin: "https://evil.example" })).status, 403);
  assert.equal((await post({ ...payload, message: "x" })).status, 400);
  assert.equal((await post({ ...payload, email: "invalid" })).status, 400);
  assert.equal((await post({ ...payload, website: "bot.example" })).status, 400);
  assert.equal((await post({ ...payload, message: "x".repeat(17000) })).status, 400);
  assert.equal((await post(payload)).status, 201);
  assert.equal((await post(payload)).status, 200, "retry must be idempotent");
  assert.equal((await post({ ...payload, id: crypto.randomUUID() })).status, 429);
  const admin = await worker.dispatchFetch(url + "/admin/feedback", { headers: { Authorization: auth } });
  assert.equal(admin.status, 200);
  assert.match(admin.headers.get("X-Robots-Tag"), /noindex/);
  assert.match(await admin.text(), /textContent=row.message/);
  const list = async () => (await worker.dispatchFetch(url + "/api/admin/feedback", { headers: { Authorization: auth } })).json();
  let data = await list();
  assert.equal(data.rows.length, 1);
  assert.equal(data.rows[0].message, payload.message);
  assert.equal(data.rows[0].email, payload.email);
  assert.equal(data.rows[0].status, "new");
  assert.equal(data.rows[0].client, undefined);
  assert.equal((await worker.dispatchFetch(url + "/api/admin/feedback", { method: "PATCH", headers: { Authorization: auth, "Content-Type": "application/json", Origin: "https://evil.example" }, body: JSON.stringify({ id: payload.id, status: "resolved" }) })).status, 403);
  const patch = await worker.dispatchFetch(url + "/api/admin/feedback", { method: "PATCH", headers: { Authorization: auth, "Content-Type": "application/json", Origin: url }, body: JSON.stringify({ id: payload.id, status: "resolved" }) });
  assert.equal(patch.status, 200);
  assert.equal((await list()).rows[0].status, "resolved");
  // Recreate the worker to prove records survive an isolate restart.
  await worker.dispose();
  worker = new Miniflare(config);
  assert.match(await downloadReport(), /累计 <strong>2<\/strong>/);
  data = await list();
  assert.equal(data.rows.length, 1);
  assert.equal(data.rows[0].status, "resolved");
  for (const [index, lang] of ["fr", "es"].entries()) {
    assert.equal((await post({ ...payload, id: crypto.randomUUID(), lang }, { "CF-Connecting-IP": `192.0.2.${20 + index}` })).status, 201);
  }
  assert.deepEqual((await list()).rows.map(row => row.lang).sort(), ["es", "fr", "zh"]);
  console.log("Feedback checks passed: validation, origin checks, private inbox, durable storage, idempotency, rate limits and state updates.");
} finally { await worker.dispose(); await rm(storage, { recursive: true, force: true, maxRetries: 5 }); }
