import { DurableObject } from "cloudflare:workers";
import { sandboxToken } from "../shared/paddle";
import { completedOrder, verifyEvent } from "./paddle-validation";

interface OrdersBinding { idFromName(name: string): unknown; get(id: unknown): { fetch(request: Request): Promise<Response> } }
export interface PaddleEnv {
  B2A_PADDLE_SANDBOX_ENABLED?: string;
  PADDLE_SANDBOX_CLIENT_TOKEN?: string;
  PADDLE_SANDBOX_WEBHOOK_SECRET?: string;
  PADDLE_TEST_ORDERS?: OrdersBinding;
}
const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow", "X-Content-Type-Options": "nosniff" };
const json = (value: unknown, status = 200) => Response.json(value, { status, headers });
export function sandboxEnabled(request: Request, env: PaddleEnv) {
  const host = new URL(request.url).hostname;
  return env.B2A_PADDLE_SANDBOX_ENABLED === "true" && ["localhost", "127.0.0.1", "[::1]"].includes(host);
}
async function rawBody(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error("empty");
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let raw = "", size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 262144) { await reader.cancel(); throw new Error("size"); }
    raw += decoder.decode(value, { stream: true });
  }
  return raw + decoder.decode();
}
export async function paddleRoute(request: Request, env: PaddleEnv): Promise<Response | null> {
  const path = new URL(request.url).pathname;
  if (!path.startsWith("/api/paddle/sandbox/")) return null;
  if (!sandboxEnabled(request, env)) return json({ error: "sandbox_disabled" }, 404);
  if (path === "/api/paddle/sandbox/config" && request.method === "GET") {
    const token = env.PADDLE_SANDBOX_CLIENT_TOKEN;
    return json({ token: sandboxToken(token) ? token : null,
      webhookConfigured: Boolean(env.PADDLE_SANDBOX_WEBHOOK_SECRET && env.PADDLE_TEST_ORDERS) });
  }
  if (path !== "/api/paddle/sandbox/webhook") return json({ error: "not_found" }, 404);
  if (request.method !== "POST") return json({ error: "method" }, 405);
  if (!env.PADDLE_SANDBOX_WEBHOOK_SECRET || !env.PADDLE_TEST_ORDERS) return json({ error: "webhook_not_configured" }, 503);
  let raw: string;
  try { raw = await rawBody(request); } catch { return json({ error: "invalid_body" }, 400); }
  let event;
  try { event = await verifyEvent(raw, request.headers.get("Paddle-Signature") ?? "", env.PADDLE_SANDBOX_WEBHOOK_SECRET); }
  catch { return json({ error: "invalid_signature" }, 401); }
  let order;
  try { order = completedOrder(event); } catch { return json({ error: "order_mismatch" }, 422); }
  if (!order) return json({ ignored: true });
  try {
    return await env.PADDLE_TEST_ORDERS.get(env.PADDLE_TEST_ORDERS.idFromName("sandbox-orders-v1"))
      .fetch(new Request("https://orders.internal/record", { method: "POST", body: JSON.stringify(order) }));
  } catch { return json({ error: "storage_unavailable" }, 503); }
}

export class PaddleTestOrders extends DurableObject {
  async fetch(request: Request): Promise<Response> {
    // This object has no public read/list endpoint and receives only verified minimal data.
    if (request.method !== "POST" || new URL(request.url).pathname !== "/record") return json({}, 404);
    const order = await request.json() as { eventId: string; transactionId: string; occurredAt: string; currency: string; total: string };
    const duplicate = this.ctx.storage.transactionSync(() => {
      const sql = this.ctx.storage.sql;
      sql.exec(`CREATE TABLE IF NOT EXISTS paddle_test_orders (
        transaction_id TEXT PRIMARY KEY, event_id TEXT NOT NULL UNIQUE,
        occurred_at TEXT NOT NULL, currency TEXT NOT NULL, total TEXT NOT NULL,
        activation_status TEXT NOT NULL DEFAULT 'not_implemented')`);
      sql.exec(`INSERT OR IGNORE INTO paddle_test_orders
        (transaction_id,event_id,occurred_at,currency,total) VALUES (?,?,?,?,?)`,
        order.transactionId, order.eventId, order.occurredAt, order.currency, order.total);
      return sql.exec("SELECT changes() AS count").one().count === 0;
    });
    return json({ received: true, duplicate, activation: "not_implemented" });
  }
}
