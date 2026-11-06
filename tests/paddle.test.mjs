import assert from "node:assert/strict";
import { readdir, mkdtemp, rm } from "node:fs/promises";
import { createHmac } from "node:crypto";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { Miniflare } from "miniflare";

const serverRoot = resolve("dist/server");
const files = (await readdir(serverRoot, { recursive: true })).filter(file => /\.(m?js)$/.test(file) && file !== "index.js");
const storage = await mkdtemp(join(tmpdir(), "book-paddle-test-"));
// Synthetic test-only values, unrelated to any Paddle account or destination.
const secret = "synthetic-local-test-secret";
const config = {
  modulesRoot: serverRoot,
  modules: ["index.js", ...files].map(file => ({ type: "ESModule", path: resolve(serverRoot, file) })),
  compatibilityDate: "2026-05-15", compatibilityFlags: ["nodejs_compat"],
  assets: { directory: resolve("dist/client"), binding: "ASSETS", routerConfig: { has_user_worker: true, invoke_user_worker_ahead_of_assets: false } },
  durableObjects: { FEEDBACK_INBOX: { className: "FeedbackInbox", useSQLite: true }, PADDLE_TEST_ORDERS: { className: "PaddleTestOrders", useSQLite: true } },
  durableObjectsPersist: storage,
  bindings: { B2A_PADDLE_SANDBOX_ENABLED: "true", PADDLE_SANDBOX_WEBHOOK_SECRET: secret },
};
let worker = new Miniflare(config);
const base = "http://localhost";
const event = {
  event_id: "evt_" + "a".repeat(26), event_type: "transaction.completed", occurred_at: new Date().toISOString(),
  data: { id: "txn_" + "b".repeat(26), status: "completed", subscription_id: null, currency_code: "CNY",
    details: { totals: { total: "19900" } },
    items: [{ quantity: 1, price: { id: "pri_01m6fk9sjr68pdczk37kzwtd86", product_id: "pro_01m6fk4av9fqjyx1nkdxd6zapw", billing_cycle: null, trial_period: null } }] },
};
function signature(raw, timestamp = Math.floor(Date.now() / 1000)) {
  return `ts=${timestamp};h1=${createHmac("sha256", secret).update(`${timestamp}:${raw}`).digest("hex")}`;
}
async function post(body = event, options = {}) {
  const raw = typeof body === "string" ? body : JSON.stringify(body);
  return worker.dispatchFetch(base + "/api/paddle/sandbox/webhook", {
    method: "POST", body: raw, headers: { "Paddle-Signature": signature(raw), ...options },
  });
}
try {
  const html = await worker.dispatchFetch(base + "/sandbox/purchase");
  assert.equal(html.status, 200);
  assert.match(html.headers.get("X-Robots-Tag"), /noindex/);
  assert.match(await html.text(), /测试环境，不会真实扣款/);
  assert.equal((await worker.dispatchFetch("https://book2audiogo.com/sandbox/purchase")).status, 404);
  assert.equal((await worker.dispatchFetch("https://book2audiogo.com/api/paddle/sandbox/config")).status, 404);
  const publicConfig = await (await worker.dispatchFetch(base + "/api/paddle/sandbox/config")).json();
  assert.equal(publicConfig.token, null);
  assert.equal(JSON.stringify(publicConfig).includes(secret), false);
  assert.equal((await post(event, { "Paddle-Signature": "ts=1;h1=bad" })).status, 401);
  assert.equal((await worker.dispatchFetch(base + "/api/paddle/sandbox/webhook")).status, 405);
  assert.equal((await post("x".repeat(262145))).status, 400);
  const raw = JSON.stringify(event);
  assert.equal((await post(raw, { "Paddle-Signature": signature(raw, Math.floor(Date.now()/1000)-60) })).status, 401);
  assert.equal((await post(raw, { "Paddle-Signature": signature(raw, Math.floor(Date.now()/1000)+60) })).status, 401);
  assert.equal((await post(raw + " ", { "Paddle-Signature": signature(raw) })).status, 401, "raw body integrity");
  for (const change of [
    e => { e.data.status = "paid"; },
    e => { e.data.items[0].price.id = "pri_wrong"; },
    e => { e.data.items[0].price.product_id = "pro_wrong"; },
    e => { e.data.items[0].quantity = 2; },
    e => { e.data.items[0].price.billing_cycle = { interval: "month", frequency: 1 }; },
    e => { e.data.subscription_id = "sub_test"; },
  ]) {
    const wrong = structuredClone(event); change(wrong);
    assert.equal((await post(wrong)).status, 422);
  }
  assert.equal((await (await post({ ...event, event_type: "transaction.updated" })).json()).ignored, true);
  const initial = await (await post()).json();
  assert.equal(initial.duplicate, false);
  assert.equal(initial.activation, "not_implemented");
  const concurrent = await Promise.all(Array.from({ length: 5 }, () => post().then(r => r.json())));
  assert(concurrent.every(row => row.duplicate));
  assert.equal((await (await post({ ...event, event_id: "evt_" + "c".repeat(26) })).json()).duplicate, true);
  await worker.dispose();
  worker = new Miniflare(config);
  assert.equal((await (await post()).json()).duplicate, true, "dedupe survives restart");
  await worker.dispose();
  worker = new Miniflare({ ...config, bindings: { B2A_PADDLE_SANDBOX_ENABLED: "true", PADDLE_SANDBOX_CLIENT_TOKEN: "live_synthetic_rejected", PADDLE_SANDBOX_WEBHOOK_SECRET: "" } });
  const unconfigured = await (await worker.dispatchFetch(base + "/api/paddle/sandbox/config")).json();
  assert.equal(unconfigured.token, null, "live tokens must never be exposed to this checkout");
  assert.equal(unconfigured.webhookConfigured, false);
  assert.equal((await post()).status, 503, "missing webhook secret must fail closed");
  await worker.dispose();
  worker = new Miniflare({ ...config, bindings: { ...config.bindings, B2A_PADDLE_SANDBOX_ENABLED: "false" } });
  assert.equal((await worker.dispatchFetch(base + "/sandbox/purchase")).status, 404);
  console.log("Paddle checks passed: sandbox gates, no secret exposure, SDK raw-body verification, expired/future/invalid signatures, product/price/status validation, concurrent dedupe, durable restart, no activation.");
} finally {
  await worker.dispose();
  await rm(storage, { recursive: true, force: true });
}
