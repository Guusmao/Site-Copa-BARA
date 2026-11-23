import { sql, readBody } from "./_db.js";
import { senhaOk } from "./_auth.js";

const MAX = 400_000;

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "GET") {
    const rows = await sql`SELECT estado, atualizado_em, versao FROM torneio WHERE id = 1`;
    return res.status(200).json(rows[0] || { estado: null, atualizado_em: null, versao: 0 });
  }

  if (req.method === "PUT") {
    if (!senhaOk(req.headers["x-senha"])) return res.status(401).json({ erro: "Senha errada." });
    const { estado, versao } = readBody(req);
    const base = Number.isInteger(versao) ? versao : -1;
    if (estado === null) {
      await sql`DELETE FROM torneio WHERE id = 1`;
      return res.status(200).json({ ok: true, atualizado_em: null, versao: 0 });
    }
    if (!estado || typeof estado !== "object" || !Array.isArray(estado.grupos) || !Array.isArray(estado.jogos) || typeof estado.jogadores !== "object")
      return res.status(400).json({ erro: "Dados do campeonato inválidos." });
    const json = JSON.stringify(estado);
    if (json.length > MAX) return res.status(413).json({ erro: "Dados grandes demais." });
    const rows = base === 0
      ? await sql`
          INSERT INTO torneio (id, estado, atualizado_em, versao) VALUES (1, ${json}::jsonb, now(), 1)
          ON CONFLICT (id) DO NOTHING
          RETURNING atualizado_em, versao`
      : await sql`
          UPDATE torneio SET estado = ${json}::jsonb, atualizado_em = now(), versao = versao + 1
          WHERE id = 1 AND versao = ${base}
          RETURNING atualizado_em, versao`;
    if (!rows.length) return res.status(409).json({ erro: "Outra pessoa da organização salvou antes. Recarregue." });
    return res.status(200).json({ ok: true, ...rows[0] });
  }

  res.setHeader("Allow", "GET, PUT");
  return res.status(405).json({ erro: "Método não permitido." });
}
