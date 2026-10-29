# Customer feedback

The fixed feedback button is available throughout the site and follows the page language (English, Chinese, Japanese or Korean). Visitors can send a problem report, feature suggestion or other message, with an optional email and experience rating. Messages are private.

## Storage and deployment

`worker/feedback.ts` implements the same-origin JSON API and the `FeedbackInbox` SQLite Durable Object. `vite.config.ts` declares the binding and the `feedback-v1` migration. The generated `dist/server/wrangler.json` contains both; the existing Cloudflare Workers Builds pipeline deploys these on merge to main. This production website is independently hosted on Cloudflare, rather than the historical ChatGPT Site recorded in `.openai/hosting.json`.

The schema initializes without destructive migrations. Records persist across Worker deploys. The API validates input, limits body size, deduplicates retries by submission UUID, includes a honeypot and restricts submissions to once per minute and five per UTC day per network. Rate controls use a daily IP digest; raw IPs are not stored. No emails are automatically sent.

## Private administrator inbox

Open `https://book2audiogo.com/admin/feedback`. Browser Basic Authentication uses username `admin` and the randomly generated access key delivered privately to the owner. The published source includes only its SHA-256 digest, in `worker/feedback-config.ts`; it never includes the access key itself. The admin API requires authentication on every request. All responses are uncached and the admin page is marked noindex. Messages render as text.

The inbox supports pages of 50 messages, status filtering, and marking messages new, read or resolved. To rotate access, set the `FEEDBACK_ADMIN_KEY_HASH` Worker variable to the SHA-256 hex digest of a new long random key, or replace the fallback hash and deploy. Keep the key outside the source repository. Durable Object bindings and class migration history must be preserved in future deployments.

## Validation

Build with `vinext build`, then run `node tests/seo.test.mjs` and `node tests/feedback.test.mjs`. The feedback test uses an isolated local Durable Object and its own test-only authentication digest. It checks input validation, private access, same-origin writes, persisted records after a Worker restart, duplicate retries, rate limiting and status updates. Test messages never reach production.
