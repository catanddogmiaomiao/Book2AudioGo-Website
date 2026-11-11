function reportWindow(today: string, days: number) {
  const midnight = Date.parse(today + "T00:00:00+08:00") / 1000;
  const start = midnight - (days - 1) * 86400;
  const end = midnight + 86400;
  return { start, end };
}

export async function productMetrics(db: D1Database, today: string, days: number) {
  const { start, end } = reportWindow(today, days);
  const [usage, orders] = await db.batch<Record<string, number>>([
    db.prepare(`SELECT
      COUNT(DISTINCT CASE WHEN event_name='app_first_open' THEN installation_id END) AS installs,
      COUNT(DISTINCT installation_id) AS active,
      COUNT(DISTINCT CASE WHEN event_name='book_imported' THEN installation_id END) AS imported,
      COUNT(DISTINCT CASE WHEN event_name='conversion_completed' THEN installation_id END) AS converted,
      COUNT(CASE WHEN event_name='conversion_started' THEN 1 END) AS started,
      COUNT(CASE WHEN event_name='conversion_completed' THEN 1 END) AS succeeded,
      COUNT(CASE WHEN event_name='conversion_failed' THEN 1 END) AS failed,
      COUNT(DISTINCT CASE WHEN event_name='batch_feature_clicked' THEN installation_id END) AS batch,
      COUNT(DISTINCT CASE WHEN event_name='purchase_page_opened' THEN installation_id END) AS checkout,
      COUNT(DISTINCT CASE WHEN event_name='license_activated' THEN installation_id END) AS activated
      FROM product_events WHERE received_at >= ? AND received_at < ?`).bind(start, end),
    db.prepare("SELECT COUNT(*) AS paid FROM purchase_completed WHERE received_at >= ? AND received_at < ?").bind(start, end),
  ]);
  return { ...usage.results[0], ...orders.results[0] };
}

type RegistrationRegion = { country: string | null; region: string | null; count: number };

const USER_PAGE_SIZE = 25;

export async function registrationUsernames(db: D1Database, page: number) {
  // Some old accounts have an email address in the username field.
  const { results } = await db.prepare(`SELECT CASE WHEN instr(username, '@') > 0
    THEN substr(username, 1, 1) || '***（旧邮箱账号）' ELSE username END AS username
    FROM users ORDER BY created DESC, id DESC LIMIT ? OFFSET ?`)
    .bind(USER_PAGE_SIZE + 1, (page - 1) * USER_PAGE_SIZE).all<{ username: string }>();
  return { usernames: results.slice(0, USER_PAGE_SIZE).map(row => row.username), hasNext: results.length > USER_PAGE_SIZE };
}

export async function registrationMetrics(db: D1Database, today: string, days: number) {
  const { start, end } = reportWindow(today, days);
  const [totals, regions] = await db.batch([
    db.prepare(`SELECT COUNT(*) AS total, COUNT(email_verified_at) AS verified,
      COUNT(CASE WHEN created >= ? AND created < ? THEN 1 END) AS added FROM users`).bind(start, end),
    db.prepare(`SELECT registration_country AS country, registration_region AS region, COUNT(*) AS count
      FROM users GROUP BY registration_country, registration_region ORDER BY count DESC, country, region`),
  ]);
  return {
    totals: totals.results[0] as { total: number; verified: number; added: number },
    regions: regions.results as RegistrationRegion[],
  };
}
