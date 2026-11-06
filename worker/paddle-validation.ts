import { Environment, LogLevel, Paddle } from "@paddle/paddle-node-sdk";
import { PRICE_ID, PRODUCT_ID } from "../shared/paddle.ts";

// The SDK verifier performs no API calls. No API key is needed or read.
const paddle = new Paddle("unused-webhook-verifier", { environment: Environment.sandbox, logLevel: LogLevel.none });
export async function verifyEvent(raw: string, signature: string, secret: string) {
  // Also reject future timestamps; the SDK enforces expired signatures.
  const timestamp = /(?:^|;)ts=(\d+)(?:;|$)/.exec(signature)?.[1];
  if (!timestamp || Math.abs(Date.now() / 1000 - Number(timestamp)) > 5) throw new Error("signature");
  if (!await paddle.webhooks.isSignatureValid(raw, secret, signature)) throw new Error("signature");
  return JSON.parse(raw);
}

export interface TestOrder {
  eventId: string; transactionId: string; occurredAt: string;
  currency: string; total: string;
}
export function completedOrder(event: any): TestOrder | null {
  if (event.event_type !== "transaction.completed") return null;
  const data = event.data;
  const item = data?.items?.[0];
  if (!/^evt_[a-z0-9]{26}$/.test(event.event_id ?? "") ||
      !/^txn_[a-z0-9]{26}$/.test(data?.id ?? "") ||
      !Number.isFinite(Date.parse(event.occurred_at)) || data.status !== "completed" ||
      data.items.length !== 1 || item.quantity !== 1 || item.price?.id !== PRICE_ID ||
      item.price.product_id !== PRODUCT_ID || item.price.billing_cycle !== null ||
      item.price.trial_period !== null || data.subscription_id != null ||
      !/^[A-Z]{3}$/.test(data.currency_code ?? "") ||
      !/^\d+$/.test(data.details?.totals?.total ?? "")) throw new Error("order_mismatch");
  return { eventId: event.event_id, transactionId: data.id, occurredAt: event.occurred_at,
    currency: data.currency_code, total: data.details.totals.total };
}
