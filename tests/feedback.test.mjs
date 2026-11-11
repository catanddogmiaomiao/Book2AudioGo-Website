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
  outboundService: async request => {
    assert.equal(new URL(request.url).origin, 'https://accounts.book2audiogo.com');
    assert.equal(request.headers.get('Authorization'), auth);
    if(request.method==='POST') {
      const body=await request.json(); assert.equal(body.action,'issue');
      assert.equal(body.reference,'book2AudioGoPERFORMANCE');
      assert.equal(body.days,7);
      return Response.json({message:'兑换码已生成',code:'B2A-TEST-ONLY-CODE'});
    }
    return Response.json({rows:[{id:'local',external_id:'<promo>',days:30,code_tail:'ABCD',code_revision:0,redeem_before:1800000000,
      paid_at:1790000000,redeemed_at:null,status:'issued',username:null}],has_next:false,page:1});
  },
  modulesRoot: serverRoot,
  modules: ["index.js", ...files].map(file => ({ type: "ESModule", path: resolve(serverRoot, file) })),
  compatibilityDate: "2026-05-15", compatibilityFlags: ["nodejs_compat"],
  cf: { country: "JP", region: "Tokyo" },
  assets: { directory: resolve("dist/client"), binding: "ASSETS", routerConfig: { has_user_worker: true, invoke_user_worker_ahead_of_assets: false } },
  durableObjects: { FEEDBACK_INBOX: { className: "FeedbackInbox", useSQLite: true },
    DOWNLOAD_STATS: { className: "DownloadStats", useSQLite: true } },
  durableObjectsPersist: storage,
  d1Databases: { ACCOUNT_ANALYTICS: "download-report-fixture" },
  bindings: { FEEDBACK_ADMIN_KEY_HASH: createHash("sha256").update("test-only-admin-key").digest("hex") },
};
let worker = new Miniflare(config);
const key = "test-only-admin-key";
const auth = "Basic " + Buffer.from("admin:" + key).toString("base64");
const url = "https://book2audiogo.com";
const payload = { id: crypto.randomUUID(), kind: "issue", message: "中文测试留言 <script>alert(1)</script>", email: "test@example.com", lang: "zh", page: "/", rating: 2, website: "" };
const post = (data, extraHeaders = {}) => worker.dispatchFetch(url + "/api/feedback", { method: "POST", headers: { "Content-Type": "application/json", Origin: url, "CF-Connecting-IP": "192.0.2.10", ...extraHeaders }, body: JSON.stringify(data) });
try {
  const metrics = await worker.getD1Database("ACCOUNT_ANALYTICS");
  await metrics.batch([
    metrics.prepare("CREATE TABLE product_events (event_name TEXT, installation_id TEXT, received_at INTEGER)"),
    metrics.prepare("CREATE TABLE purchase_completed (received_at INTEGER)"),
    metrics.prepare("CREATE TABLE users (id TEXT PRIMARY KEY, username TEXT, created INTEGER, email_verified_at INTEGER, registration_country TEXT, registration_region TEXT)"),
  ]);
  await metrics.batch([
    metrics.prepare(`INSERT INTO product_events VALUES
      ('app_open','install-a',unixepoch()),('conversion_completed','install-a',unixepoch()),
      ('conversion_failed','install-a',unixepoch()),('app_open','install-b',unixepoch()-172800)`),
    metrics.prepare("INSERT INTO purchase_completed VALUES(unixepoch())"),
    metrics.prepare(`INSERT INTO users VALUES
      ('new','<reader>',unixepoch(),unixepoch(),'JP','Tokyo'),
      ('old','legacy@example.test',unixepoch()-172800,NULL,NULL,NULL)`),
  ]);
  assert.equal((await worker.dispatchFetch(url+'/admin/codes')).status,401);
  const codesResponse=await worker.dispatchFetch(url+'/admin/codes',{headers:{Authorization:auth}});
  assert.equal(codesResponse.status,200);
  assert.equal(codesResponse.headers.get('Referrer-Policy'),'same-origin');
  assert.match(codesResponse.headers.get('Content-Security-Policy'), /form-action 'self'/);
  const codesHtml=await codesResponse.text();assert.match(codesHtml,/生成兑换码/);assert.match(codesHtml,/&lt;promo&gt;/);
  const codeForm={method:'POST',headers:{Authorization:auth,Origin:url,'Content-Type':'application/x-www-form-urlencoded'},
    body:'action=issue&reference=book2AudioGoPERFORMANCE&days=7&confirm=yes'};
  assert.equal((await worker.dispatchFetch(url+'/admin/codes',{...codeForm,headers:{...codeForm.headers,Origin:'https://evil.test'}})).status,403);
  const generated=await worker.dispatchFetch(url+'/admin/codes',codeForm);
  assert.equal(generated.status,200);assert.match(await generated.text(),/B2A-TEST-ONLY-CODE/);
  assert.equal((await worker.dispatchFetch(url+'/admin/codes',{...codeForm,body:'action=issue'})).status,400);
  assert.equal((await worker.dispatchFetch(url+'/admin/codes',{...codeForm,body:'x'.repeat(5000)})).status,400);
  const html = await (await worker.dispatchFetch(url + "/")).text();
  assert.match(html, /feedbackLauncher/);
  assert.match(html, /<dialog/);
  assert.equal((await worker.dispatchFetch(url + "/api/feedback")).status, 405);
  assert.equal((await worker.dispatchFetch(url + "/admin/feedback")).status, 401);
  assert.equal((await worker.dispatchFetch(url + "/api/admin/feedback")).status, 401);
  assert.equal((await worker.dispatchFetch(url + "/api/admin/feedback", { headers: { Authorization: "Basic " + Buffer.from("admin:wrong").toString("base64") } })).status, 401);
  const downloads = url + "/download/windows";
  const report = url + "/admin/downloads";
  assert.equal((await worker.dispatchFetch(report)).status, 401);
  assert.equal((await worker.dispatchFetch(report + "?users=1")).status, 401);
  assert.equal((await worker.dispatchFetch(downloads, { method: "POST", redirect: "manual" })).status, 405);
  for (const options of [{ method: "HEAD" }, { headers: { "Sec-Purpose": "prefetch" } }, {}, {}]) {
    options.headers = { ...options.headers, "CF-Connecting-IP": "192.0.2.33" };
    const response = await worker.dispatchFetch(downloads, { ...options, redirect: "manual" });
    assert.equal(response.status, 302);
    assert.equal(response.headers.get("Cache-Control"), "no-store");
    const target = new URL(response.headers.get("Location"));
    assert.equal(target.origin, "https://downloads.book2audiogo.com");
    assert.match(target.pathname, /\/Book2AudioGo-1\.2\.0-windows-x64-setup\.exe$/);
  }
  const downloadReport = async (days = 30, users = "") => {
    const response = await worker.dispatchFetch(report + "?days=" + days + users, { headers: { Authorization: auth } });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("Cache-Control"), "no-store");
    return response.text();
  };
  assert.equal((await worker.dispatchFetch(report + "?visitors=1")).status, 401);
  const visit = (path, ip, extra = {}) => worker.dispatchFetch(url + path, {
    headers: { Accept: "text/html", "User-Agent": "Mozilla/5.0", "CF-Connecting-IP": ip, ...extra },
  });
  await (await visit("/?lang=en", "192.0.2.40")).text();
  await (await visit("/updates?lang=zh", "192.0.2.40")).text();
  await (await visit("/epub-to-mp3", "192.0.2.41")).text();
  await (await visit("/", "192.0.2.42", { "Sec-Purpose": "prefetch" })).text();
  await (await visit("/", "192.0.2.43", { "User-Agent": "Googlebot" })).text();
  let visitorDetails;
  for (let i = 0; i < 20; i++) {
    visitorDetails = await downloadReport(7, "&visitors=1");
    if (/<td>\/<\/td><td>2<\/td>/.test(visitorDetails) && visitorDetails.includes("<td>/epub-to-mp3</td>")) break;
    await new Promise(resolve => setTimeout(resolve, 25));
  }
  assert.match(visitorDetails, /visitors=1#website-visitors"[^>]*>2<\/a>/);
  assert.match(visitorDetails, /<td>\/<\/td><td>2<\/td>/);
  assert.match(visitorDetails, /<td>\/epub-to-mp3<\/td><td>1<\/td>/);
  assert.doesNotMatch(visitorDetails, /192\.0\.2\.4[0-3]/);
  for (let i = 0; i < 20; i++) {
    if ((await downloadReport()).includes("累计 <strong>2</strong>")) break;
    await new Promise(resolve => setTimeout(resolve, 25));
  }
  assert.match(await downloadReport(), /今天 <strong>2<\/strong> 次 · 累计 <strong>2<\/strong>/);
  assert.match(await downloadReport(), /已记录来源 2 次。去重 IP 为各日去重后相加，共 1/);
  assert.doesNotMatch(await downloadReport(), /192\.0\.2\.33/);
  assert.match(await downloadReport(), /<td>日本<\/td>\s*<td>Tokyo<\/td><td>2<\/td><td>1<\/td>/);
  assert.match(await downloadReport(1), /活跃安装<\/dt><dd>1/);
  assert.match(await downloadReport(7), /活跃安装<\/dt><dd>2/);
  assert.match(await downloadReport(), /失败率<\/dt><dd>50\.0%/);
  assert.match(await downloadReport(), /正式付款订单<\/dt><dd>1/);
  assert.match(await downloadReport(1), /当前注册总数<\/dt><dd><a href="\?days=1&amp;users=1#registered-users"[^>]*>2<\/a>/);
  assert.match(await downloadReport(1), /所选周期新增<\/dt><dd>1/);
  assert.match(await downloadReport(7), /所选周期新增<\/dt><dd>2/);
  assert.match(await downloadReport(), /<td>未知<\/td>\s*<td>—<\/td><td>1<\/td>/);
  assert.doesNotMatch(await downloadReport(), /注册用户名|&lt;reader&gt;/);
  const userDetails = await downloadReport(1, "&users=1");
  assert.match(userDetails, /<li>&lt;reader&gt;<\/li>\s*<li>l\*\*\*（旧邮箱账号）<\/li>/);
  assert.doesNotMatch(userDetails, /legacy@example\.test|<reader>/);
  await metrics.prepare(`WITH RECURSIVE n(i) AS (VALUES(1) UNION ALL SELECT i+1 FROM n WHERE i<25)
    INSERT INTO users SELECT 'extra-'||i,'reader-'||i,unixepoch()-259200-i,NULL,NULL,NULL FROM n`).run();
  assert.match(await downloadReport(1, "&users=1"), /users=2#registered-users">下一页/);
  const nextUserPage = await downloadReport(1, "&users=2");
  assert.match(nextUserPage, /<li>reader-24<\/li><li>reader-25<\/li>/);
  assert.match(nextUserPage, /users=1#registered-users">上一页/);
  assert.doesNotMatch(nextUserPage, /&lt;reader&gt;|下一页/);
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
  assert.match(await downloadReport(), /累计 <strong>2<\/strong>/);
  data = await list();
  assert.equal(data.rows.length, 1);
  assert.equal(data.rows[0].status, "resolved");
  for (const [index, lang] of ["fr", "es"].entries()) {
    assert.equal((await post({ ...payload, id: crypto.randomUUID(), lang }, { "CF-Connecting-IP": `192.0.2.${20 + index}` })).status, 201);
  }
  assert.deepEqual((await list()).rows.map(row => row.lang).sort(), ["es", "fr", "zh"]);
  console.log("Feedback checks passed: validation, origin checks, private inbox, durable storage, idempotency, rate limits and state updates.");
} finally { await worker.dispose(); await rm(storage, { recursive: true, force: true, maxRetries: 5 }); }
