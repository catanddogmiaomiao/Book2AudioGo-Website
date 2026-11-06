export const PRICE_ID = "pri_01m6fk9sjr68pdczk37kzwtd86";
export const PRODUCT_ID = "pro_01m6fk4av9fqjyx1nkdxd6zapw";
export function sandboxToken(value: unknown): value is string {
  return typeof value === "string" && /^test_[A-Za-z0-9]+$/.test(value);
}
