alter table public.records
  add column if not exists content_blocks jsonb not null default '[]'::jsonb;

drop index if exists public.records_search_idx;

alter table public.records
  drop column if exists search_vector;

alter table public.records
  add column search_vector tsvector generated always as (
    setweight(to_tsvector('portuguese', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('portuguese', coalesce(summary, '')), 'B') ||
    setweight(to_tsvector('portuguese', coalesce(description, '')), 'C') ||
    setweight(to_tsvector('portuguese', coalesce(category, '')), 'C') ||
    setweight(to_tsvector('portuguese', coalesce(metadata::text, '')), 'D') ||
    setweight(to_tsvector('portuguese', coalesce(content_blocks::text, '')), 'D')
  ) stored;

create index if not exists records_search_idx on public.records using gin(search_vector);
