create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

create schema if not exists private;

create type public.record_kind as enum ('library', 'thesis', 'knowledge', 'technique', 'symbol', 'faction', 'test');
create type public.risk_level as enum ('baixo', 'medio', 'alto', 'critico');
create type public.secrecy_level as enum ('publico_interno', 'restrito', 'sigiloso', 'critico');
create type public.confidence_level as enum ('baixa', 'media', 'alta', 'validada');
create type public.record_status as enum ('rascunho', 'em_estudo', 'incompleto', 'validado_parcialmente', 'contestado', 'abandonado', 'restrito', 'publicado');
create type public.asset_visibility as enum ('public', 'private');
create type public.asset_type as enum ('cover', 'image', 'attachment', 'diagram', 'note');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  display_name text,
  access_level smallint not null default 1 check (access_level between 1 and 4),
  role text not null default 'viewer' check (role in ('viewer', 'editor', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.records (
  id uuid primary key default gen_random_uuid(),
  kind public.record_kind not null,
  title text not null,
  slug text not null,
  summary text,
  description text,
  category text,
  risk public.risk_level not null default 'baixo',
  secrecy public.secrecy_level not null default 'restrito',
  confidence public.confidence_level not null default 'media',
  status public.record_status not null default 'rascunho',
  is_published boolean not null default false,
  is_featured boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  cover_asset_id uuid,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  search_vector tsvector generated always as (
    setweight(to_tsvector('portuguese', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('portuguese', coalesce(summary, '')), 'B') ||
    setweight(to_tsvector('portuguese', coalesce(description, '')), 'C') ||
    setweight(to_tsvector('portuguese', coalesce(category, '')), 'C') ||
    setweight(to_tsvector('portuguese', coalesce(metadata::text, '')), 'D')
  ) stored,
  constraint records_slug_kind_unique unique (kind, slug)
);

create table public.assets (
  id uuid primary key default gen_random_uuid(),
  record_id uuid not null references public.records(id) on delete cascade,
  bucket text not null,
  path text not null,
  public_url text,
  filename text not null,
  mime_type text,
  size_bytes bigint,
  visibility public.asset_visibility not null default 'public',
  asset_type public.asset_type not null default 'image',
  sort_order integer not null default 0,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  constraint assets_bucket_path_unique unique (bucket, path)
);

alter table public.records
  add constraint records_cover_asset_fk foreign key (cover_asset_id) references public.assets(id) on delete set null;

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table public.record_tags (
  record_id uuid not null references public.records(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (record_id, tag_id)
);

create table public.record_relations (
  id uuid primary key default gen_random_uuid(),
  source_record_id uuid not null references public.records(id) on delete cascade,
  related_record_id uuid not null references public.records(id) on delete cascade,
  relation_type text not null default 'relacionado',
  created_at timestamptz not null default now(),
  constraint record_relations_not_self check (source_record_id <> related_record_id),
  constraint record_relations_unique unique (source_record_id, related_record_id, relation_type)
);

create table public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  record_id uuid not null references public.records(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, record_id)
);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  record_id uuid references public.records(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  changes jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index records_kind_idx on public.records(kind);
create index records_public_idx on public.records(is_published, published_at);
create index records_risk_idx on public.records(risk);
create index records_search_idx on public.records using gin(search_vector);
create index assets_record_idx on public.assets(record_id);
create index audit_record_idx on public.audit_events(record_id, created_at desc);
create index record_tags_tag_idx on public.record_tags(tag_id);
create index record_tags_record_idx on public.record_tags(record_id);

create or replace function private.current_access_level()
returns integer
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select access_level from public.profiles where id = auth.uid()), 0);
$$;

grant usage on schema private to anon, authenticated;
grant execute on function private.current_access_level() to anon, authenticated;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger records_set_updated_at
before update on public.records
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.records enable row level security;
alter table public.assets enable row level security;
alter table public.tags enable row level security;
alter table public.record_tags enable row level security;
alter table public.record_relations enable row level security;
alter table public.favorites enable row level security;
alter table public.audit_events enable row level security;

create policy "profiles self or editor read"
on public.profiles for select
to authenticated
using (id = auth.uid() or private.current_access_level() >= 2);

create policy "profiles create own viewer"
on public.profiles for insert
to authenticated
with check (id = auth.uid() and access_level = 1 and role = 'viewer');

create policy "profiles admin update"
on public.profiles for update
to authenticated
using (private.current_access_level() >= 4)
with check (private.current_access_level() >= 4);

create policy "public can read published records"
on public.records for select
to anon, authenticated
using (is_published = true and published_at <= now());

create policy "editors can read all records"
on public.records for select
to authenticated
using (private.current_access_level() >= 2);

create policy "editors can insert records"
on public.records for insert
to authenticated
with check (private.current_access_level() >= 2);

create policy "editors can update records"
on public.records for update
to authenticated
using (private.current_access_level() >= 2)
with check (private.current_access_level() >= 2);

create policy "admins can delete records"
on public.records for delete
to authenticated
using (private.current_access_level() >= 4);

create policy "public can read public assets"
on public.assets for select
to anon, authenticated
using (
  visibility = 'public'
  and exists (
    select 1 from public.records
    where records.id = assets.record_id
    and records.is_published = true
    and records.published_at <= now()
  )
);

create policy "editors can manage assets"
on public.assets for all
to authenticated
using (private.current_access_level() >= 2)
with check (private.current_access_level() >= 2);

create policy "public can read tags for published records"
on public.tags for select
to anon, authenticated
using (
  private.current_access_level() >= 2
  or exists (
    select 1
    from public.record_tags
    join public.records on records.id = record_tags.record_id
    where record_tags.tag_id = tags.id
    and records.is_published = true
    and records.published_at <= now()
  )
);

create policy "editors can manage tags"
on public.tags for all
to authenticated
using (private.current_access_level() >= 2)
with check (private.current_access_level() >= 2);

create policy "public can read published record tags"
on public.record_tags for select
to anon, authenticated
using (
  exists (
    select 1 from public.records
    where records.id = record_tags.record_id
    and records.is_published = true
    and records.published_at <= now()
  )
  or private.current_access_level() >= 2
);

create policy "editors can manage record tags"
on public.record_tags for all
to authenticated
using (private.current_access_level() >= 2)
with check (private.current_access_level() >= 2);

create policy "public can read published relations"
on public.record_relations for select
to anon, authenticated
using (
  exists (
    select 1 from public.records source
    where source.id = record_relations.source_record_id
    and source.is_published = true
    and source.published_at <= now()
  )
  and exists (
    select 1 from public.records related
    where related.id = record_relations.related_record_id
    and related.is_published = true
    and related.published_at <= now()
  )
  or private.current_access_level() >= 2
);

create policy "editors can manage relations"
on public.record_relations for all
to authenticated
using (private.current_access_level() >= 2)
with check (private.current_access_level() >= 2);

create policy "users can manage own favorites"
on public.favorites for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "editors can read audit"
on public.audit_events for select
to authenticated
using (private.current_access_level() >= 2);

create policy "editors can insert audit"
on public.audit_events for insert
to authenticated
with check (private.current_access_level() >= 2);

do $storage_setup$
begin
  if to_regclass('storage.buckets') is not null and to_regclass('storage.objects') is not null then
    insert into storage.buckets (id, name, public)
    values
      ('lua-branca-public', 'lua-branca-public', true),
      ('lua-branca-private', 'lua-branca-private', false)
    on conflict (id) do nothing;

    if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'public bucket read') then
      execute $policy$
        create policy "public bucket read"
        on storage.objects for select
        to anon, authenticated
        using (bucket_id = 'lua-branca-public')
      $policy$;
    end if;

    if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'private bucket editor read') then
      execute $policy$
        create policy "private bucket editor read"
        on storage.objects for select
        to authenticated
        using (bucket_id = 'lua-branca-private' and private.current_access_level() >= 2)
      $policy$;
    end if;

    if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'editors upload lua branca files') then
      execute $policy$
        create policy "editors upload lua branca files"
        on storage.objects for insert
        to authenticated
        with check (
          bucket_id in ('lua-branca-public', 'lua-branca-private')
          and private.current_access_level() >= 2
        )
      $policy$;
    end if;

    if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'editors update lua branca files') then
      execute $policy$
        create policy "editors update lua branca files"
        on storage.objects for update
        to authenticated
        using (
          bucket_id in ('lua-branca-public', 'lua-branca-private')
          and private.current_access_level() >= 2
        )
        with check (
          bucket_id in ('lua-branca-public', 'lua-branca-private')
          and private.current_access_level() >= 2
        )
      $policy$;
    end if;

    if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'admins delete lua branca files') then
      execute $policy$
        create policy "admins delete lua branca files"
        on storage.objects for delete
        to authenticated
        using (
          bucket_id in ('lua-branca-public', 'lua-branca-private')
          and private.current_access_level() >= 4
        )
      $policy$;
    end if;
  else
    raise notice 'Supabase storage schema unavailable; create lua-branca-public and lua-branca-private buckets from the dashboard.';
  end if;
end
$storage_setup$;
