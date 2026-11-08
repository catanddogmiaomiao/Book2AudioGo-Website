const SERVICE = "https://accounts.book2audiogo.com";
const COOKIE = "__Host-b2a_session";
const TOKEN = /^[A-Za-z0-9_-]{40,100}$/;
const DEVICE = /^\/api\/account\/devices\/([A-Za-z0-9_-]{20,80})$/;
const LIMIT = 16384;
const headers = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow",
};
const routes: Record<string, { method: string; path: string; auth?: boolean; session?: boolean }> = {
  "/api/account/profile": { method: "GET", path: "/v1/account", auth: true },
  "/api/account/policy": { method: "GET", path: "/v1/policy" },
  "/api/account/login": { method: "POST", path: "/v1/auth/login", session: true },
  "/api/account/register": { method: "POST", path: "/v1/auth/register", session: true },
  "/api/account/email-code": { method: "POST", path: "/v1/auth/email-code" },
  "/api/account/recover": { method: "POST", path: "/v1/auth/recover" },
  "/api/account/logout": { method: "POST", path: "/v1/auth/logout", auth: true },
  "/api/account/recovery-code": { method: "POST", path: "/v1/account/recovery-code", auth: true },
  "/api/account/redeem": { method: "POST", path: "/v1/redemptions", auth: true },
};

function json(body: unknown, status = 200, cookie?: string) {
  const output = new Headers(headers);
  if (cookie !== undefined) {
    output.set("Set-Cookie", `${COOKIE}=${cookie}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${cookie ? 2592000 : 0}`);
  }
  return Response.json(body, { status, headers: output });
}

function session(request: Request) {
  const token = request.headers.get("Cookie")?.split(";").map(value => value.trim())
    .find(value => value.startsWith(COOKIE + "="))?.slice(COOKIE.length + 1) ?? "";
  return TOKEN.test(token) ? token : "";
}

async function requestBody(request: Request) {
  const stream = request.body?.getReader();
  if (!stream) return "{}";
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let length = 0, body = "";
  try {
    for (;;) {
      const { value, done } = await stream.read();
      if (done) return body + decoder.decode();
      length += value.byteLength;
      if (length > LIMIT) {
        await stream.cancel();
        return null;
      }
      body += decoder.decode(value, { stream: true });
    }
  } catch {
    return null;
  }
}

export async function accountRoute(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/api/account/")) return null;
  const device = DEVICE.exec(url.pathname);
  const route = device ? { method: "DELETE", path: "/v1/devices/" + device[1], auth: true } : routes[url.pathname];
  if (!route) return json({ error: "not_found" }, 404);
  if (request.method !== route.method) return json({ error: "method" }, 405);
  if (request.method !== "GET" && (request.headers.get("Origin") !== url.origin
      || request.headers.get("Sec-Fetch-Site") === "cross-site"))
    return json({ error: "origin" }, 403);

  const token = session(request);
  const logout = url.pathname === "/api/account/logout";
  if (route.auth && !token) return logout ? json({ ok: true }, 200, "") : json({ error: "sign_in" }, 401);
  let body: string | undefined;
  if (request.method === "POST") {
    if (request.headers.get("Content-Type")?.split(";")[0].trim().toLowerCase() !== "application/json")
      return json({ error: "content_type" }, 415);
    const text = await requestBody(request);
    if (text === null) return json({ error: "invalid_body" }, 400);
    body = text;
  }
  const upstreamHeaders = new Headers({ Accept: "application/json" });
  if (body !== undefined) upstreamHeaders.set("Content-Type", "application/json");
  if (route.auth) upstreamHeaders.set("Authorization", "Bearer " + token);
  const address = request.headers.get("CF-Connecting-IP");
  if (address) upstreamHeaders.set("X-Real-IP", address);

  try {
    const response = await fetch(SERVICE + route.path, {
      method: route.method, headers: upstreamHeaders, body,
      redirect: "manual", signal: AbortSignal.timeout(20000),
    });
    if (response.status >= 300 && response.status < 400) return json({ error: "unavailable" }, 502);
    if (logout && (response.ok || response.status === 401)) return json({ ok: true }, 200, "");
    const data = await response.json() as Record<string, unknown>;
    if (!response.ok) {
      const detail = typeof data.detail === "string" ? data.detail : undefined;
      return json({ error: "account_service", detail }, response.status,
        route.auth && response.status === 401 ? "" : undefined);
    }
    if ("session" in route && route.session) {
      if (typeof data.session_token !== "string" || !TOKEN.test(data.session_token))
        return json({ error: "unavailable" }, 502);
      return json({ user: data.user, recovery_code: data.recovery_code }, response.status, data.session_token);
    }
    // The browser receives only account data. An upstream token is never returned as JSON.
    delete data.session_token;
    return json(data, response.status);
  } catch {
    return json({ error: "unavailable" }, 502);
  }
}
