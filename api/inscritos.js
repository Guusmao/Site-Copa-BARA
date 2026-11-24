import { sql, readBody } from "./_db.js";
import { senhaOk } from "./_auth.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (!senhaOk(req.headers["x-senha"])) return res.status(401).json({ erro: "Senha errada." });

  if (req.method === "PATCH") {
    const { id, pago } = readBody(req);
    if (!Number.isInteger(id) || typeof pago !== "boolean") return res.status(400).json({ erro: "Dados inválidos." });
    const rows = await sql`
      UPDATE inscricoes SET pago = ${pago}, pago_em = CASE WHEN ${pago} THEN now() ELSE NULL END
      WHERE id = ${id} RETURNING id, pago, pago_em`;
    if (!rows.length) return res.status(404).json({ erro: "Inscrição não encontrada." });
    return res.status(200).json(rows[0]);
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET, PATCH");
    return res.status(405).json({ erro: "Método não permitido." });
  }
  const inscritos = await sql`
    SELECT id, nome, whatsapp, criado_em, pago, pago_em
    FROM inscricoes ORDER BY criado_em ASC`;
  return res.status(200).json({ inscritos });
}
