/** Cloudflare Worker entry point for the vinext site. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";
import { feedbackRoute, type FeedbackEnv } from "./feedback";
import { paddleRoute, sandboxEnabled, type PaddleEnv } from "./paddle";
import { accountRoute } from "./account";
import { downloadRoute, recordWebsiteVisit, type DownloadEnv } from "./downloads";
import { adminCodesRoute } from "./admin-codes";
import { isLang, localizedHref, marketingRoute } from "../app/_data/languages";
export { FeedbackInbox } from "./feedback";
export { PaddleTestOrders } from "./paddle";
export { DownloadStats } from "./downloads";

interface Env extends FeedbackEnv, PaddleEnv, DownloadEnv {
  ASSETS: Fetcher;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}
interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}
const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const marketing = marketingRoute(url.pathname);
    const legacyLang = url.searchParams.get("lang");
    const lang = marketing?.lang ?? legacyLang;
    const render = () => {
      const headers = new Headers(request.headers);
      headers.set("x-b2a-locale", isLang(lang) ? lang : "en");
      return handler.fetch(new Request(request, { headers }), env, ctx);
    };
    const paddle = await paddleRoute(request, env);
    if (paddle) return paddle;
    if (url.pathname === "/sandbox/purchase" || url.pathname.startsWith("/sandbox/purchase/")) {
      if (!sandboxEnabled(request, env)) return new Response("Not found", { status: 404 });
      const result = await render();
      const response = new Response(result.body, result);
      response.headers.set("X-Robots-Tag", "noindex, nofollow");
      response.headers.set("Cache-Control", "no-store");
      return response;
    }
    // Normalize production URLs without redirecting localhost or Sites previews.
    if (url.hostname === "www.book2audiogo.com" ||
        (url.hostname === "book2audiogo.com" && url.protocol === "http:")) {
      url.protocol = "https:";
      url.hostname = "book2audiogo.com";
      return Response.redirect(url.toString(), 301);
    }
    if (marketing && (request.method === "GET" || request.method === "HEAD")) {
      const language = url.pathname === marketing.path && isLang(legacyLang) ? legacyLang : marketing.lang;
      const pathname = localizedHref(marketing.path, language);
      if (pathname !== url.pathname || url.searchParams.has("lang")) {
        url.pathname = pathname;
        url.searchParams.delete("lang");
        return Response.redirect(url.toString(), 301);
      }
    }
    if (env.ASSETS && (request.method === "GET" || request.method === "HEAD") &&
        (url.pathname === "/guides/itunes-apple-music" ||
         url.pathname.startsWith("/guides/itunes-apple-music/"))) {
      return env.ASSETS.fetch(request);
    }
    const codes = await adminCodesRoute(request, env);
    if (codes) return codes;
    const download = await downloadRoute(request, env, ctx);
    if (download) return download;
    const account = await accountRoute(request, env.ACCOUNT_ANALYTICS, ctx);
    if (account) return account;
    const feedback = await feedbackRoute(request, env);
    if (feedback) return feedback;
    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }
    let staticPage: Response | undefined;
    if (env.ASSETS && marketing && (request.method === "GET" || request.method === "HEAD") &&
        !request.headers.has("RSC") && !url.searchParams.has("_rsc")) {
      const asset = new URL("/_marketing" + (url.pathname === "/" ? "/home" : url.pathname), url);
      const response = await env.ASSETS.fetch(new Request(asset, { method: request.method }));
      if (response.ok && response.headers.get("content-type")?.includes("text/html")) staticPage = response;
    }
    const result = staticPage ?? await render();
    recordWebsiteVisit(request, result, env, ctx);
    if (url.pathname !== "/purchase" && url.pathname !== "/account") return result;
    const response = new Response(result.body, result);
    response.headers.set("Cache-Control", "no-store");
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    response.headers.set("Referrer-Policy", "no-referrer");
    return response;
  },
};
export default worker;
