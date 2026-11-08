import { existsSync, mkdirSync, copyFileSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";
import { spawnSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const [major, minor] = process.versions.node.split(".").map(Number);
if (major < 22 || (major === 22 && minor < 13)) {
  const bundled = join(homedir(), ".cache", "codex-runtimes", "codex-primary-runtime", "dependencies", "node", "bin", process.platform === "win32" ? "node.exe" : "node");
  if (!existsSync(bundled) || resolve(bundled) === resolve(process.execPath)) {
    console.error("Node.js >=22.13 is required. Install Node.js 24 LTS and retry.");
    process.exit(1);
  }
  const result = spawnSync(bundled, [fileURLToPath(import.meta.url), ...process.argv.slice(2)], { cwd: root, stdio: "inherit", env: { ...process.env, PATH: dirname(bundled) + (process.platform === "win32" ? ";" : ":") + process.env.PATH } });
  if (result.error) console.error(result.error.message);
  process.exit(result.status ?? 1);
}
process.chdir(root);
const temporary = resolve(root, ".local/tmp");
mkdirSync(temporary, { recursive: true });
const env = { ...process.env, TEMP: temporary, TMP: temporary, TMPDIR: temporary,
  WRANGLER_WRITE_LOGS: "false", WRANGLER_SEND_METRICS: "false",
  WRANGLER_LOG_PATH: resolve(root, ".wrangler/logs"),
  MINIFLARE_REGISTRY_PATH: resolve(root, ".wrangler/registry"),
  npm_config_cache: resolve(root, ".local/npm-cache") };
function run(args) {
  const result = spawnSync(process.execPath, args, { cwd: root, env, stdio: "inherit" });
  if (result.error) console.error(result.error.message);
  if (result.status !== 0) process.exit(result.status ?? 1);
}
const vinext = "node_modules/vinext/dist/cli.js";
const command = process.argv[2];
if (!existsSync(vinext)) { console.error("Dependencies missing. Run npm ci --cache .local/npm-cache using Node.js >=22.13."); process.exit(1); }
function checkTypes() {
  if (!existsSync("dist/server/wrangler.json")) run([vinext, "build"]);
  run(["node_modules/wrangler/bin/wrangler.js", "types", "worker-configuration.d.ts",
    "--config", "dist/server/wrangler.json", "--include-runtime"]);
  run(["node_modules/typescript/bin/tsc", "--noEmit", "--incremental", "false"]);
}
if (command === "dev" || command === "start") {
  if (!existsSync(".env")) copyFileSync(".env.example", ".env");
  console.log("Sandbox page: http://127.0.0.1:3000/sandbox/purchase");
  run([vinext, command, "--hostname", "127.0.0.1", "--port", "3000"]);
} else if (command === "build") run([vinext, "build"]);
else if (command === "typecheck") checkTypes();
else if (command === "paddle-test") run(["tests/paddle.test.mjs"]);
else if (command === "webhook-gateway") run(["scripts/webhook-gateway.mjs"]);
else if (command === "webhook-account-sandbox") run(["scripts/webhook-gateway.mjs", "--account-sandbox"]);
else if (command === "gateway-test") run(["tests/webhook-gateway.test.mjs"]);
else if (command === "verify") {
  run([vinext, "build"]);
  checkTypes();
  for (const test of ["seo", "feedback", "paddle", "webhook-gateway", "account"]) run([`tests/${test}.test.mjs`]);
} else { console.error("Expected dev, start, build, typecheck, paddle-test, webhook-gateway, gateway-test or verify."); process.exit(1); }
