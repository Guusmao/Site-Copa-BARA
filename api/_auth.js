import { timingSafeEqual } from "node:crypto";

export function senhaOk(given) {
  const expected = process.env.ADMIN_PASSWORD || "";
  if (!expected || !given) return false;
  const a = Buffer.from(String(given)), b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
