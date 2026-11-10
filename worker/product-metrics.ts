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
