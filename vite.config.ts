import vinext from "vinext";
import { defineConfig } from "vite";
import hostingConfig from "./.openai/hosting.json";
import { sites } from "./build/sites-vite-plugin";

const SITE_CREATOR_PLACEHOLDER_DATABASE_ID =
  "00000000-0000-4000-8000-000000000000";

const { d1, r2 } = hostingConfig;
const PRODUCTION_ACCOUNT_ANALYTICS_DATABASE_ID = "a5948678-7492-4557-a2cd-5dc1b94d78d8";

// macOS Seatbelt blocks FSEvents, so Codex previews need polling for HMR.
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === "seatbelt";

const localBindingConfig = {
  main: "./worker/index.ts",
  assets: { binding: "ASSETS" },
  compatibility_flags: ["nodejs_compat"],
  durable_objects: { bindings: [
    { name: "FEEDBACK_INBOX", class_name: "FeedbackInbox" },
    { name: "PADDLE_TEST_ORDERS", class_name: "PaddleTestOrders" },
    { name: "DOWNLOAD_STATS", class_name: "DownloadStats" },
  ] },
  migrations: [
    { tag: "feedback-v1", new_sqlite_classes: ["FeedbackInbox"] },
    { tag: "paddle-sandbox-v1", new_sqlite_classes: ["PaddleTestOrders"] },
    { tag: "download-stats-v1", new_sqlite_classes: ["DownloadStats"] },
  ],
  d1_databases: [
    ...(d1 ? [{
          binding: d1,
          database_name: "site-creator-d1",
          database_id: SITE_CREATOR_PLACEHOLDER_DATABASE_ID,
    }] : []),
  ],
  r2_buckets: r2
    ? [
        {
          binding: r2,
          bucket_name: "site-creator-r2",
        },
      ]
    : [],
};

export default defineConfig(async ({ command, mode }) => {
  const accountAnalyticsDatabaseId = process.env.B2A_ACCOUNT_ANALYTICS_DB_ID ??
    (command === "build" && mode === "production" ? PRODUCTION_ACCOUNT_ANALYTICS_DATABASE_ID : undefined);
  // Keep Wrangler and Miniflare state project-local. These are non-secret tool
  // settings; application environment belongs in ignored `.env*` files.
  process.env.WRANGLER_WRITE_LOGS ??= "false";
  process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
  process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";

  // Wrangler snapshots its log path while the Cloudflare plugin is imported.
  const { cloudflare } = await import("@cloudflare/vite-plugin");

  return {
    server: isCodexSeatbeltSandbox
      ? { watch: { useFsEvents: false, usePolling: true } }
      : undefined,
    plugins: [
      vinext(),
      sites(),
      cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        config: {
          ...localBindingConfig,
          d1_databases: [
            ...localBindingConfig.d1_databases,
            ...(accountAnalyticsDatabaseId ? [{
              binding: "ACCOUNT_ANALYTICS",
              database_name: "book2audiogo-accounts",
              database_id: accountAnalyticsDatabaseId,
            }] : []),
          ],
        },
      }),
    ],
  };
});
