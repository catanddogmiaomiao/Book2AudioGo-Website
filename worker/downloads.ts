import { DurableObject } from "cloudflare:workers";
import { hasAdminAccess } from "./admin-auth";
import { productMetrics, registrationMetrics } from "./product-metrics";

const VERSION = "1.2.0";
const FILE_URL = "https://pub-f257fbbebf604ed69c35001d3c3ea070.r2.dev/releases/2026-11-10/Book2AudioGo-1.2.0-windows-x64-setup.exe";
const NO_STORE = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" };
const DAY = 86400000;
const UTC_OFFSET = 8 * 3600000;
const beijingDay = (time = Date.now()) => new Date(time + UTC_OFFSET).toISOString().slice(0, 10);
const countryNames = new Intl.DisplayNames(["zh-CN"], { type: "region" });
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, c =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);

export interface DownloadEnv {
  DOWNLOAD_STATS?: DurableObjectNamespace<DownloadStats>;
  FEEDBACK_ADMIN_KEY_HASH?: string;
  ACCOUNT_ANALYTICS?: D1Database;
}

export async function downloadRoute(request: Request, env: DownloadEnv, ctx: { waitUntil(promise: Promise<unknown>): void }) {
  const { pathname, searchParams } = new URL(request.url);
  if (pathname !== "/download/windows" && pathname !== "/admin/downloads") return null;
  if (pathname === "/download/windows") {
    if (request.method !== "GET" && request.method !== "HEAD")
      return new Response(null, { status: 405, headers: { ...NO_STORE, Allow: "GET, HEAD" } });
    const purpose = [request.headers.get("Sec-Purpose"), request.headers.get("Purpose")].join(" ");
    if (request.method === "GET" && !/prefetch|prerender/i.test(purpose) && env.DOWNLOAD_STATS) {
      const country = request.cf?.country;
      const region = request.cf?.region;
      const ip = request.headers.get("CF-Connecting-IPv6") ?? request.headers.get("CF-Connecting-IP");
      ctx.waitUntil(env.DOWNLOAD_STATS.getByName("windows").record(
        VERSION,
        typeof country === "string" && /^[A-Z]{2}$/.test(country) && country !== "XX" ? country : "",
        typeof region === "string" ? region.trim().slice(0, 80) : "",
        ip && /^[0-9a-f:.]{3,45}$/i.test(ip) ? ip.toLowerCase() : "",
      ).catch(() => {
        console.warn("download_count_write_failed");
      }));
    }
    return new Response(null, { status: 302, headers: { ...NO_STORE, Location: FILE_URL } });
  }
  if (!await hasAdminAccess(request, env.FEEDBACK_ADMIN_KEY_HASH))
    return new Response("Administrator sign-in required", {
      status: 401, headers: { ...NO_STORE, "WWW-Authenticate": 'Basic realm="Book2Audio GO feedback", charset="UTF-8"' },
    });
  if (request.method !== "GET") return new Response(null, { status: 405, headers: { ...NO_STORE, Allow: "GET" } });
  if (!env.DOWNLOAD_STATS) return new Response("Download statistics unavailable", { status: 503, headers: NO_STORE });
  try {
    const selected = Number(searchParams.get("days"));
    const range = [1, 7, 30].includes(selected) ? selected : 30;
    const { today, totals, days, regions, tracked } = await env.DOWNLOAD_STATS.getByName("windows").report(range, VERSION);
    const db = env.ACCOUNT_ANALYTICS;
    const [metrics, registrations] = await Promise.all([
      db ? productMetrics(db, today, range).catch(() => null) : null,
      db ? registrationMetrics(db, today, range).catch(() => null) : null,
    ]);
    const current = totals.find(row => row.version === VERSION);
    const rows = days.map(row => `<tr><td>${row.day}</td><td>${row.version}</td><td>${row.count}</td><td>${row.unique_ips ?? "—"}</td></tr>`).join("");
    const geoRows = regions.map(row => `<tr><td>${escapeHtml(row.country ? countryNames.of(row.country) ?? row.country : "未知")}</td>
<td>${escapeHtml(row.region || "—")}</td><td>${row.count}</td><td>${row.unique_ips}</td></tr>`).join("");
    const registrationRows = registrations?.regions.map(row =>
      `<tr><td>${escapeHtml(row.country ? countryNames.of(row.country) ?? row.country : "未知")}</td>
<td>${escapeHtml(row.region || "—")}</td><td>${row.count}</td></tr>`).join("");
    const rangeNav = [1, 7, 30].map(n => `<a href="?days=${n}"${range === n ? ' aria-current="page"' : ''}>${n === 1 ? "今天" : "最近 " + n + " 天"}</a>`).join("");
    const cards = (labels: [string, string][]) => labels.map(([label, key]) =>
      `<div><dt>${label}</dt><dd>${metrics?.[key] ?? 0}</dd></div>`).join("");
    const failureRate = metrics && metrics.succeeded + metrics.failed
      ? (100 * metrics.failed / (metrics.succeeded + metrics.failed)).toFixed(1) + "%" : "—";
    return new Response(`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Book2Audio GO 下载统计</title>
<style>body{margin:0;background:#f4f0e6;color:#152f3a;font:16px system-ui,sans-serif}main{max-width:900px;margin:32px auto;padding:0 20px}section{background:#fffdf8;border:1px solid #ddd9ce;border-radius:16px;padding:20px;margin:16px 0;overflow:auto}table{width:100%;border-collapse:collapse;text-align:left}th,td{padding:10px 6px;border-bottom:1px solid #e6e0d5}a{color:#064f55}nav{display:flex;gap:16px;flex-wrap:wrap}nav a[aria-current]{font-weight:700}dl{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px}dd{margin:4px 0 0;font-weight:700;font-size:1.25rem}</style>
<main><h1>Windows 下载统计</h1><p>版本 ${VERSION} · 北京时间 ${today}</p>
<nav aria-label="统计周期">${rangeNav}</nav>
${registrations ? `<section><h2>注册用户</h2>
<dl><div><dt>当前注册总数</dt><dd>${registrations.totals.total}</dd></div>
<div><dt>已验证邮箱</dt><dd>${registrations.totals.verified}</dd></div>
<div><dt>所选周期新增</dt><dd>${registrations.totals.added}</dd></div></dl>
<h3>全部账号的注册来源</h3><p>地区取自注册时的网络出口。历史未记录或无法识别的来源显示为未知。</p>
<table><thead><tr><th scope="col">国家或地区</th><th scope="col">省州</th><th scope="col">账号数</th></tr></thead>
<tbody>${registrationRows || '<tr><td colspan="3">暂无注册记录</td></tr>'}</tbody></table></section>` :
'<section><h2>注册用户</h2><p>注册统计暂不可用，请稍后刷新。</p></section>'}
<section><h2>当前版本</h2><p>今天 <strong>${current?.today ?? 0}</strong> 次 · 累计 <strong>${current?.total ?? 0}</strong> 次</p>
<p>统计官网统一入口发起的下载。重复点击会分别计数。</p></section>
<section><h2>下载明细</h2><table><thead><tr><th scope="col">日期</th><th scope="col">版本</th><th scope="col">次数</th><th scope="col">去重 IP</th></tr></thead>
<tbody>${rows || '<tr><td colspan="4">暂无下载记录</td></tr>'}</tbody></table></section>
<section><h2>下载来源 · 当前版本</h2><p>选定周期内，已记录来源 ${tracked.count} 次。去重 IP 为各日去重后相加，共 ${tracked.unique_ips}。共享网络和代理可能影响结果。</p>
<p>地区由 Cloudflare 根据请求来源判断。来源统计上线前的下载仍计入总数。</p>
<table><thead><tr><th scope="col">国家或地区</th><th scope="col">省州</th><th scope="col">次数</th><th scope="col">去重 IP</th></tr></thead>
<tbody>${geoRows || '<tr><td colspan="4">暂无来源记录</td></tr>'}</tbody></table></section>
${metrics ? `<section><h2>桌面使用</h2><dl>${cards([["首次观测到的安装","installs"],["活跃安装","active"],["成功导入的安装","imported"],["完成转换的安装","converted"]])}</dl><p>按所选周期去重，仅统计已同意上报的安装。</p></section>
<section><h2>转换质量</h2><dl>${cards([["开始次数","started"],["成功次数","succeeded"],["失败次数","failed"]])}<div><dt>失败率</dt><dd>${failureRate}</dd></div></dl><p>失败率按有最终结果的转换计算。</p></section>
<section><h2>付费与激活</h2><dl>${cards([["点击批量转换的安装","batch"],["打开购买页的安装","checkout"],["正式付款订单","paid"],["激活授权的安装","activated"]])}</dl><p>付款按正式 Paddle 订单计数。订单与安装没有逐用户关联。</p></section>` : '<section><h2>桌面使用与付费</h2><p>数据暂不可用，请稍后刷新。</p></section>'}</main></html>`, {
      headers: { ...NO_STORE, "Content-Type": "text/html; charset=utf-8", "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'; base-uri 'none'" },
    });
  } catch {
    return new Response("Download statistics unavailable", { status: 503, headers: NO_STORE });
  }
}

export class DownloadStats extends DurableObject<DownloadEnv> {
  private cleanupAt = 0;

  constructor(ctx: DurableObjectState, env: DownloadEnv) {
    super(ctx, env);
    ctx.storage.sql.exec(`CREATE TABLE IF NOT EXISTS downloads (day TEXT NOT NULL, version TEXT NOT NULL, count INTEGER NOT NULL, PRIMARY KEY(day, version));
      CREATE TABLE IF NOT EXISTS download_regions (
        day TEXT NOT NULL, version TEXT NOT NULL, country TEXT NOT NULL, region TEXT NOT NULL,
        count INTEGER NOT NULL, unique_ips INTEGER NOT NULL, PRIMARY KEY(day, version, country, region)
      );
      CREATE TABLE IF NOT EXISTS download_ip_keys (day TEXT PRIMARY KEY, secret TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS download_ips (
        day TEXT NOT NULL, version TEXT NOT NULL, digest TEXT NOT NULL, PRIMARY KEY(day, version, digest)
      );`);
  }

  async record(version: string, country: string, region: string, ip: string) {
    if (!/^\d{1,4}\.\d{1,4}\.\d{1,4}$/.test(version)) throw new Error("Invalid release version");
    const now = Date.now();
    const day = beijingDay(now);
    const sql = this.ctx.storage.sql;
    const digest = ip ? await this.dailyIpDigest(ip, day, now).catch(() => "") : "";
    this.ctx.storage.transactionSync(() => {
      const unique = digest && day === beijingDay() && sql.exec(
        "INSERT OR IGNORE INTO download_ips VALUES (?, ?, ?) RETURNING digest", day, version, digest,
      ).toArray().length ? 1 : 0;
      sql.exec("INSERT INTO downloads VALUES (?, ?, 1) ON CONFLICT(day, version) DO UPDATE SET count = count + 1", day, version);
      sql.exec(`INSERT INTO download_regions VALUES (?, ?, ?, ?, 1, ?)
        ON CONFLICT(day, version, country, region) DO UPDATE SET count = count + 1, unique_ips = unique_ips + excluded.unique_ips`,
        day, version, country, region, unique);
    });
  }

  private async dailyIpDigest(ip: string, day: string, now: number) {
    const nextCleanup = Math.floor((now + UTC_OFFSET) / DAY) * DAY + DAY - UTC_OFFSET;
    if (nextCleanup !== this.cleanupAt) {
      await this.ctx.storage.setAlarm(nextCleanup);
      this.cleanupAt = nextCleanup;
    }
    if (day !== beijingDay()) return "";
    const sql = this.ctx.storage.sql;
    sql.exec("INSERT OR IGNORE INTO download_ip_keys VALUES (?, lower(hex(randomblob(32))))", day);
    const { secret } = sql.exec<{ secret: string }>("SELECT secret FROM download_ip_keys WHERE day = ?", day).one();
    const encode = new TextEncoder();
    const key = await crypto.subtle.importKey("raw", encode.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const bytes = await crypto.subtle.sign("HMAC", key, encode.encode(ip));
    return Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, "0")).join("");
  }

  alarm() {
    const sql = this.ctx.storage.sql;
    const today = beijingDay();
    sql.exec("DELETE FROM download_ips WHERE day < ?", today);
    sql.exec("DELETE FROM download_ip_keys WHERE day < ?", today);
  }

  report(range: number, version: string) {
    const sql = this.ctx.storage.sql;
    const today = beijingDay();
    const since = beijingDay(Date.now() - (range - 1) * DAY);
    const totals = sql.exec<{ version: string; today: number; total: number }>(
      "SELECT version, SUM(CASE WHEN day = ? THEN count ELSE 0 END) AS today, SUM(count) AS total FROM downloads GROUP BY version",
      today,
    ).toArray();
    const days = sql.exec<{ day: string; version: string; count: number; unique_ips: number | null }>(
      `SELECT d.day, d.version, d.count, SUM(r.unique_ips) AS unique_ips
      FROM downloads d LEFT JOIN download_regions r ON r.day=d.day AND r.version=d.version
      WHERE d.day >= ? GROUP BY d.day, d.version ORDER BY d.day DESC, d.version DESC`, since,
    ).toArray();
    const regions = sql.exec<{ country: string; region: string; count: number; unique_ips: number }>(
      `SELECT country, region, SUM(count) AS count, SUM(unique_ips) AS unique_ips FROM download_regions
      WHERE day >= ? AND version = ? GROUP BY country, region ORDER BY count DESC, country, region LIMIT 100`, since, version,
    ).toArray();
    const tracked = sql.exec<{ count: number; unique_ips: number }>(
      "SELECT COALESCE(SUM(count),0) AS count, COALESCE(SUM(unique_ips),0) AS unique_ips FROM download_regions WHERE day >= ? AND version = ?",
      since, version,
    ).one();
    return { today, totals, days, regions, tracked };
  }
}
