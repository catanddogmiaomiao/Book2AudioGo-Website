"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

import { LanguageMenu, useLanguage } from "../_components/Language";
import { htmlLang, localizedHref } from "../_data/languages";
import { accountText, type accountCopy } from "../_data/account-copy";

type Message = keyof typeof accountCopy;
type Mode = "login" | "register" | "recover" | "reset";
type Profile = {
  user: { username: string };
  avatar?: string | null;
  plan: string;
  expires_at: number | null;
  single_device_pro?: boolean;
  device_limit?: number;
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

async function api<T>(route: string, body?: Record<string, string | null>, method = body ? "POST" : "GET") {
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

async function prepareAvatar(file: File) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 10 * 1024 * 1024)
    throw new Error("Unsupported image");
  const bitmap = await createImageBitmap(file);
  try {
    if (bitmap.width * bitmap.height > 40_000_000) throw new Error("Image too large");
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 128;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas unavailable");
    const side = Math.min(bitmap.width, bitmap.height);
    context.fillStyle = "#FFFEFB";
    context.fillRect(0, 0, 128, 128);
    context.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, 128, 128);
    for (const quality of [0.8, 0.65, 0.5]) {
      const image = canvas.toDataURL("image/jpeg", quality);
      const data = image.slice("data:image/jpeg;base64,".length);
      if (image.startsWith("data:image/jpeg;base64,") && data.length <= 12000) return data;
    }
    throw new Error("Avatar exceeds storage limit");
  } finally { bitmap.close(); }
}
async function policy() {
  const { agreement_version, privacy_version } = await api<{ agreement_version: string; privacy_version: string }>("policy");
  return { agreement_version, privacy_version };
}

export default function Account({ initialMode }: { initialMode: Mode }) {
  const lang = useLanguage();
  const [mode, setMode] = useState(initialMode);
  const [profile, setProfile] = useState<Profile | null>(null);
  const avatarFile = useRef<HTMLInputElement>(null);
  const avatarMenu = useRef<HTMLDetailsElement>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [busy, setBusy] = useState(true);
  const [message, setMessage] = useState<Message | "">("");
  const [problem, setProblem] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [resendAt, setResendAt] = useState(0);
  const [now, setNow] = useState(0);
  const t = (key: Message, values?: Record<string, string | number>) => accountText(lang, key, values);
  const remaining = Math.max(0, Math.ceil((resendAt - now) / 1000));
  const date = (value?: number | null) => value ? new Date(value * 1000).toLocaleString(htmlLang(lang), {
    year: "numeric", month: "short", day: "numeric",
  }) : "";

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const requested = query.get("mode");
    if (requested === "reset") {
      const token = new URLSearchParams(window.location.hash.slice(1)).get("token") ?? "";
      if (/^[A-Za-z0-9_-]{43}$/.test(token)) setResetToken(token);
      window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
    }
    let active = true;
    api<Profile>("profile").then(
      data => { if (active) setProfile(data); },
      error => {
        if (active && (!(error instanceof ApiError) || error.status !== 401)) {
          setProblem(true);
          setMessage("Account service unavailable.");
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
        setMode("login");
      }
      setProblem(true);
      setMessage(error instanceof ApiError && error.status === 429 ? "Too many attempts. Try again later."
        : error instanceof ApiError && error.status === 401 ? "Sign-in failed or your session expired."
        : mode === "reset" && error instanceof ApiError && error.status === 400 ? "The reset link is invalid, expired or already used."
        : "Check your details or try again in a moment.");
    } finally {
      setBusy(false);
    }
  }

  function switchMode(next: Mode) {
    setMode(next);
    setProblem(false);
    setMessage("");
    if (next !== "reset") {
      setResetToken("");
      const url = new URL(window.location.href);
      if (next === "recover") url.searchParams.set("mode", "recover");
      else url.searchParams.delete("mode");
      window.history.replaceState(window.history.state, "", url);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const field = (name: string) => String(values.get(name) ?? "");
    void run(async () => {
      const username = field("username").trim();
      const password = field("password");
      if (mode === "recover") {
        const result = await api<{ retry_after: number }>("password-reset/request", { email: field("email").trim() });
        const requestedAt = Date.now();
        setNow(requestedAt);
        setResendAt(requestedAt + result.retry_after * 1000);
        setMessage("If this email is verified on an account, you’ll receive a reset link. Check your inbox and spam folder.");
        return;
      }
      if (mode !== "login" && password !== field("confirm")) {
        setProblem(true);
        setMessage("The passwords do not match.");
        return;
      }
      if (mode === "register") {
        const versions = await policy();
        await api("register", { ...versions, username, password,
          email: field("email").trim(), email_code: field("code").trim() });
      } else if (mode === "reset") {
        await api("password-reset/complete", { token: resetToken, password });
        form.reset();
        setProfile(null);
        switchMode("login");
        setMessage("Password reset. Sign in with your new password.");
        return;
      } else {
        await api("login", { username, password });
      }
      form.reset();
      setProfile(await api<Profile>("profile"));
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
      setMessage("Check your inbox or spam folder for the code.");
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
      setUpgradeOpen(false);
      setProfile(await api<Profile>("profile"));
      setMessage("Code redeemed. Refresh your device license in the desktop app.");
    });
  }

  function changeAvatar(file: File | null) {
    avatarMenu.current?.removeAttribute("open");
    void run(async () => {
      let avatar: string | null = null;
      try {
        if (file) avatar = await prepareAvatar(file);
      } catch {
        setProblem(true);
        setMessage("Choose a valid JPG, PNG or WebP image up to 10 MB.");
        return;
      }
      const result = await api<{ avatar: string | null }>("avatar", { avatar });
      setProfile(current => current && { ...current, avatar: result.avatar });
      setMessage(avatar ? "Avatar updated." : "Default avatar restored.");
    });
  }

  const orderStatus: Record<string, string> = {
    completed: t("Paid"), revoked: t("Access revoked"),
    redeemed: t("Redeemed"), refunded: t("Refunded"), issued: t("Unclaimed"),
  };
  const canUpgrade = profile?.plan === "free" && !profile.single_device_pro && !profile.entitlements?.length;
  const linkedDevices = profile?.devices?.length ?? 0;
  const payments = [
    ...(profile?.live_purchases ?? []).map(row => ({ ...row, label: t("One-device PRO") })),
    ...(profile?.sandbox_purchases ?? []).map(row => ({ ...row, label: t("Paddle sandbox") })),
  ].sort((a, b) => (b.completed_at ?? 0) - (a.completed_at ?? 0));

  return <main className="accountSite" lang={htmlLang(lang)}>
    <nav className="nav wrap"><a className="brand" href={localizedHref("/", lang)}>
      <span className="brandmark">B<span>▶</span></span><strong>Book2Audio <i>GO</i></strong>
    </a><LanguageMenu /></nav>
    <div className="wrap accountContent">
      <p className="eyebrow">BOOK2AUDIO GO</p>
      <h1>{t("Your account")}</h1>
      {message && <p className={`accountMessage ${problem ? "accountError" : ""}`} role={problem ? "alert" : "status"}>{t(message)}</p>}
      {!profile || mode === "recover" || mode === "reset" ? <section className="accountCard accountAuth">
        <h2>{mode === "login" ? t("Sign in") : mode === "register" ? t("Create an account")
          : mode === "recover" ? t("Forgot password") : t("Reset password")}</h2>
        <p>{mode === "recover" ? t("Enter your verified email to receive a password reset link.")
          : mode === "reset" && !resetToken ? t("Open the full link from your email or request a new one.")
          : t("Use the same Book2Audio GO account on the website and in the desktop app.")}</p>
        <form key={mode} onSubmit={submit}><fieldset disabled={busy}>
          {(mode === "login" || mode === "register") && <label>{t("Username")}<input name="username" autoComplete="username" maxLength={254} required /></label>}
          {mode === "register" && <>
            <div className="accountInline"><label>{t("Email")}<input name="email" type="email" autoComplete="email" maxLength={254} required /></label>
              <button type="button" className="accountOutline" disabled={remaining > 0} onClick={e => sendCode(e.currentTarget.form)}>
                {remaining ? `${remaining}s` : t("Send code")}</button></div>
            <label>{t("Email verification code")}<input name="code" autoComplete="one-time-code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required /></label>
          </>}
          {mode === "recover" ? <label>{t("Verified email")}<input name="email" type="email" autoComplete="email" maxLength={254} required /></label>
            : <label>{mode === "reset" ? t("New password") : t("Password")}<input name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"}
                minLength={mode === "login" ? undefined : 6} maxLength={mode === "login" ? 128 : 12} required /></label>}
          {(mode === "register" || mode === "reset") && <label>{t("Confirm password")}<input name="confirm" type="password" autoComplete="new-password" minLength={6} maxLength={12} required /></label>}
          {mode === "register" && <label className="accountCheck"><input type="checkbox" required /><span>
            {t("I agree to the ")} <a href={documents + "agreement"} target="_blank" rel="noreferrer">{t("Terms")}</a>
            {t(" and ")}<a href={documents + "privacy"} target="_blank" rel="noreferrer">{t("Privacy Notice")}</a>
            {lang !== "zh" && <small> ({t("Chinese original")})</small>}</span></label>}
          <button className="primary accountSubmit" disabled={(mode === "reset" && !resetToken) || (mode === "recover" && remaining > 0)}>
            {busy ? t("Connecting…") : mode === "login" ? t("Sign in")
              : mode === "register" ? t("Create free account")
              : mode === "recover" ? remaining ? `${remaining}s` : t("Send reset link")
              : t("Reset password")}</button>
        </fieldset></form>
        <div className="accountActions">
          {mode === "login" ? <>
            <button onClick={() => switchMode("register")} disabled={busy}>{t("Create an account")}</button>
            <button onClick={() => switchMode("recover")} disabled={busy}>{t("Forgot password?")}</button>
          </> : <>
            {mode === "reset" && <button onClick={() => switchMode("recover")} disabled={busy}>{t("Request a new link")}</button>}
            <button onClick={() => switchMode("login")} disabled={busy}>{t("Back to sign in")}</button>
          </>}
        </div>
      </section> : <div className="accountDashboard">
        <section className="accountCard accountProfile">
          <details className="accountAvatar" ref={avatarMenu}>
            <summary title={t("Avatar settings")} aria-label={t("Avatar settings")}>
              {profile.avatar ? <img src={`data:image/jpeg;base64,${profile.avatar}`} alt="" width={44} height={44} />
                : <svg width="44" height="44" viewBox="0 0 32 32" aria-hidden="true">
                    <circle cx="16" cy="16" r="16" fill="#B9F5DC" />
                    <circle cx="16" cy="11" r="4" fill="#064F55" />
                    <rect x="8" y="17" width="16" height="8" rx="4" fill="#064F55" />
                  </svg>}
            </summary>
            <div className="accountAvatarActions">
              <button type="button" disabled={busy} onClick={() => avatarFile.current?.click()}>{t("Upload avatar")}</button>
              {profile.avatar && <button type="button" disabled={busy} onClick={() => changeAvatar(null)}>{t("Restore default avatar")}</button>}
            </div>
            <input ref={avatarFile} hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={event => {
              const file = event.currentTarget.files?.[0];
              event.currentTarget.value = "";
              if (file) changeAvatar(file);
            }} />
          </details>
          <div><p className="eyebrow">{t("Signed in")}</p><h2>{profile.user.username}</h2></div>
          <span className="pill">{profile.plan === "pro" ? "PRO" : t("Free")}</span>
          {canUpgrade && <button className="primary accountSubmit" aria-expanded={upgradeOpen}
            onClick={() => setUpgradeOpen(!upgradeOpen)}>{t("Get PRO")}</button>}
          <button className="accountOutline" disabled={busy} onClick={() => void run(async () => {
            await api("logout", {});
            setProfile(null);
            setUpgradeOpen(false);
            switchMode("login");
          })}>{t("Sign out")}</button>
        </section>
        {canUpgrade && upgradeOpen && <section className="accountCard">
          <h2>{t("Get PRO")}</h2>
          <button className="accountOutline" disabled>{t("Buy PRO (not yet available)")}</button>
          <details className="accountRedemption">
            <summary>{t("Use a redemption code")}</summary>
            <form onSubmit={redeem}><fieldset disabled={busy}>
              <label>{t("Redemption code")}<input name="code" autoComplete="off" maxLength={100} required /></label>
              <label className="accountCheck"><input type="checkbox" required /><span>
                {t("I agree to the ")} <a href={documents + "purchase"} target="_blank" rel="noreferrer">{t("purchase and refund rules")}</a>
                {lang !== "zh" && <small> ({t("Chinese original")})</small>}</span></label>
              <button className="accountOutline">{t("Redeem to this account")}</button>
            </fieldset></form>
          </details>
        </section>}
        <section className="accountCard">
          <div className="accountSectionHead"><h2>{t("License status")}</h2>
            <button className="accountOutline" disabled={busy} onClick={() => void run(async () => {
              setProfile(await api<Profile>("profile"));
            })}>{t("Refresh records")}</button></div>
          <p>{profile.single_device_pro ? t("One-device PRO license")
            : profile.entitlements?.length ? t("Perpetual PRO license")
            : profile.plan === "pro" && profile.expires_at
              ? t("PRO until {date}", { date: date(profile.expires_at) })
              : t("Your account is on the free plan.")}</p>
        </section>
        <section className="accountCard">
          <h2>{t("Linked devices")}</h2>
          {profile.device_limit !== undefined && <p>{profile.device_limit > 0
            ? t("Linked: {count} · Device limit: {limit}", { count: linkedDevices, limit: profile.device_limit })
            : t("Your account has no device licenses.")}</p>}
          {profile.device_rebind_at && <p>{t("You can link a new device once the old offline license expires.")} {new Date(profile.device_rebind_at * 1000).toLocaleString(htmlLang(lang))}</p>}
          {profile.devices?.length ? <ul className="accountList">{profile.devices.map(device => <li key={device.id}>
            <div><strong>{device.name}</strong><small>{t("Last verified")} {date(device.last_seen)}</small></div>
            <button className="accountOutline" disabled={busy} onClick={() => {
              const prompt = profile.single_device_pro
                ? t("After unlinking, you can switch devices once the offline license expires (within 24 hours). Continue?")
                : t("Unlink this device?");
              if (window.confirm(prompt)) void run(async () => {
                await api("devices/" + encodeURIComponent(device.id), undefined, "DELETE");
                setProfile(await api<Profile>("profile"));
              });
            }}>{t("Unlink")}</button></li>)}</ul> : <p>{profile.device_limit === 0 || profile.device_rebind_at
              ? t("No devices linked.")
              : t("No devices linked. Sign in and refresh the license in the desktop app.")}</p>}
        </section>
        <section className="accountCard">
          <h2>{t("Purchase history")}</h2>
          {payments.length || profile.purchases?.length ? <ul className="accountList">
            {payments.map(row => <li key={row.transaction_id}><div><strong>{row.label}</strong>
              <small>{row.transaction_id} {date(row.completed_at)}</small></div><span>{orderStatus[row.status] ?? row.status}</span></li>)}
            {profile.purchases?.map(row => <li key={row.id}><div><strong>{t("Redemption code")} •••• {row.code_tail}</strong>
              <small>{date(row.redeemed_at)}</small></div><span>{orderStatus[row.state] ?? row.state}</span></li>)}
          </ul> : <p>{t("No purchases yet.")}</p>}
        </section>
      </div>}
    </div>
  </main>;
}
