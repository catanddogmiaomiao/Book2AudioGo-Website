import { DurableObject } from "cloudflare:workers";
import { ADMIN_KEY_HASH } from "./feedback-config";

interface InboxBinding { idFromName(name: string): unknown; get(id: unknown): { fetch(request: Request): Promise<Response> } }
export interface FeedbackEnv { FEEDBACK_INBOX?: InboxBinding; FEEDBACK_ADMIN_KEY_HASH?: string }
const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
const json = (value: unknown, status = 200) => Response.json(value, { status, headers });
const sha = async (text: string) => Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text))), b => b.toString(16).padStart(2, "0")).join("");

async function boundedJson(request: Request) {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) throw new Error("content_type");
  const reader = request.body?.getReader();
  if (!reader) throw new Error("invalid");
  let text = "", size = 0;
  const decoder = new TextDecoder();
  while (true) {
    const part = await reader.read();
    if (part.done) break;
    size += part.value.byteLength;
    if (size > 16000) { await reader.cancel(); throw new Error("too_large"); }
    text += decoder.decode(part.value, { stream: true });
  }
  const value = JSON.parse(text + decoder.decode());
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("invalid");
  return value;
}

export async function feedbackRoute(request: Request, env: FeedbackEnv): Promise<Response | null> {
  const url = new URL(request.url);
  const admin = url.pathname === "/admin/feedback" || url.pathname === "/api/admin/feedback";
  if (!admin && url.pathname !== "/api/feedback") return null;
  if (admin) {
    let key = "";
    try {
      const authorization = request.headers.get("authorization") ?? "";
      if (authorization.startsWith("Basic ")) {
        const credentials = atob(authorization.slice(6));
        if (credentials.startsWith("admin:")) key = credentials.slice(6);
      }
    } catch { /* Invalid credentials fail closed. */ }
    if (!key || await sha(key) !== (env.FEEDBACK_ADMIN_KEY_HASH ?? ADMIN_KEY_HASH)) return new Response("Administrator sign-in required", { status: 401, headers: { ...headers, "WWW-Authenticate": 'Basic realm="Book2Audio GO feedback", charset="UTF-8"', "X-Robots-Tag": "noindex, nofollow" } });
    if (url.pathname === "/admin/feedback") {
      if (request.method !== "GET") return json({ error: "method" }, 405);
      return new Response(adminHtml, { headers: { ...headers, "Content-Type": "text/html; charset=utf-8", "X-Robots-Tag": "noindex, nofollow", "Content-Security-Policy": "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'" } });
    }
  }
  if (request.method !== (admin ? "GET" : "POST") && !(admin && request.method === "PATCH")) return json({ error: "method" }, 405);
  if (request.method !== "GET") {
    if (request.headers.get("origin") !== url.origin) return json({ error: "origin" }, 403);
    let value;
    try { value = await boundedJson(request); } catch (error) { return json({ error: error instanceof Error ? error.message : "invalid" }, 400); }
    if (admin) {
      if (!/^[a-f0-9-]{36}$/.test(value.id ?? "") || !["new", "read", "resolved"].includes(value.status)) return json({ error: "invalid" }, 400);
    } else {
      if (value.website) return json({ error: "invalid" }, 400);
      if (typeof value.message !== "string" || value.message.trim().length < 5 || value.message.trim().length > 3000 ||
          !["issue", "idea", "other"].includes(value.kind) || !["zh", "en", "ja", "ko"].includes(value.lang) ||
          typeof value.email !== "string" || value.email.length > 254 || (value.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email)) ||
          typeof value.page !== "string" || !value.page.startsWith("/") || value.page.length > 200 ||
          !/^[a-f0-9-]{36}$/.test(value.id ?? "") ||
          (value.rating !== null && ![1, 2, 3].includes(value.rating))) return json({ error: "invalid" }, 400);
      value.message = value.message.trim();
      value.email = value.email.trim();
      // Only a rotating digest is stored for abuse controls; never store the visitor's IP.
      value.client = await sha((request.headers.get("CF-Connecting-IP") ?? "local") + ":" + new Date().toISOString().slice(0, 10));
    }
    request = new Request(request.url, { method: request.method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(value) });
  }
  if (!env.FEEDBACK_INBOX) return json({ error: "unavailable" }, 503);
  try { return await env.FEEDBACK_INBOX.get(env.FEEDBACK_INBOX.idFromName("inbox-v1")).fetch(request); }
  catch { return json({ error: "unavailable" }, 503); }
}

export class FeedbackInbox extends DurableObject {
  constructor(ctx: DurableObjectState, env: unknown) {
    super(ctx, env);
    ctx.storage.sql.exec(`CREATE TABLE IF NOT EXISTS feedback (id TEXT PRIMARY KEY, kind TEXT NOT NULL, message TEXT NOT NULL, email TEXT NOT NULL, lang TEXT NOT NULL, page TEXT NOT NULL, rating INTEGER, created TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'new');
      CREATE TABLE IF NOT EXISTS limits (client TEXT PRIMARY KEY, last INTEGER NOT NULL, count INTEGER NOT NULL);`);
  }
  async fetch(request: Request) {
    const sql = this.ctx.storage.sql;
    if (request.method === "POST") {
      const data = await request.json() as Record<string, any>;
      const existing = sql.exec("SELECT id FROM feedback WHERE id = ?", data.id).toArray();
      if (existing.length) return json({ ok: true, id: data.id });
      const now = Date.now();
      const limit = sql.exec("SELECT last, count FROM limits WHERE client = ?", data.client).toArray()[0];
      if (limit && (now - Number(limit.last) < 60000 || Number(limit.count) >= 5)) return new Response(JSON.stringify({ error: "rate_limited" }), { status: 429, headers: { ...headers, "Content-Type": "application/json", "Retry-After": "60" } });
      this.ctx.storage.transactionSync(() => {
        sql.exec("DELETE FROM limits WHERE last < ?", now - 172800000);
        sql.exec("INSERT INTO limits (client,last,count) VALUES (?,?,1) ON CONFLICT(client) DO UPDATE SET last=excluded.last,count=count+1", data.client, now);
        sql.exec("INSERT INTO feedback (id,kind,message,email,lang,page,rating,created) VALUES (?,?,?,?,?,?,?,?)", data.id, data.kind, data.message, data.email, data.lang, data.page, data.rating, new Date(now).toISOString());
      });
      return json({ ok: true, id: data.id }, 201);
    }
    if (request.method === "PATCH") {
      const data = await request.json() as { id: string; status: string };
      sql.exec("UPDATE feedback SET status = ? WHERE id = ?", data.status, data.id);
      return json({ ok: true });
    }
    const url = new URL(request.url);
    const offset = Math.max(0, Math.min(100000, Number(url.searchParams.get("offset")) || 0));
    const status = url.searchParams.get("status");
    const filter = ["new", "read", "resolved"].includes(status ?? "") ? status : null;
    const rows = filter ? sql.exec("SELECT * FROM feedback WHERE status = ? ORDER BY created DESC,id DESC LIMIT 51 OFFSET ?", filter, offset).toArray() : sql.exec("SELECT * FROM feedback ORDER BY created DESC,id DESC LIMIT 51 OFFSET ?", offset).toArray();
    return json({ rows: rows.slice(0, 50), more: rows.length > 50, offset });
  }
}

const adminHtml = `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>客户反馈 · Book2Audio GO</title><style>
body{font:16px/1.6 system-ui;margin:0;background:#f6f1e7;color:#152f3a}main{max-width:960px;margin:40px auto;padding:24px}header{display:flex;gap:16px;align-items:center;flex-wrap:wrap}h1{margin-right:auto}button,select{font:inherit;padding:8px 14px;border:1px solid #a7b9b5;border-radius:6px;background:white;cursor:pointer}button:disabled{opacity:.5}article{background:white;padding:24px;margin:18px 0;border-radius:12px;border:1px solid #dce6e2}p.message{white-space:pre-wrap;overflow-wrap:anywhere}small{color:#52696d}#notice{min-height:26px}a{color:#064f55}footer{display:flex;gap:16px}label{display:inline-flex;align-items:center;gap:8px}.email{overflow-wrap:anywhere}
</style><main><header><h1>客户留言与反馈</h1><a href="/">返回官网</a></header><p>仅管理员可见。邮箱留空的留言无需回复；处理后可标记状态。</p><label>状态 <select id="filter"><option value="">全部</option><option value="new">新留言</option><option value="read">已查看</option><option value="resolved">已处理</option></select></label> <button id="refresh">刷新</button><p id="notice" role="status"></p><section id="items"></section><footer><button id="prev">上一页</button><button id="next">下一页</button></footer></main><script>
let offset=0;const $=id=>document.getElementById(id);const labels={issue:'遇到问题',idea:'功能建议',other:'其他留言',new:'新留言',read:'已查看',resolved:'已处理'};
async function load(){ $('notice').textContent='正在加载…';try{const r=await fetch('/api/admin/feedback?offset='+offset+'&status='+$('filter').value);if(!r.ok)throw Error();const data=await r.json();$('items').replaceChildren();for(const row of data.rows){const card=document.createElement('article');const meta=document.createElement('small');meta.textContent=(labels[row.kind]||row.kind)+' · '+new Date(row.created).toLocaleString()+' · '+row.lang+(row.rating?' · 体验 '+row.rating+'/3':'');const message=document.createElement('p');message.className='message';message.textContent=row.message;const email=document.createElement('p');email.className='email';email.textContent='联系邮箱：'+(row.email||'未填写');const status=document.createElement('select');status.setAttribute('aria-label','留言状态');for(const value of ['new','read','resolved']){const o=document.createElement('option');o.value=value;o.textContent=labels[value];o.selected=value===row.status;status.append(o)}status.onchange=async()=>{status.disabled=true;try{const result=await fetch('/api/admin/feedback',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:row.id,status:status.value})});if(!result.ok)throw Error();$('notice').textContent='状态已保存';await load()}catch{status.value=row.status;$('notice').textContent='保存失败，请重试'}finally{status.disabled=false}};card.append(meta,message,email,status);$('items').append(card)}$('prev').disabled=offset===0;$('next').disabled=!data.more;$('notice').textContent=data.rows.length?'本页 '+data.rows.length+' 条留言':'暂无留言';}catch{$('notice').textContent='加载失败，请刷新重试'}}
$('filter').onchange=()=>{offset=0;load()};$('refresh').onclick=load;$('prev').onclick=()=>{offset=Math.max(0,offset-50);load()};$('next').onclick=()=>{offset+=50;load()};load();
</script></html>`;
