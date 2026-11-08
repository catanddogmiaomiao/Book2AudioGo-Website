import assert from "node:assert/strict";
import { readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { Miniflare } from "miniflare";

const root = resolve("dist/server");
const files = (await readdir(root, { recursive: true })).filter(file => /\.(m?js)$/.test(file) && file !== "index.js");
const site = "https://book2audiogo.com";
const account = "https://accounts.book2audiogo.com";
const token = "test_token_" + "a".repeat(45);
const user = { username: "test-reader" };
const device = "device-01234567890123456789";
let requests = 0;
let revoked = false;
const resetToken = "R".repeat(43);
const worker = new Miniflare({
  modulesRoot: root,
  modules: ["index.js", ...files].map(file => ({ type: "ESModule", path: resolve(root, file) })),
  compatibilityDate: "2026-05-15",
  compatibilityFlags: ["nodejs_compat"],
  assets: { directory: resolve("dist/client"), binding: "ASSETS", routerConfig: { has_user_worker: true, invoke_user_worker_ahead_of_assets: false } },
  outboundService: async request => {
    requests++;
    const url = new URL(request.url);
    assert.equal(url.origin, account);
    assert.equal(request.headers.get("Cookie"), null);
    if (url.pathname === "/v1/auth/login" || url.pathname === "/v1/auth/register") {
      assert.equal(request.headers.get("Authorization"), null);
      assert.equal((await request.json()).username, user.username);
      return Response.json({ session_token: token, user, ...(url.pathname.endsWith("register") ? { recovery_code: "TEST-RECOVERY" } : {}) });
    }
    if (url.pathname.startsWith("/v1/auth/password-reset/")) {
      assert.equal(request.headers.get("Authorization"), null);
      const body = await request.json();
      if (url.pathname.endsWith("/request")) {
        assert.deepEqual(body, { email: "reader@example.test" });
        return Response.json({ retry_after: 60 });
      }
      assert.equal(url.pathname, "/v1/auth/password-reset/complete");
      assert.deepEqual(body, { token: resetToken, password: "new-pass-12" });
      return Response.json({ ok: true });
    }
    assert.equal(request.headers.get("Authorization"), "Bearer " + token);
    if (url.pathname === "/v1/auth/logout") {
      revoked = true;
      return Response.json({ message: "Signed out" });
    }
    if (revoked) return Response.json({ detail: "Expired" }, { status: 401 });
    if (url.pathname === "/v1/devices/" + device) {
      assert.equal(request.method, "DELETE");
      return Response.json({ message: "Removed" });
    }
    assert.equal(url.pathname, "/v1/account");
    return Response.json({ user, plan: "pro", device_limit: 2, devices: [{ id: device, name: "Test PC", last_seen: 1 }],
      live_purchases: [], sandbox_purchases: [] });
  },
});

const request = (route, options) => worker.dispatchFetch(site + route, options);
const post = (route, body, origin = site, cookie = "") => request("/api/account/" + route, {
  method: "POST", headers: { "Content-Type": "application/json", Origin: origin, Cookie: cookie },
  body: JSON.stringify(body),
});
try {
  const page = await request("/account");
  assert.equal(page.status, 200);
  assert.equal(page.headers.get("Cache-Control"), "no-store");
  assert.match(await page.text(), /Your account/);
  assert.match(await (await request("/")).text(), /\/account\?lang=en/);
  assert.equal((await request("/api/account/profile")).status, 401);
  assert.equal((await post("login", { username: user.username }, "https://elsewhere.invalid")).status, 403);
  assert.equal((await post("login", { password: "a".repeat(17000) })).status, 400);
  assert.equal(requests, 0);

  const login = await post("login", { username: user.username, password: "synthetic" });
  assert.equal(login.status, 200, `Mock received ${requests} requests: ${await login.clone().text()}`);
  const cookie = login.headers.get("Set-Cookie");
  assert.match(cookie, /^__Host-b2a_session=/);
  for (const attribute of ["HttpOnly", "Secure", "SameSite=Lax", "Path=/"]) assert.ok(cookie.includes(attribute));
  assert.deepEqual(await login.json(), { user });
  const session = cookie.split(";")[0];
  const signed = { Cookie: session };
  const profile = await request("/api/account/profile", { headers: signed });
  assert.equal(profile.headers.get("Cache-Control"), "no-store");
  const profileData = await profile.json();
  assert.equal(profileData.plan, "pro");
  assert.equal(profileData.device_limit, 2);
  assert.equal((await request("/api/account/devices/" + device, { method: "DELETE", headers: signed })).status, 403);
  assert.equal((await request("/api/account/devices/" + device, { method: "DELETE", headers: { ...signed, Origin: site } })).status, 200);
  assert.equal((await request("/api/account/licenses/refresh", { headers: signed })).status, 404);
  const register = await post("register", { username: user.username, password: "synthetic" });
  assert.deepEqual(await register.json(), { user });
  assert.equal((await post("password-reset/request", { email: "reader@example.test" }, "https://elsewhere.invalid")).status, 403);
  const resetRequest = await post("password-reset/request", { email: "reader@example.test" }, site, session);
  assert.deepEqual(await resetRequest.json(), { retry_after: 60 });
  const reset = await post("password-reset/complete", { token: resetToken, password: "new-pass-12" }, site, session);
  assert.deepEqual(await reset.json(), { ok: true });
  assert.match(reset.headers.get("Set-Cookie"), /Max-Age=0/);
  const logout = await post("logout", {}, site, session);
  assert.match(logout.headers.get("Set-Cookie"), /Max-Age=0/);
  const expired = await request("/api/account/profile", { headers: signed });
  assert.equal(expired.status, 401);
  assert.match(expired.headers.get("Set-Cookie"), /Max-Age=0/);
  console.log("Account checks passed: home link, private profiles, secure cookies, body limits, same-origin writes, device unlink, and logout.");
} finally {
  await worker.dispose();
}
