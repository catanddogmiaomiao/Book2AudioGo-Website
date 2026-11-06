import { randomBytes } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { createWebhookGateway } from "./webhook-gateway-core.mjs";

const endpointPath = "/paddle-sandbox-webhook-" + randomBytes(24).toString("hex");
const port = 8788;
const server = createWebhookGateway({ endpointPath, observe: result => console.log("sandbox_webhook_result", JSON.stringify(result)) });
server.listen(port, "127.0.0.1", () => {
  mkdirSync(".local", { recursive: true });
  writeFileSync(".local/webhook-gateway-session.json", JSON.stringify({ port, endpointPath }, null, 2));
  console.log("Local-only webhook gateway: http://127.0.0.1:" + port + endpointPath);
  console.log("No public tunnel started. Website and config routes are not forwarded.");
});
server.on("error", error => { console.error("Gateway could not start:", error.code ?? "unknown"); process.exitCode = 1; });
