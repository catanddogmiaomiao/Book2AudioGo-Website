"use client";

import { LanguageMenu, useLanguage } from "../../_components/Language";
import { localizedHref, paddleLang } from "../../_data/languages";
import { paymentText, type PaymentMessage } from "../../_data/payment-copy";

import { useEffect, useRef, useState } from "react";
import { initializePaddle, type Paddle, type PaddleEventData } from "@paddle/paddle-js";
import { PRICE_ID, sandboxToken } from "../../../shared/paddle";
import { describeCheckoutError } from "../../../shared/paddle-errors.mjs";
import "./purchase.css";
import { isPaymentMessage } from "../../_data/payment-copy";

// A single initialization promise also handles React StrictMode remounts.
let paddlePromise: ReturnType<typeof initializePaddle> | undefined;
let activeListener: ((event: PaddleEventData) => void) | undefined;
type State = "ready" | "opening" | "open" | "paying" | "completed" | "closed" | "failed" | "error";
const transactionPattern = /^txn_[a-z0-9]{26}$/;
const messages: Record<State, PaymentMessage> = {
  ready: "Ready for a sandbox purchase.", opening: "Opening test checkout…",
  open: "Test checkout is open.", paying: "Test payment is processing.",
  completed: "Test checkout completed. The server verifies payment separately.",
  closed: "Checkout closed without a completion event. The payment status is unconfirmed.",
  failed: "Test payment failed. Try a different test card in checkout.",
  error: "Checkout encountered an error. Close it and try again.",
};

export default function Purchase({ linkedTransaction }: { linkedTransaction?: string }) {
  const lang = useLanguage();
  const t = (key: PaymentMessage) => paymentText(lang, key);
  const paddle = useRef<Paddle | undefined>(undefined);
  const current = useRef<State>("ready");
  const openTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [state, setState] = useState<State>("ready");
  const [ready, setReady] = useState(false);
  const [problem, setProblem] = useState<PaymentMessage | "">("");
  const [price, setPrice] = useState("");
  const [previewNote, setPreviewNote] = useState<PaymentMessage>("Loading Paddle regional pricing…");
  const [transaction, setTransaction] = useState("");
  const [accountTransaction, setAccountTransaction] = useState(
    linkedTransaction && transactionPattern.test(linkedTransaction) ? linkedTransaction : "",
  );
  const [webhook, setWebhook] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutIssue, setCheckoutIssue] = useState<ReturnType<typeof describeCheckoutError> | null>(null);
  const update = (next: State) => { current.current = next; setState(next); };

  useEffect(() => {
    let disposed = false;
    const linked = linkedTransaction ?? new URLSearchParams(window.location.search).get("b2a_txn");
    if (linked !== null && !transactionPattern.test(linked)) {
      setProblem("Invalid test order link. Reopen it from your account in the app.");
      return;
    }
    if (linked) setAccountTransaction(linked);
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
        const completedTransaction = event.data?.transaction_id ?? "";
        if (linked && completedTransaction !== linked) {
          setProblem("The completed transaction does not match the account order.");
          update("error");
          setTransaction(completedTransaction);
          return;
        }
        setCheckoutIssue(null);
        update("completed");
        setTransaction(completedTransaction);
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
        if (!response.ok) throw new Error("Sandbox is disabled. Check the local .env file and restart the service.");
        const config = await response.json() as { token: unknown; webhookConfigured: boolean };
        if (disposed) return;
        setWebhook(config.webhookConfigured);
        if (!sandboxToken(config.token)) throw new Error("A valid test_ token is required. Set PADDLE_SANDBOX_CLIENT_TOKEN in .env and restart.");
        paddlePromise ??= initializePaddle({ environment: "sandbox", token: config.token,
          eventCallback: event => activeListener?.(event) });
        const instance = await paddlePromise;
        if (!instance) throw new Error("Paddle.js did not load. Check your connection and reload.");
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
          setPreviewNote("Paddle regional price preview. Final currency, tax and total depend on the billing details at checkout.");
        } catch {
          if (!disposed) setPreviewNote("Regional pricing is unavailable. Open checkout to see the final amount.");
        }
      } catch (error) {
        if (!disposed) { setProblem(error instanceof Error && isPaymentMessage(error.message) ? error.message : "Initialization failed. Reload and try again."); setPreviewNote("Paddle regional pricing will appear after setup."); }
      }
    })();
    return () => { disposed = true; activeListener = undefined; clearTimeout(openTimer.current); };
  }, [linkedTransaction]);

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
      const settings = { displayMode: "overlay" as const, theme: "light" as const, locale: paddleLang(lang), allowDiscountRemoval: false, showAddDiscounts: false };
      if (accountTransaction) paddle.current.Checkout.open({ transactionId: accountTransaction, settings });
      else paddle.current.Checkout.open({ items: [{ priceId: PRICE_ID, quantity: 1 }], settings });
    } catch {
      clearTimeout(openTimer.current); setCheckoutOpen(false);
      setCheckoutIssue(describeCheckoutError({ code: "checkout_open_failed" }));
      update("error");
    }
  };

  const visibleIssue = checkoutIssue ?? (state === "error" ? describeCheckoutError(null) : null);
  const statusMessage = state === "completed" && accountTransaction
    ? "Test checkout is complete. Once payment is confirmed, refresh your device license in the app."
    : messages[state];

  return <main className="sandboxPurchase">
    <nav className="nav wrap"><a className="brand" href={localizedHref("/", lang)}><span className="brandmark">B<span>▶</span></span><strong>Book2Audio <i>GO</i></strong></a><div className="accountNavControls"><span className="pill">{t("Paddle sandbox")}</span><LanguageMenu /></div></nav>
    <div className="sandboxBanner" role="note">{t("Test environment. No real charges.")}</div>
    <section className="purchaseGrid wrap">
      <div className="purchaseIntro"><p className="eyebrow">{t("Your books, ready to listen")}</p><h1>{t("Take your reading with you.")}</h1><p className="lead">{t("Book2Audio GO converts ebooks to audio. Use this page to test buying the perpetual Pro license.")}</p>
        <ul className="purchaseBenefits"><li>{t("One-time purchase. Keep using the version you buy.")}</li><li>{t("No automatic renewal or subscription trial.")}</li><li>{t("Cloud usage and free upgrades are subject to limits.")}</li></ul>
        <p className="note">{t(accountTransaction ? "This test order is linked to the sandbox account that started it." : (linkedTransaction === undefined ? "This link is for standalone checkout tests." : "This link is for sandbox account checkout."))}</p>
      </div>
      <article className="purchaseCard"><span className="pill">{t("PRO · Perpetual license")}</span><h2>Book2Audio GO Pro</h2><p>{t("One-time purchase · Use the purchased version indefinitely")}</p>
        <div className="previewPrice">{price || t("Price provided by Paddle")}</div><p className="note">{t(previewNote)}</p>
        {accountTransaction && <p className="note">{t("Account order")} <code>{accountTransaction}</code></p>}
        <button className="primary buyButton" disabled={!ready || checkoutOpen} onClick={buy}>{t(state === "opening" ? "Opening…" : "Test purchase of Pro")}</button>
        {problem && <p className="purchaseProblem" role="alert">{t(problem)}</p>}
        {visibleIssue && <div className="purchaseProblem" role="alert"><strong>{t("Checkout troubleshooting")}</strong><p>{lang === "zh" ? visibleIssue.hint : t("Check the Paddle sandbox default payment link and checkout configuration, then use the error code to troubleshoot.")}</p><p>{t("Close the Paddle error window to see this hint. Fix the configuration and try again.")}</p></div>}
        <p className="note">{t("Use an official Paddle test card only. Do not enter real card details.")}</p>
        <div className="purchaseStatus" role="status" aria-live="polite"><strong>{t("Checkout status")}</strong><p>{t(ready ? statusMessage : "Waiting for local configuration and Paddle.js.")}</p><p>{t("Paddle error code:")}<code>{visibleIssue?.code ?? t("No error event received")}</code></p><small className="note">{t("Diagnostics version: 2026-11-07.1")}</small>{transaction && <p>{t("Test transaction:")}<code>{transaction}</code></p>}</div>
      </article>
    </section>
    <aside className="purchaseDetails wrap"><h2>{t("About this test")}</h2><p>{t("All regions use the same price ID. Paddle applies configured regional pricing. This page does not convert currencies.")}</p><p>{t(accountTransaction
      ? "After test payment, wait for the account service to confirm the Paddle notification. Then refresh your device license in the app."
      : (webhook ? "Local webhook configured. Standalone tests only record orders." : "Server confirmation is not configured. Only checkout can be tested."))}</p></aside>
    <footer className="wrap"><p>{t("Book2Audio GO · Sandbox only")}</p><a href={localizedHref("/", lang)}>{t("Back to website")}</a></footer>
  </main>;
}
