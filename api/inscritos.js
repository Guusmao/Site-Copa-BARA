import { sql } from "./_db.js";
import { senhaOk } from "./_auth.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") return res.status(405).json({ erro: "Método não permitido." });
  if (!senhaOk(req.headers["x-senha"])) return res.status(401).json({ erro: "Senha errada." });

  const inscritos = await sql`
    SELECT id, nome, whatsapp, criado_em
    FROM inscricoes ORDER BY criado_em ASC`;
  return res.status(200).json({ inscritos });
}
