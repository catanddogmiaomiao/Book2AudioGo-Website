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
  assets: { directory: resolve("dist/client"), binding: "ASSETS", routerConfig: { has_user_worker: true, invoke_user_worker_ahead_of_assets: false } },
  durableObjects: { FEEDBACK_INBOX: { className: "FeedbackInbox", useSQLite: true } },
  durableObjectsPersist: storage,
  bindings: { FEEDBACK_ADMIN_KEY_HASH: createHash("sha256").update("test-only-admin-key").digest("hex") },
};
let worker = new Miniflare(config);
const key = "test-only-admin-key";
const auth = "Basic " + Buffer.from("admin:" + key).toString("base64");
const url = "https://book2audiogo.com";
const payload = { id: crypto.randomUUID(), kind: "issue", message: "中文测试留言 <script>alert(1)</script>", email: "test@example.com", lang: "zh", page: "/", rating: 2, website: "" };
const post = (data, extraHeaders = {}) => worker.dispatchFetch(url + "/api/feedback", { method: "POST", headers: { "Content-Type": "application/json", Origin: url, "CF-Connecting-IP": "192.0.2.10", ...extraHeaders }, body: JSON.stringify(data) });
try {
  const html = await (await worker.dispatchFetch(url + "/")).text();
  assert.match(html, /feedbackLauncher/);
  assert.match(html, /<dialog/);
  assert.equal((await worker.dispatchFetch(url + "/api/feedback")).status, 405);
  assert.equal((await worker.dispatchFetch(url + "/admin/feedback")).status, 401);
  assert.equal((await worker.dispatchFetch(url + "/api/admin/feedback")).status, 401);
  assert.equal((await worker.dispatchFetch(url + "/api/admin/feedback", { headers: { Authorization: "Basic " + Buffer.from("admin:wrong").toString("base64") } })).status, 401);
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
  data = await list();
  assert.equal(data.rows.length, 1);
  assert.equal(data.rows[0].status, "resolved");
  console.log("Feedback checks passed: validation, origin checks, private inbox, durable storage, idempotency, rate limits and state updates.");
} finally { await worker.dispose(); await rm(storage, { recursive: true, force: true }); }
