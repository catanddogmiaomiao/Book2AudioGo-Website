"use client";

import { useEffect, useState, type FormEvent } from "react";

type Mode = "login" | "register" | "recover";
type Profile = {
  user: { username: string };
  plan: string;
  expires_at: number | null;
  single_device_pro?: boolean;
  device_rebind_at?: number | null;
  entitlements?: { entitlement_code: string }[];
  devices?: { id: string; name: string; last_seen: number }[];
  purchases?: { id: string; state: string; code_tail: string; redeemed_at?: number }[];
  live_purchases?: { transaction_id: string; status: string; completed_at?: number }[];
  sandbox_purchases?: { transaction_id: string; status: string; completed_at?: number }[];
};

class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

async function api<T>(route: string, body?: Record<string, string>, method = body ? "POST" : "GET") {
  const response = await fetch("/api/account/" + route, {
    method, cache: "no-store", credentials: "same-origin",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json() as T & { detail?: string };
  if (!response.ok) throw new ApiError(response.status, data.detail ?? "");
  return data;
}

const documents = "https://accounts.book2audiogo.com/v1/legal/";
async function policy() {
  const { agreement_version, privacy_version } = await api<{ agreement_version: string; privacy_version: string }>("policy");
  return { agreement_version, privacy_version };
}

export default function Account() {
  const [lang, setLang] = useState("en");
  const [mode, setMode] = useState<Mode>("login");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [busy, setBusy] = useState(true);
  const [message, setMessage] = useState("");
  const [problem, setProblem] = useState(false);
  const [recovery, setRecovery] = useState("");
  const [resendAt, setResendAt] = useState(0);
  const [now, setNow] = useState(0);
  const zh = lang === "zh";
  const t = (cn: string, en: string) => zh ? cn : en;
  const remaining = Math.max(0, Math.ceil((resendAt - now) / 1000));
  const date = (value?: number | null) => value ? new Date(value * 1000).toLocaleString(zh ? "zh-CN" : "en", {
    year: "numeric", month: "short", day: "numeric",
  }) : "";

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("lang");
    if (value === "zh" || (!value && navigator.language.startsWith("zh"))) setLang("zh");
    let active = true;
    api<Profile>("profile").then(
      data => { if (active) setProfile(data); },
      error => {
        if (active && (!(error instanceof ApiError) || error.status !== 401)) {
          setProblem(true);
          setMessage("Account service unavailable. / 账号服务暂不可用。");
        }
      },
    ).finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!resendAt) return;
    const timer = window.setInterval(() => {
      const next = Date.now();
      setNow(next);
      if (next >= resendAt) setResendAt(0);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendAt]);

  async function run(action: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setProblem(false);
    setMessage("");
    try {
      await action();
    } catch (error) {
      if (profile && error instanceof ApiError && error.status === 401) {
        setProfile(null);
        setRecovery("");
        setMode("login");
      }
      setProblem(true);
      setMessage(zh && error instanceof ApiError && error.message ? error.message
        : error instanceof ApiError && error.status === 429 ? t("操作过于频繁，请稍后再试。", "Too many attempts. Try again later.")
        : error instanceof ApiError && error.status === 401 ? t("登录失败或会话已失效。", "Sign-in failed or your session expired.")
        : t("操作未完成，请检查输入或稍后再试。", "Check your details or try again in a moment."));
    } finally {
      setBusy(false);
    }
  }

  function switchMode(next: Mode) {
    setMode(next);
    setProblem(false);
    setMessage("");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const field = (name: string) => String(values.get(name) ?? "");
    void run(async () => {
      const username = field("username").trim();
      const password = field("password");
      if (mode !== "login" && password !== field("confirm")) {
        setProblem(true);
        setMessage(t("两次输入的密码不一致。", "The passwords do not match."));
        return;
      }
      let result: { recovery_code?: string };
      if (mode === "register") {
        const versions = await policy();
        result = await api("register", { ...versions, username, password,
          email: field("email").trim(), email_code: field("code").trim() });
      } else if (mode === "recover") {
        result = await api("recover", { username, password, recovery_code: field("code").trim() });
        switchMode("login");
        setMessage(t("密码已重置。请使用新密码登录。", "Password reset. Sign in with your new password."));
      } else {
        result = await api("login", { username, password });
      }
      form.reset();
      setRecovery(result.recovery_code ?? "");
      if (mode !== "recover") setProfile(await api<Profile>("profile"));
    });
  }

  function sendCode(form: HTMLFormElement | null) {
    const email = form?.elements.namedItem("email");
    if (!(email instanceof HTMLInputElement) || !email.reportValidity()) return;
    void run(async () => {
      const result = await api<{ retry_after: number }>("email-code", { email: email.value.trim() });
      const time = Date.now();
      setNow(time);
      setResendAt(time + result.retry_after * 1000);
      setMessage(t("请检查收件箱或垃圾邮件。", "Check your inbox or spam folder for the code."));
    });
  }

  function redeem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const code = String(new FormData(form).get("code") ?? "").trim();
    void run(async () => {
      const versions = await policy();
      await api("redeem", { ...versions, code, purchase_version: versions.agreement_version });
      form.reset();
      setProfile(await api<Profile>("profile"));
      setMessage(t("兑换成功。在桌面端刷新本机授权即可使用。", "Code redeemed. Refresh your device license in the desktop app."));
    });
  }

  function rotate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!window.confirm(t("生成新恢复码后，旧恢复码将失效。继续吗？", "Your previous recovery code will stop working. Continue?"))) return;
    const password = String(new FormData(form).get("password") ?? "");
    void run(async () => {
      const result = await api<{ recovery_code: string }>("recovery-code", { password });
      form.reset();
      setRecovery(result.recovery_code);
    });
  }

  const orderStatus: Record<string, string> = {
    completed: t("已付款", "Paid"), revoked: t("权益已撤销", "Access revoked"),
    redeemed: t("已兑换", "Redeemed"), refunded: t("已退款", "Refunded"), issued: t("待兑换", "Unclaimed"),
  };
  const payments = [
    ...(profile?.live_purchases ?? []).map(row => ({ ...row, label: t("单设备 PRO", "One-device PRO") })),
    ...(profile?.sandbox_purchases ?? []).map(row => ({ ...row, label: t("Paddle 沙盒", "Paddle sandbox") })),
  ].sort((a, b) => (b.completed_at ?? 0) - (a.completed_at ?? 0));

  return <main className="accountSite" lang={zh ? "zh-CN" : "en"}>
    <nav className="nav wrap"><a className="brand" href={zh ? "/?lang=zh" : "/"}>
      <span className="brandmark">B<span>▶</span></span><strong>Book2Audio <i>GO</i></strong>
    </a><div className="language" aria-label={t("语言", "Language")}>
      <button className={zh ? "" : "active"} onClick={() => setLang("en")}>EN</button>
      <button className={zh ? "active" : ""} onClick={() => setLang("zh")}>中文</button>
    </div></nav>
    <div className="wrap accountContent">
      <p className="eyebrow">BOOK2AUDIO GO</p>
      <h1>{t("用户中心", "Your account")}</h1>
      {message && <p className={`accountMessage ${problem ? "accountError" : ""}`} role={problem ? "alert" : "status"}>{message}</p>}
      {recovery && <section className="accountCard recoveryNotice">
        <h2>{t("保存恢复码", "Save your recovery code")}</h2>
        <p>{t("把它保存在安全的地方。忘记密码时需要用它找回账号。", "Keep this somewhere safe. You’ll need it to reset a forgotten password.")}</p>
        <code>{recovery}</code>
        <button className="accountOutline" onClick={() => setRecovery("")}>{t("我已保存", "I’ve saved it")}</button>
      </section>}
      {!profile ? <section className="accountCard accountAuth">
        <h2>{mode === "login" ? t("登录", "Sign in") : mode === "register" ? t("创建账号", "Create an account") : t("重置密码", "Reset password")}</h2>
        <p>{t("网站和桌面端使用同一个 Book2Audio GO 账号。", "Use the same Book2Audio GO account on the website and in the desktop app.")}</p>
        <form key={mode} onSubmit={submit}><fieldset disabled={busy}>
          <label>{t("用户名", "Username")}<input name="username" autoComplete="username" maxLength={254} required /></label>
          {mode === "register" && <>
            <div className="accountInline"><label>{t("电子邮箱", "Email")}<input name="email" type="email" autoComplete="email" maxLength={254} required /></label>
              <button type="button" className="accountOutline" disabled={remaining > 0} onClick={e => sendCode(e.currentTarget.form)}>
                {remaining ? `${remaining}s` : t("发送验证码", "Send code")}</button></div>
            <label>{t("邮箱验证码", "Email verification code")}<input name="code" autoComplete="one-time-code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required /></label>
          </>}
          {mode === "recover" && <label>{t("恢复码", "Recovery code")}<input name="code" autoComplete="off" maxLength={120} required /></label>}
          <label>{t("密码", "Password")}<input name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"}
            minLength={mode === "login" ? undefined : 6} maxLength={mode === "login" ? 128 : 12} required /></label>
          {mode !== "login" && <label>{t("确认密码", "Confirm password")}<input name="confirm" type="password" autoComplete="new-password" minLength={6} maxLength={12} required /></label>}
          {mode === "register" && <label className="accountCheck"><input type="checkbox" required /><span>
            {t("我同意", "I agree to the ")} <a href={documents + "agreement"} target="_blank" rel="noreferrer">{t("使用协议", "Terms")}</a>
            {t("与", " and ")}<a href={documents + "privacy"} target="_blank" rel="noreferrer">{t("隐私说明", "Privacy Notice")}</a></span></label>}
          <button className="primary accountSubmit">{busy ? t("正在连接…", "Connecting…") : mode === "login"
            ? t("登录", "Sign in") : mode === "register" ? t("创建免费账号", "Create free account") : t("重置密码", "Reset password")}</button>
        </fieldset></form>
        <div className="accountActions">
          {mode === "login" ? <>
            <button onClick={() => switchMode("register")} disabled={busy}>{t("创建账号", "Create an account")}</button>
            <button onClick={() => switchMode("recover")} disabled={busy}>{t("找回密码", "Forgot password?")}</button>
          </> : <button onClick={() => switchMode("login")} disabled={busy}>{t("返回登录", "Back to sign in")}</button>}
        </div>
      </section> : <div className="accountDashboard">
        <section className="accountCard accountProfile">
          <div><p className="eyebrow">{t("当前账号", "Signed in")}</p><h2>{profile.user.username}</h2></div>
          <span className="pill">{profile.plan === "pro" ? "PRO" : t("免费版", "Free")}</span>
          <button className="accountOutline" disabled={busy} onClick={() => void run(async () => {
            await api("logout", {});
            setProfile(null);
            setRecovery("");
            switchMode("login");
          })}>{t("退出登录", "Sign out")}</button>
        </section>
        <section className="accountCard">
          <div className="accountSectionHead"><h2>{t("授权管理", "Licenses")}</h2>
            <button className="accountOutline" disabled={busy} onClick={() => void run(async () => {
              setProfile(await api<Profile>("profile"));
            })}>{t("刷新记录", "Refresh records")}</button></div>
          <p>{profile.single_device_pro ? t("单设备 PRO 买断授权", "One-device PRO license")
            : profile.entitlements?.length ? t("PRO 买断授权", "Perpetual PRO license")
            : profile.plan === "pro" && profile.expires_at
              ? t(`PRO 有效期至 ${date(profile.expires_at)}`, `PRO until ${date(profile.expires_at)}`)
              : t("当前是免费账号。", "Your account is on the free plan.")}</p>
          <form onSubmit={redeem}><fieldset disabled={busy}>
            <label>{t("兑换码", "Redemption code")}<input name="code" autoComplete="off" maxLength={100} required /></label>
            <label className="accountCheck"><input type="checkbox" required /><span>
              {t("我同意", "I agree to the ")} <a href={documents + "purchase"} target="_blank" rel="noreferrer">{t("购买与退款规则", "purchase and refund rules")}</a></span></label>
            <button className="accountOutline">{t("兑换到当前账号", "Redeem to this account")}</button>
          </fieldset></form>
        </section>
        <section className="accountCard">
          <h2>{t("已绑定设备", "Linked devices")}</h2>
          {profile.device_rebind_at && <p>{t("旧设备的离线凭证到期后即可绑定新设备。", "You can link a new device once the old offline license expires.")} {new Date(profile.device_rebind_at * 1000).toLocaleString(zh ? "zh-CN" : "en")}</p>}
          {profile.devices?.length ? <ul className="accountList">{profile.devices.map(device => <li key={device.id}>
            <div><strong>{device.name}</strong><small>{t("最近验证", "Last verified")} {date(device.last_seen)}</small></div>
            <button className="accountOutline" disabled={busy} onClick={() => {
              const prompt = profile.single_device_pro
                ? t("解绑后需等旧设备离线授权到期（最长 24 小时）才能换机。继续吗？", "After unlinking, you can switch devices once the offline license expires (within 24 hours). Continue?")
                : t("确认解绑这台设备？", "Unlink this device?");
              if (window.confirm(prompt)) void run(async () => {
                await api("devices/" + encodeURIComponent(device.id), undefined, "DELETE");
                setProfile(await api<Profile>("profile"));
              });
            }}>{t("解绑", "Unlink")}</button></li>)}</ul> : <p>{t("暂无绑定设备。请在桌面端登录并刷新本机授权。", "No devices linked. Sign in and refresh the license in the desktop app.")}</p>}
        </section>
        <section className="accountCard">
          <h2>{t("购买记录", "Purchase history")}</h2>
          {payments.length || profile.purchases?.length ? <ul className="accountList">
            {payments.map(row => <li key={row.transaction_id}><div><strong>{row.label}</strong>
              <small>{row.transaction_id} {date(row.completed_at)}</small></div><span>{orderStatus[row.status] ?? row.status}</span></li>)}
            {profile.purchases?.map(row => <li key={row.id}><div><strong>{t("兑换码", "Redemption code")} •••• {row.code_tail}</strong>
              <small>{date(row.redeemed_at)}</small></div><span>{orderStatus[row.state] ?? row.state}</span></li>)}
          </ul> : <p>{t("暂无购买记录。", "No purchases yet.")}</p>}
        </section>
        <section className="accountCard"><h2>{t("账号安全", "Account security")}</h2>
          <details><summary>{t("重新生成恢复码", "Generate a new recovery code")}</summary>
            <form onSubmit={rotate}><fieldset disabled={busy}>
              <label>{t("当前密码", "Current password")}<input name="password" type="password" autoComplete="current-password" maxLength={128} required /></label>
              <button className="accountOutline">{t("生成新恢复码", "Generate recovery code")}</button>
            </fieldset></form>
          </details>
        </section>
      </div>}
    </div>
  </main>;
}
