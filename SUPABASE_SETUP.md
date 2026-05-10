# Supabase no Lua Branca

Este projeto usa Supabase para banco, RLS e Storage. Credenciais e secrets devem ficar apenas no ambiente local ignorado pelo Git e no painel privado da hospedagem.

## Banco

Rode as migrations em `supabase/migrations` na ordem numerica. Todas as tabelas expostas usam RLS.

## Storage

O projeto usa dois buckets:

- `lua-branca-public` para imagens publicadas.
- `lua-branca-private` para rascunhos e anexos restritos.

## Operacao segura

- Nao publique chaves, PINs, tokens ou valores de ambiente.
- Rotacione secrets sempre que algum valor for compartilhado fora do painel seguro.
- Revise o acesso admin depois de qualquer alteracao de credencial.
