import { timingSafeEqual } from "node:crypto";
import { sql } from "./_db.js";

function senhaOk(given) {
  const expected = process.env.ADMIN_PASSWORD || "";
  if (!expected || !given) return false;
  const a = Buffer.from(String(given)), b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") return res.status(405).json({ erro: "Método não permitido." });
  if (!senhaOk(req.headers["x-senha"])) return res.status(401).json({ erro: "Senha errada." });

  const inscritos = await sql`
    SELECT id, nome, id_jogo, whatsapp, criado_em
    FROM inscricoes ORDER BY criado_em ASC`;
  return res.status(200).json({ inscritos });
}
