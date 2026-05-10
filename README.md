# Lua Branca

MVP em Next.js para um arquivo tecnico sigiloso com leitura publica de registros publicados e painel admin protegido.

## Stack

- Next.js App Router, TypeScript e Tailwind CSS
- Supabase Postgres, RLS e Storage
- Remotion para a intro visual exportada em `public/media`
- Importacao de PDF com extracao de texto e OCR no navegador
- Vitest para schemas e utilitarios

## Desenvolvimento

As credenciais ficam somente em arquivos locais ignorados pelo Git e nas variaveis privadas da hospedagem. Nao publique PIN, secrets, tokens ou detalhes operacionais em arquivos versionados.

```bash
npm install
npm run dev
```

## Scripts

```bash
npm run dev
npm run lint
npm run test
npm run build
npm run remotion:still
npm run remotion:render
```

## Fluxo

- Visitantes consultam apenas registros publicados.
- Admin entra pelo botao reservado da barra inferior.
- Registros usam uma tabela unificada com modulos, tags, relacoes, assets e blocos de conteudo.
- PDFs importados viram rascunhos revisaveis.
