"use client";

import { useEffect, useRef, useState } from "react";
import { initializePaddle, type Paddle } from "@paddle/paddle-js";
import "../sandbox/purchase/purchase.css";

export default function Checkout() {
  const paddle = useRef<Paddle | undefined>(undefined);
  const [order, setOrder] = useState("");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const orderId = query.get("order") ?? query.get("_ptxn") ?? "";
    if (!/^txn_[a-z0-9]{26}$/.test(orderId)
        || (query.has("_ptxn") && query.get("_ptxn") !== orderId)) {
      setStatus("请先在 Book2Audio GO 用户中心登录并发起购买。");
      return;
    }
    setOrder(orderId);
    let active = true;
    (async () => {
      try {
        const result = await fetch("/api/paddle/live/config", { cache: "no-store" });
        if (!result.ok) throw new Error();
        const { token } = await result.json() as { token?: unknown };
        if (typeof token !== "string" || !/^live_[A-Za-z0-9_]+$/.test(token)) throw new Error();
        if (!active) return;
        const instance = await initializePaddle({ environment: "production", token,
          checkout: { settings: { showAddDiscounts: false, allowDiscountRemoval: false } },
          eventCallback: event => {
            if (!active) return;
            if (event.name === "checkout.loaded") setBusy(true);
            if (event.name === "checkout.completed") {
              setCompleted(true);
              setStatus(event.data?.transaction_id === orderId
                ? "结账已完成。账号服务确认付款后，请回到软件刷新本机授权。"
                : "完成的交易与当前订单编号不一致，请在账号中心核对购买记录。");
            }
            if (event.name === "checkout.closed") setBusy(false);
            if (["checkout.error", "checkout.failed", "checkout.payment.error"].includes(event.name ?? "")) {
              setBusy(false);
              setStatus("结账遇到问题，请在关闭结账窗口后重试。");
            }
          },
        });
        if (!instance) throw new Error();
        if (active) {
          paddle.current = instance;
          setReady(true);
        }
      } catch {
        if (active) setStatus("结账暂不可用，请稍后重新打开订单。");
      }
    })();
    return () => { active = false; };
  }, []);

  function pay() {
    if (!paddle.current || busy || completed) return;
    setBusy(true);
    setStatus("");
    try {
      paddle.current.Checkout.open({ transactionId: order,
        settings: { displayMode: "overlay", showAddDiscounts: false, allowDiscountRemoval: false } });
    } catch {
      setBusy(false);
      setStatus("无法打开结账，请稍后再试。");
    }
  }

  return <main className="wrap purchaseGrid">
    <section className="purchaseIntro">
      <p className="eyebrow">BOOK2AUDIO GO</p>
      <h1>Book2Audio GO Pro</h1>
      <p>一次性购买，单台设备授权。换机时可在账号中心解绑旧设备。</p>
    </section>
    <article className="purchaseCard">
      <h2>PRO 单设备授权</h2>
      <div className="previewPrice">US$9.99</div>
      <p className="note">税前价格 · 一次性付款。税费以 Paddle 结账明细为准。</p>
      <button className="primary buyButton" disabled={!ready || busy || completed} onClick={pay}>继续付款</button>
      <p role="status" aria-live="polite">{status}</p>
    </article>
  </main>;
}
