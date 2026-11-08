/** Cloudflare Worker entry point for the vinext site. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";
import { feedbackRoute, type FeedbackEnv } from "./feedback";
import { paddleRoute, sandboxEnabled, type PaddleEnv } from "./paddle";
import { accountRoute } from "./account";
import { isLang } from "../app/_data/languages";
export { FeedbackInbox } from "./feedback";
export { PaddleTestOrders } from "./paddle";

interface Env extends FeedbackEnv, PaddleEnv {
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
    const lang = url.searchParams.get("lang");
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
    const account = await accountRoute(request);
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
    const result = await render();
    if (url.pathname !== "/purchase" && url.pathname !== "/account") return result;
    const response = new Response(result.body, result);
    response.headers.set("Cache-Control", "no-store");
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    response.headers.set("Referrer-Policy", "no-referrer");
    return response;
  },
};
export default worker;
