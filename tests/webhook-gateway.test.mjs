import assert from "node:assert/strict";
import { createServer } from "node:http";
import { once } from "node:events";
import { createWebhookGateway } from "../scripts/webhook-gateway-core.mjs";

const path = "/paddle-sandbox-webhook-" + "a".repeat(48);
const raw = Buffer.from(' { "event_type": "transaction.completed", "synthetic": true }\n');
let deliveries = 0;
const upstream = createServer(async (req, res) => {
  const chunks = []; for await (const c of req) chunks.push(c);
  assert.deepEqual(Buffer.concat(chunks), raw, "raw signed bytes must not be normalized");
  assert.equal(req.headers["paddle-signature"], "synthetic-signature");
  assert.equal(req.headers.cookie, undefined);
  assert.equal(req.headers.authorization, undefined);
  deliveries++;
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ received: true, duplicate: false, should_not_echo: "synthetic-private-value" }));
});
upstream.listen(0, "127.0.0.1"); await once(upstream, "listening");
const logs = [];
const gateway = createWebhookGateway({ endpointPath: path, upstream: `http://127.0.0.1:${upstream.address().port}/api/paddle/sandbox/webhook`, observe: event => logs.push(event) });
gateway.listen(0, "127.0.0.1"); await once(gateway, "listening");
const base = `http://127.0.0.1:${gateway.address().port}`;
try {
  for (const route of ["/", "/sandbox/purchase", "/api/paddle/sandbox/config", path, path + "?extra=1"]) assert.equal((await fetch(base + route)).status, 404);
  assert.equal((await fetch(base + path, { method: "POST", body: raw })).status, 401);
  assert.equal((await fetch(base + path, { method: "POST", headers: { "Paddle-Signature": "synthetic-signature" }, body: "x".repeat(262145) })).status, 413);
  const response = await fetch(base + path, { method: "POST", headers: { "Paddle-Signature": "synthetic-signature", Authorization: "Bearer synthetic-private-value", Cookie: "synthetic=private" }, body: raw });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { received: true, duplicate: false, ignored: false, activation: "not_implemented" });
  assert.equal(deliveries, 1);
  assert.equal(JSON.stringify(logs).includes("synthetic-private-value"), false);
  assert.throws(() => createWebhookGateway({ endpointPath: path, upstream: "https://example.invalid/api/paddle/sandbox/webhook" }));
  console.log("Local webhook gateway checks passed: dedicated POST only, no website/config exposure, signature required, raw bytes preserved, body limit, local upstream only, no private headers or payload echo. No public service started.");
} finally {
  await Promise.all([new Promise(resolve => gateway.close(resolve)), new Promise(resolve => upstream.close(resolve))]);
}
