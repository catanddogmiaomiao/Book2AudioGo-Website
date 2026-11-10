import { ADMIN_KEY_HASH } from "./feedback-config";

export async function hasAdminAccess(request: Request, hash = ADMIN_KEY_HASH) {
  try {
    const header = request.headers.get("Authorization") ?? "";
    const credentials = header.startsWith("Basic ") ? atob(header.slice(6)) : "";
    if (!credentials.startsWith("admin:") || credentials.length <= 6) return false;
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(credentials.slice(6)));
    return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("") === hash;
  } catch {
    return false;
  }
}
