"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

type Lang = "en" | "zh" | "ja" | "ko";
const copy = {
  zh: { entry: "留言与反馈", title: "让听书体验更好一点", intro: "遇到问题，或有想要的功能？欢迎告诉我们。", kind: "反馈类型", kinds: ["遇到问题", "功能建议", "其他留言"], message: "留言内容", placeholder: "可以描述操作步骤、报错信息，或你希望增加的功能…", email: "联系邮箱（选填）", emailHint: "如需回复，请留下邮箱。", rating: "整体使用体验（选填）", ratings: ["需要改进", "还不错", "很喜欢"], privacy: "留言仅管理员可见。请勿提交密码、书籍全文或其他敏感信息。", send: "提交反馈", sending: "正在提交…", close: "关闭", success: "谢谢，反馈已收到！", successBody: "我们会认真查看你的留言。如填写了邮箱，可通过邮箱与你联系。", again: "再写一条", error: "提交失败，内容已保留，请稍后重试。", limited: "提交较频繁，请稍后再试（同一网络每天最多 5 条）。", invalid: "请填写 5–3000 字的留言，并检查邮箱格式。", optional: "不选择", count: "字", retry: "暂时无法连接，内容已保留，请重试。" },
  en: { entry: "Feedback", title: "Help make listening better", intro: "Found a problem or have an idea? We would love to hear it.", kind: "Feedback type", kinds: ["Report a problem", "Suggest a feature", "Other feedback"], message: "Your message", placeholder: "Describe the steps, error message, or feature you would like…", email: "Email (optional)", emailHint: "Leave your email if you would like a reply.", rating: "Overall experience (optional)", ratings: ["Needs work", "Good", "Love it"], privacy: "Only the administrator can see your feedback. Please do not include passwords, full books, or sensitive information.", send: "Send feedback", sending: "Sending…", close: "Close", success: "Thank you! Feedback received.", successBody: "We will review your message. If you left an email, we may contact you there.", again: "Write another", error: "Could not send. Your message is kept here; please try again.", limited: "Please try again later (up to 5 messages per network per day).", invalid: "Enter a message of 5–3000 characters and check your email address.", optional: "No selection", count: "characters", retry: "Connection unavailable. Your message is kept here; please retry." },
  ja: { entry: "ご意見・お問い合わせ", title: "聴く読書を、もっと快適に", intro: "不具合や追加してほしい機能をお聞かせください。", kind: "種類", kinds: ["不具合の報告", "機能の提案", "その他"], message: "メッセージ", placeholder: "操作手順、エラー内容、ご希望の機能など…", email: "メールアドレス（任意）", emailHint: "返信をご希望の場合はご記入ください。", rating: "全体の使い心地（任意）", ratings: ["改善が必要", "良い", "とても良い"], privacy: "内容は管理者のみ閲覧できます。パスワード、本の全文、機密情報は記入しないでください。", send: "送信", sending: "送信中…", close: "閉じる", success: "ありがとうございます。受け付けました！", successBody: "内容を確認します。メールをご記入の場合はご連絡することがあります。", again: "もう一件書く", error: "送信できませんでした。内容は保持されています。再度お試しください。", limited: "時間をおいてお試しください（同じネットワークで1日5件まで）。", invalid: "5〜3000文字の内容とメールの形式をご確認ください。", optional: "未選択", count: "文字", retry: "接続できません。内容は保持されています。再度お試しください。" },
  ko: { entry: "문의 및 피드백", title: "더 나은 듣기 경험을 함께", intro: "문제나 원하는 기능이 있다면 알려 주세요.", kind: "피드백 유형", kinds: ["문제 신고", "기능 제안", "기타 의견"], message: "내용", placeholder: "작업 순서, 오류 메시지 또는 원하는 기능을 알려 주세요…", email: "이메일 (선택)", emailHint: "답변을 원하시면 이메일을 남겨 주세요.", rating: "전반적인 경험 (선택)", ratings: ["개선 필요", "좋아요", "아주 좋아요"], privacy: "관리자만 내용을 확인할 수 있습니다. 비밀번호, 책 전문, 민감한 정보는 입력하지 마세요.", send: "피드백 보내기", sending: "전송 중…", close: "닫기", success: "감사합니다. 의견이 접수되었습니다!", successBody: "내용을 확인하겠습니다. 이메일을 남기셨다면 연락드릴 수 있습니다.", again: "다시 작성", error: "전송하지 못했습니다. 내용은 유지됩니다. 다시 시도해 주세요.", limited: "잠시 후 다시 시도해 주세요 (동일 네트워크에서 하루 최대 5건).", invalid: "5~3000자의 내용과 이메일 형식을 확인해 주세요.", optional: "선택 안 함", count: "자", retry: "연결할 수 없습니다. 내용은 유지됩니다. 다시 시도해 주세요." }
};

export default function FeedbackWidget() {
  const [lang, setLang] = useState<Lang>("en");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const requestId = useRef("");
  const inFlight = useRef(false);
  useEffect(() => {
    const update = () => {
      const value = document.documentElement.lang.split("-")[0];
      setLang(value in copy ? value as Lang : "en");
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    return () => observer.disconnect();
  }, []);
  const t = copy[lang];
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    if (message.trim().length < 5) { setError(t.invalid); return; }
    inFlight.current = true; setPending(true); setError("");
    requestId.current ||= crypto.randomUUID();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch("/api/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, signal: controller.signal,
        body: JSON.stringify({ id: requestId.current, kind: data.get("kind"), message: message.trim(), email: String(data.get("email") ?? "").trim(), rating: data.get("rating") ? Number(data.get("rating")) : null, lang, page: window.location.pathname, website: data.get("website") }) });
      const body = await response.json();
      if (!response.ok || !body.ok) { setError(response.status === 429 ? t.limited : response.status === 400 ? t.invalid : t.error); return; }
      setReceipt(body.id.slice(0, 8)); setSuccess(true); setMessage(""); form.reset(); requestId.current = "";
    } catch { setError(t.retry); }
    finally { clearTimeout(timeout); inFlight.current = false; setPending(false); }
  }
  return <>
    <button className="feedbackLauncher" type="button" onClick={() => dialog.current?.showModal()} aria-haspopup="dialog"><span aria-hidden="true">✎</span> {t.entry}</button>
    <dialog ref={dialog} className="feedbackDialog" aria-labelledby="feedback-title" aria-describedby="feedback-intro" onClick={event => { if (event.target === event.currentTarget) { const bounds = event.currentTarget.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.current?.close(); } }}>
      <div className="feedbackHeader"><span>BOOK2AUDIO GO</span><button type="button" aria-label={t.close} onClick={() => dialog.current?.close()}>×</button></div>
      <h2 id="feedback-title">{success ? t.success : t.title}</h2><p id="feedback-intro">{success ? t.successBody : t.intro}</p>
      {success ? <div className="feedbackSuccess" role="status"><span aria-hidden="true">✓</span><p>#{receipt}</p><button type="button" className="feedbackSubmit" onClick={() => { setSuccess(false); setError(""); }}>{t.again}</button></div> : <form onSubmit={submit} onChange={() => { requestId.current = ""; }}>
        <fieldset disabled={pending}>
          <label htmlFor="feedback-kind">{t.kind}</label><select id="feedback-kind" name="kind" defaultValue="issue">{["issue", "idea", "other"].map((kind, i) => <option key={kind} value={kind}>{t.kinds[i]}</option>)}</select>
          <label htmlFor="feedback-message">{t.message}</label><textarea id="feedback-message" name="message" value={message} onChange={event => { setMessage(event.target.value); requestId.current = ""; }} minLength={5} maxLength={3000} required rows={5} placeholder={t.placeholder} aria-describedby="feedback-count" /><small id="feedback-count" className="feedbackCount">{message.length}/3000 {t.count}</small>
          <label htmlFor="feedback-email">{t.email}</label><input id="feedback-email" name="email" type="email" maxLength={254} autoComplete="email" aria-describedby="feedback-email-hint" /><small id="feedback-email-hint">{t.emailHint}</small>
          <label htmlFor="feedback-rating">{t.rating}</label><select id="feedback-rating" name="rating" defaultValue=""><option value="">{t.optional}</option>{t.ratings.map((rating, i) => <option key={rating} value={i + 1}>{rating}</option>)}</select>
          <div className="feedbackTrap" aria-hidden="true"><label htmlFor="feedback-website">Website</label><input id="feedback-website" name="website" tabIndex={-1} autoComplete="off" /></div>
          <p className="feedbackPrivacy">{t.privacy}</p><p className="feedbackError" role="alert">{error}</p><button className="feedbackSubmit" type="submit">{pending ? t.sending : t.send} <span aria-hidden="true">↗</span></button>
        </fieldset>
      </form>}
    </dialog>
  </>;
}
