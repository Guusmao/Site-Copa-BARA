# Copa BARA

Site da 1ª Copa Bara de FIFA (EA Sports FC 26).

- `index.html`: página "Vem aí!" com o formulário de inscrição (nome e WhatsApp) e os clubes 4 estrelas.
- `organizacao.html`: lista de inscritos (pede a senha da organização).
- `api/`: funções da Vercel que salvam e leem as inscrições no Postgres (Neon).
- `prototipos/torneio.html`: protótipo de grupos, jogos e mata-mata. Não vai pro ar.

## Variáveis de ambiente (Vercel)

| Nome | Para quê |
| --- | --- |
| `DATABASE_URL` | Conexão do Postgres (Neon) |
| `ADMIN_PASSWORD` | Senha da página `/organizacao` |
| `WHATSAPP_GROUP` | Link de convite do grupo (`https://chat.whatsapp.com/...`). Quem se inscreve é mandado pra ele |

Tabela usada:

```sql
CREATE TABLE inscricoes (
  id serial PRIMARY KEY,
  nome text NOT NULL,
  id_jogo text,  -- não usado mais
  whatsapp text NOT NULL UNIQUE,
  criado_em timestamptz NOT NULL DEFAULT now()
);
```

## Escudos

Os escudos em `escudos/` foram convertidos para WebP a partir dos SVGs do repositório
[JoseArroyave/football-logos](https://github.com/JoseArroyave/football-logos). São marcas dos
respectivos clubes e estão aqui só para identificar os times neste campeonato entre amigos.
Se um escudo não carregar, o site mostra um escudo genérico com a sigla e as cores do clube.
