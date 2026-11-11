import { hasAdminAccess } from './admin-auth';
import type { DownloadEnv } from './downloads';

const escape = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const date = (value: number | null) => value ? new Date((value + 28800) * 1000).toISOString().slice(0,16).replace('T',' ') : '—';
const statuses: Record<string,string> = {issued:'待兑换',redeemed:'已兑换',cancelled:'已作废',expired:'已过期',refunded:'已退款'};
type CodeRow = {id:string;external_id:string;days:number;code_tail:string;code_revision:number;redeem_before:number;paid_at:number;redeemed_at:number|null;status:string;username:string|null};

export async function adminCodesRoute(request: Request, env: DownloadEnv) {
  const url = new URL(request.url);
  if (url.pathname !== '/admin/codes') return null;
  const headers = {'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow','X-Content-Type-Options':'nosniff',
    // HTML form POSTs need the browser to preserve their same-origin Origin header.
    'Referrer-Policy':'same-origin','Content-Type':'text/html; charset=utf-8',
    'Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'"};
  if (!await hasAdminAccess(request,env.FEEDBACK_ADMIN_KEY_HASH))
    return new Response('需要管理员登录',{status:401,headers:{...headers,'WWW-Authenticate':'Basic realm="Book2Audio GO feedback", charset="UTF-8"'}});
  if (!['GET','POST'].includes(request.method)) return new Response('Method not allowed',{status:405,headers});
  const upstream = new URL('https://accounts.book2audiogo.com/v1/admin/codes');
  for (const key of ['q','state','page']) if(url.searchParams.has(key)) upstream.searchParams.set(key,url.searchParams.get(key)!);
  const call = async (body?: object) => {
    const response = await fetch(upstream,{method:body?'POST':'GET',redirect:'manual',signal:AbortSignal.timeout(10000),
      headers:{Authorization:request.headers.get('Authorization')!,'Content-Type':'application/json'},
      ...(body?{body:JSON.stringify(body)}:{})});
    const data = await response.json() as {detail?:string;message?:string;code?:string;rows?:CodeRow[];has_next?:boolean;page?:number};
    if(!response.ok) throw new Error(data.detail ?? '兑换码服务暂不可用');
    return data;
  };
  let message='',code='',status=200;
  if(request.method==='POST') {
    if(request.headers.get('Origin')!==url.origin) return new Response('请求来源无效',{status:403,headers});
    try {
      if(!request.headers.get('Content-Type')?.startsWith('application/x-www-form-urlencoded')) throw new Error('表单格式无效');
      const reader=request.body?.getReader(); let size=0,raw=''; const decoder=new TextDecoder();
      if(reader) while(true) { const part=await reader.read(); if(part.done)break; size+=part.value.length;
        if(size>4096){await reader.cancel();throw new Error('表单过大');} raw+=decoder.decode(part.value,{stream:true}); }
      raw+=decoder.decode(); const form=new URLSearchParams(raw);
      if(form.get('confirm')!=='yes') throw new Error('请先勾选操作确认');
      const result=await call({action:form.get('action'),reference:form.get('reference')||'admin',
        days:Number(form.get('days')||30),reason:form.get('reason')||'管理员生成',id:form.get('id')||'',revision:Number(form.get('revision')||0)});
      message=result.message??'操作完成';code=result.code??'';
    } catch(error) {message=error instanceof Error?error.message:'操作暂不可用';status=400;}
  }
  let report: Awaited<ReturnType<typeof call>> | null = null;
  try {report=await call();} catch {message ||= '兑换码列表暂不可用，请稍后刷新';status=503;}
  const hidden = (name:string,value:string) => `<input type="hidden" name="${name}" value="${escape(value)}">`;
  const rows=report?.rows?.map(row=>`<tr><td>${escape(row.external_id)}<small>尾号 ${escape(row.code_tail)}</small></td>
<td>${row.days} 天</td><td>${statuses[row.status]??'未知'}</td><td>${escape(row.username)||'—'}<small>${date(row.redeemed_at)}</small></td>
<td>${date(row.redeem_before)}</td><td>${row.status==='issued'?`<details><summary>管理</summary><form method="post">
${hidden('id',row.id)}${hidden('revision',String(row.code_revision))}<label>原因<input name="reason" maxlength="200" required></label>
<label><input type="checkbox" name="confirm" value="yes" required>确认使旧码失效</label>
<button name="action" value="reissue">补发新码</button><button class="outline" name="action" value="cancel">作废</button></form></details>`:'—'}</td></tr>`).join('')??'';
  const page=report?.page??1;
  const pageLink=(n:number)=>{const link=new URL(url);link.searchParams.set('page',String(n));return escape(link.pathname+link.search);};
  return new Response(`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>兑换码管理 · Book2Audio GO</title>
<style>body{margin:0;background:#f4f0e6;color:#152f3a;font:16px system-ui,sans-serif}main{max-width:1100px;margin:32px auto;padding:0 20px}section{background:#fffdf8;border:1px solid #ddd9ce;border-radius:16px;padding:24px;margin:20px 0;overflow:auto}a{color:#064f55}nav,.fields{display:flex;gap:16px;flex-wrap:wrap;align-items:end}label{display:block;margin:12px 0}input,select,button{font:inherit;padding:10px;border:1px solid #c7d5cf;border-radius:10px;max-width:100%;box-sizing:border-box}button{background:#ff5b35;color:white;cursor:pointer;border-color:#ff5b35}.outline{background:transparent;color:#064f55;border-color:#93bdb3}button:hover{background:#d5ff62;color:#111;border-color:#d5ff62}input[type=checkbox]{accent-color:#ff5b35}table{width:100%;border-collapse:collapse;text-align:left}th,td{padding:14px 8px;border-bottom:1px solid #e6e0d5;vertical-align:top}small{display:block;color:#657d85;margin-top:8px}summary{cursor:pointer;color:#064f55}code{display:block;font-size:1.15rem;overflow-wrap:anywhere;padding:16px;background:#e0f6eb;border-radius:10px}p{line-height:1.7}</style>
<main><nav><a href="/admin/downloads">统计总览</a><a href="/admin/codes" aria-current="page">兑换码管理</a><a href="/admin/feedback">用户反馈</a></nav><h1>兑换码管理</h1>
${message?`<section role="status"><p>${escape(message)}</p>${code?`<code>${escape(code)}</code><p>请立即复制保存。完整兑换码仅本次显示，刷新后无法找回；补发会使旧码失效。请勿重复提交此表单。</p>`:''}</section>`:''}
<section><h2>生成兑换码</h2><p>用于现有的限期 PRO 授权，从兑换成功时起计算有效天数。兑换码需在生成后一年内兑换。这不是永久授权，也不代表付款成功。</p>
<form method="post" action="/admin/codes"><div class="fields"><label>来源编号（不可重复）<input name="reference" maxlength="100" value="${escape('PROMO-'+crypto.randomUUID())}" required></label>
<label>PRO 有效期<select name="days"><option value="7">7 天</option><option value="30" selected>30 天</option><option value="90">90 天</option><option value="365">365 天</option></select></label></div>
${hidden('action','issue')}<label><input type="checkbox" name="confirm" value="yes" required>确认生成一枚限期兑换码</label><button>生成兑换码</button></form></section>
<section><h2>兑换记录</h2><form method="get"><div class="fields"><label>来源编号或尾号<input name="q" value="${escape(url.searchParams.get('q')??'')}" maxlength="100"></label>
<label>状态<select name="state">${[['','全部'],...Object.entries(statuses).filter(([s])=>s!=='refunded')].map(([s,label])=>`<option value="${s}"${url.searchParams.get('state')===s?' selected':''}>${label}</option>`).join('')}</select></label>
<button class="outline">查询</button></div></form><table><thead><tr><th>来源 / 尾号</th><th>有效期</th><th>状态</th><th>兑换账号 / 时间</th><th>兑换截止（北京时间）</th><th>操作</th></tr></thead><tbody>${rows||'<tr><td colspan="6">暂无记录</td></tr>'}</tbody></table>
<nav>${page>1?`<a href="${pageLink(page-1)}">上一页</a>`:''}<p>第 ${page} 页 · 每页 25 条</p>${report?.has_next?`<a href="${pageLink(page+1)}">下一页</a>`:''}</nav>
<p>已兑换记录保留用于核对，不支持在这里撤销已授予的权益或操作真实退款。作废仅针对尚未兑换的码。</p></section></main></html>`,{status,headers});
}
