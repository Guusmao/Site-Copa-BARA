import { sql, readBody } from "./_db.js";

const clean = (v, max) => String(v ?? "").trim().replace(/\s+/g, " ").slice(0, max);

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const whatsapp = process.env.WHATSAPP_GROUP || "";

  if (req.method === "GET") {
    const [{ total }] = await sql`SELECT count(*)::int AS total FROM inscricoes`;
    return res.status(200).json({ total, whatsapp });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ erro: "Método não permitido." });
  }

  const body = readBody(req);
  const nome = clean(body.nome, 60);
  const digits = String(body.whatsapp ?? "").replace(/\D/g, "");

  if (!nome) return res.status(400).json({ erro: "Coloca seu nome e sobrenome." });
  if (nome.split(" ").filter((w) => w.length > 1).length < 2) return res.status(400).json({ erro: "Coloca o sobrenome também." });
  if (digits.length < 10 || digits.length > 13) return res.status(400).json({ erro: "Coloca um WhatsApp com DDD." });

  const rows = await sql`
    INSERT INTO inscricoes (nome, whatsapp)
    VALUES (${nome}, ${digits})
    ON CONFLICT (whatsapp) DO NOTHING
    RETURNING id`;
  if (!rows.length) return res.status(409).json({ erro: "Esse WhatsApp já está inscrito." });

  const [{ total }] = await sql`SELECT count(*)::int AS total FROM inscricoes`;
  return res.status(201).json({ ok: true, total, whatsapp });
}
