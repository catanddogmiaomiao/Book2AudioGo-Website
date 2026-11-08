"use client";

import { LanguageMenu, useLanguage } from "../_components/Language";
import { localizedHref, paddleLang } from "../_data/languages";
import { paymentText, type PaymentMessage } from "../_data/payment-copy";

import { useEffect, useRef, useState } from "react";
import { initializePaddle, type Paddle } from "@paddle/paddle-js";
import "../sandbox/purchase/purchase.css";

export default function Checkout() {
  const lang = useLanguage();
  const t = (key: PaymentMessage) => paymentText(lang, key);
  const paddle = useRef<Paddle | undefined>(undefined);
  const [order, setOrder] = useState("");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [status, setStatus] = useState<PaymentMessage | "">("");

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const orderId = query.get("order") ?? query.get("_ptxn") ?? "";
    if (!/^txn_[a-z0-9]{26}$/.test(orderId)
        || (query.has("_ptxn") && query.get("_ptxn") !== orderId)) {
      setStatus("Sign in to Book2Audio GO and start a purchase from your account.");
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
                ? "Checkout complete. Once payment is confirmed, refresh your device license in the app."
                : "The completed transaction does not match this order. Check your purchase history.");
            }
            if (event.name === "checkout.closed") setBusy(false);
            if (["checkout.error", "checkout.failed", "checkout.payment.error"].includes(event.name ?? "")) {
              setBusy(false);
              setStatus("Checkout encountered an error. Close it and try again.");
            }
          },
        });
        if (!instance) throw new Error();
        if (active) {
          paddle.current = instance;
          setReady(true);
        }
      } catch {
        if (active) setStatus("Checkout is unavailable. Reopen the order later.");
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
        settings: { displayMode: "overlay", locale: paddleLang(lang), showAddDiscounts: false, allowDiscountRemoval: false } });
    } catch {
      setBusy(false);
      setStatus("Could not open checkout. Try again later.");
    }
  }

  return <main><nav className="nav wrap"><a className="brand" href={localizedHref("/", lang)}>Book2Audio GO</a><LanguageMenu /></nav>
    <div className="wrap purchaseGrid">
    <section className="purchaseIntro">
      <p className="eyebrow">BOOK2AUDIO GO</p>
      <h1>Book2Audio GO Pro</h1>
      <p>{t("One-time purchase for one device. Unlink your old device in your account when switching.")}</p>
    </section>
    <article className="purchaseCard">
      <h2>{t("One-device PRO license")}</h2>
      <div className="previewPrice">US$9.99</div>
      <p className="note">{t("One-time payment, before tax. Paddle shows the tax at checkout.")}</p>
      <button className="primary buyButton" disabled={!ready || busy || completed} onClick={pay}>{t("Continue to payment")}</button>
      <p role="status" aria-live="polite">{status && t(status)}</p>
    </article>
    </div>
  </main>;
}
