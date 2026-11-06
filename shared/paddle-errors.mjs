/** Return only a short error code and our own hint, never raw provider payloads. */
/** @param {unknown} event */
export function describeCheckoutError(event) {
  const raw = event && typeof event === "object" && "code" in event ? event.code : undefined;
  const code = typeof raw === "string" && /^[a-z][a-z_]{2,79}$/.test(raw) && !/^(test_|live_)/.test(raw)
    ? raw : "unknown_checkout_error";
  const hints = /** @type {Record<string, string>} */ ({
    transaction_default_checkout_url_not_set: "Paddle 沙盒尚未设置 Default payment link。请到沙盒后台 Checkout → Checkout configuration 保存默认支付链接后重试。",
    transaction_checkout_not_enabled: "Paddle 沙盒账户尚未启用结账。请在沙盒后台检查账号设置；如需接受条款或提交资料，请由账号所有者亲自处理。",
    checkout_creation_invalid_field: "Paddle 未接受部分结账参数，请根据错误代码检查沙盒结账配置。",
    validation: "Paddle 未接受结账请求。请先检查沙盒默认支付链接，再检查结账参数。",
    checkout_load_timeout: "测试结账加载超时。请检查 Paddle 网络连接、浏览器拦截设置和沙盒 Default payment link，然后关闭窗口重试。",
    checkout_open_failed: "Paddle.js 未能打开测试结账。请刷新页面后重试。",
  });
  return { code, hint: hints[code] ?? "测试结账未能完成初始化。请先检查沙盒 Default payment link，再按这个错误代码排查。" };
}
