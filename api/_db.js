import { neon } from "@neondatabase/serverless";

export const sql = neon(process.env.DATABASE_URL);

export function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  try { return JSON.parse(req.body || "{}"); } catch { return {}; }
}
