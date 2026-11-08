import { createServer } from "node:http";

const MAX_BODY = 262144;
/** This gateway never reads .env, API keys, client tokens or signing secrets. */
export function createWebhookGateway({ endpointPath, upstream = "http://127.0.0.1:3000/api/paddle/sandbox/webhook", observe = () => {} }) {
  if (!/^\/paddle-sandbox-webhook-[a-f0-9]{48}$/.test(endpointPath)) throw new Error("Invalid dedicated webhook path");
  const target = new URL(upstream);
  const accountSandbox = target.pathname === "/v1/paddle/sandbox/webhook";
  if (target.protocol !== "http:" || !["localhost", "127.0.0.1", "[::1]"].includes(target.hostname) || (!accountSandbox && target.pathname !== "/api/paddle/sandbox/webhook") || target.search || target.username || target.password) throw new Error("Upstream must be the local sandbox webhook");
  const server = createServer(async (req, res) => {
    const reply = (status, body) => { res.writeHead(status, { "Content-Type": "application/json", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" }); res.end(JSON.stringify(body)); };
    if (req.url !== endpointPath || req.method !== "POST") { req.resume(); return reply(404, { error: "not_found" }); }
    const signature = req.headers["paddle-signature"];
    if (typeof signature !== "string" || !signature || signature.length > 512) { req.resume(); return reply(401, { error: "signature_required" }); }
    const chunks = []; let size = 0;
    try {
      for await (const chunk of req) {
        size += chunk.length;
        if (size > MAX_BODY) { reply(413, { error: "body_too_large" }); req.resume(); return; }
        chunks.push(chunk);
      }
      const response = await fetch(target, {
        method: "POST", redirect: "error", signal: AbortSignal.timeout(4000),
        headers: { "Content-Type": "application/json", "Paddle-Signature": signature },
        body: Buffer.concat(chunks),
      });
      // Return only known status fields. Do not echo payloads, headers or upstream details.
      const data = await response.json().catch(() => ({}));
      const result = response.ok
        ? { received: data.received === true, duplicate: data.duplicate === true, ignored: data.ignored === true,
          activation: accountSandbox ? (data.activated === true ? "sandbox_granted" : "sandbox_unchanged") : "not_implemented" }
        : { error: "upstream_rejected" };
      observe({ status: response.status, received: result.received === true, duplicate: result.duplicate === true });
      reply(response.status, result);
    } catch {
      observe({ status: 502, received: false, duplicate: false });
      if (!res.headersSent) reply(502, { error: "local_webhook_unavailable" });
    }
  });
  server.requestTimeout = 5000;
  server.headersTimeout = 5000;
  server.keepAliveTimeout = 1000;
  return server;
}
