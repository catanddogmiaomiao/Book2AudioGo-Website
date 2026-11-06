"use client";

import { useEffect, useRef, useState } from "react";
import { initializePaddle, type Paddle, type PaddleEventData } from "@paddle/paddle-js";
import { PRICE_ID, sandboxToken } from "../../../shared/paddle";
import { describeCheckoutError } from "../../../shared/paddle-errors.mjs";
import "./purchase.css";

// A single initialization promise also handles React StrictMode remounts.
let paddlePromise: ReturnType<typeof initializePaddle> | undefined;
let activeListener: ((event: PaddleEventData) => void) | undefined;
type State = "ready" | "opening" | "open" | "paying" | "completed" | "closed" | "failed" | "error";
const messages: Record<State, string> = {
  ready: "已就绪，可以开始沙盒测试购买。", opening: "正在打开测试结账…",
  open: "测试结账已打开。", paying: "测试支付处理中，请等待结账结果。",
  completed: "前端收到测试结账完成事件。付款确认以服务端验签记录为准；自动激活尚未实现。",
  closed: "已关闭结账，尚未收到完成事件；这不代表服务器已确认取消或付款失败。",
  failed: "本次测试支付失败，可在结账窗口更换测试卡重试。",
  error: "结账遇到错误，请关闭窗口后重试。",
};

export default function Purchase() {
  const paddle = useRef<Paddle | undefined>(undefined);
  const current = useRef<State>("ready");
  const openTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [state, setState] = useState<State>("ready");
  const [ready, setReady] = useState(false);
  const [problem, setProblem] = useState("");
  const [price, setPrice] = useState("");
  const [previewNote, setPreviewNote] = useState("正在请求 Paddle 地区价格预览…");
  const [transaction, setTransaction] = useState("");
  const [webhook, setWebhook] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutIssue, setCheckoutIssue] = useState<ReturnType<typeof describeCheckoutError> | null>(null);
  const update = (next: State) => { current.current = next; setState(next); };

  useEffect(() => {
    let disposed = false;
    activeListener = (event) => {
      if (disposed) return;
      if (event.name === "checkout.loaded") { clearTimeout(openTimer.current); setCheckoutIssue(null); update("open"); }
      if (event.name === "checkout.payment.initiated") update("paying");
      if (event.name === "checkout.payment.failed") update("failed");
      if (["checkout.error", "checkout.failed", "checkout.payment.error"].includes(event.name ?? "")) {
        clearTimeout(openTimer.current);
        setCheckoutOpen(false);
        setCheckoutIssue(describeCheckoutError(event));
        update(event.name === "checkout.payment.error" ? "failed" : "error");
      }
      if (event.name === "checkout.completed") {
        clearTimeout(openTimer.current);
        setCheckoutIssue(null);
        update("completed");
        setTransaction(event.data?.transaction_id ?? "");
      }
      if (event.name === "checkout.closed") {
        clearTimeout(openTimer.current);
        setCheckoutOpen(false);
        // Closing a success screen must not overwrite completion or failure.
        if (!["completed", "failed", "error"].includes(current.current)) update("closed");
      }
    };
    (async () => {
      try {
        const response = await fetch("/api/paddle/sandbox/config", { cache: "no-store" });
        if (!response.ok) throw new Error("沙盒未启用，请检查本地 .env 配置并重启服务。");
        const config = await response.json() as { token: unknown; webhookConfigured: boolean };
        if (disposed) return;
        setWebhook(config.webhookConfigured);
        if (!sandboxToken(config.token)) throw new Error("缺少有效的 test_ 沙盒客户端令牌。请在本地 .env 中填写 PADDLE_SANDBOX_CLIENT_TOKEN，然后重启服务。");
        paddlePromise ??= initializePaddle({ environment: "sandbox", token: config.token,
          eventCallback: event => activeListener?.(event) });
        const instance = await paddlePromise;
        if (!instance) throw new Error("Paddle.js 未加载，请检查网络后刷新。");
        if (disposed) return;
        // Refresh the callback even when the official SDK instance is reused after HMR.
        instance.Update({ eventCallback: event => activeListener?.(event) });
        paddle.current = instance;
        setReady(true);
        try {
          // Paddle detects location and applies the existing overrides. No local FX logic.
          const result = await instance.PricePreview({ items: [{ priceId: PRICE_ID, quantity: 1 }] });
          if (disposed) return;
          const amount = result.data.details.lineItems[0]?.formattedTotals.total;
          if (!amount) throw new Error("preview");
          setPrice(amount);
          setPreviewNote("Paddle 地区价格预览；最终币种、税费及金额以结账内的账单地址和明细为准。");
        } catch {
          if (!disposed) setPreviewNote("地区价格预览暂不可用，可继续打开结账查看 Paddle 最终金额。");
        }
      } catch (error) {
        if (!disposed) { setProblem(error instanceof Error ? error.message : "初始化失败，请刷新重试。"); setPreviewNote("配置完成后显示 Paddle 地区价格预览。"); }
      }
    })();
    return () => { disposed = true; activeListener = undefined; clearTimeout(openTimer.current); };
  }, []);

  const buy = () => {
    if (!paddle.current || current.current === "opening" || current.current === "paying") return;
    setTransaction("");
    setCheckoutIssue(null);
    setCheckoutOpen(true);
    update("opening");
    openTimer.current = setTimeout(() => {
      if (current.current === "opening") {
        setCheckoutOpen(false);
        setCheckoutIssue(describeCheckoutError({ code: "checkout_load_timeout" }));
        update("error");
      }
    }, 20000);
    try {
      // An existing Paddle instance may still retain a callback from the previous module.
      paddle.current.Update({ eventCallback: event => activeListener?.(event) });
      paddle.current.Checkout.open({ items: [{ priceId: PRICE_ID, quantity: 1 }],
        settings: { displayMode: "overlay", theme: "light", locale: "zh-Hans", allowDiscountRemoval: false, showAddDiscounts: false } });
    } catch {
      clearTimeout(openTimer.current); setCheckoutOpen(false);
      setCheckoutIssue(describeCheckoutError({ code: "checkout_open_failed" }));
      update("error");
    }
  };

  const visibleIssue = checkoutIssue ?? (state === "error" ? describeCheckoutError(null) : null);

  return <main className="sandboxPurchase">
    <nav className="nav wrap"><a className="brand" href="/"><span className="brandmark">B<span>▶</span></span><strong>Book2Audio <i>GO</i></strong></a><span className="pill">PADDLE SANDBOX</span></nav>
    <div className="sandboxBanner" role="note">测试环境，不会真实扣款</div>
    <section className="purchaseGrid wrap">
      <div className="purchaseIntro"><p className="eyebrow">YOUR BOOKS. YOUR LISTENING.</p><h1>让阅读，<br/>继续被听见。</h1><p className="lead">Book2Audio GO 将电子书转换为可聆听的音频。这里用于测试 Pro 买断版的购买流程。</p>
        <ul className="purchaseBenefits"><li>一次性购买，购买版本可永久使用</li><li>无自动续费，无订阅试用</li><li>不承诺无限云端用量或终身免费升级</li></ul>
        <p className="note">本次仅测试结账，不改变软件现有转换功能。</p>
      </div>
      <article className="purchaseCard"><span className="pill">PRO · PERPETUAL LICENSE</span><h2>Book2Audio GO Pro</h2><p>一次买断 · 购买版本永久使用</p>
        <div className="previewPrice">{price || "金额由 Paddle 提供"}</div><p className="note">{previewNote}</p>
        <button className="primary buyButton" disabled={!ready || checkoutOpen} onClick={buy}>{state === "opening" ? "正在打开…" : "测试购买 Pro"}</button>
        {problem && <p className="purchaseProblem" role="alert">{problem}</p>}
        {visibleIssue && <div className="purchaseProblem" role="alert"><strong>结账排查提示</strong><p>{visibleIssue.hint}</p><p>关闭 Paddle 错误窗口后可查看此提示；修正配置后再次点击测试购买。</p></div>}
        <p className="note">仅使用 Paddle 官方测试卡。请勿填写真实银行卡信息。</p>
        <div className="purchaseStatus" role="status" aria-live="polite"><strong>结账状态</strong><p>{ready ? messages[state] : "等待本地配置及 Paddle.js 初始化。"}</p><p>Paddle 错误代码：<code>{visibleIssue?.code ?? "尚未收到错误事件"}</code></p><small className="note">页面诊断版本：2026-11-03.2</small>{transaction && <p>测试交易编号：<code>{transaction}</code></p>}</div>
      </article>
    </section>
    <aside className="purchaseDetails wrap"><h2>关于本次测试</h2><p>所有地区共用同一价格 ID，由 Paddle 应用已配置的地区价格。此页面不会自行换算汇率。</p><p>{webhook ? "本地 Webhook 配置已填写，尚需实际投递确认。" : "服务器付款确认尚未配置，当前仅能测试前端结账。"} 自动激活尚未实现。前端完成提示不会发放授权，也不会按付款邮箱绑定账号。</p></aside>
    <footer className="wrap"><p>Book2Audio GO · Sandbox only</p><a href="/">返回官网</a></footer>
  </main>;
}
