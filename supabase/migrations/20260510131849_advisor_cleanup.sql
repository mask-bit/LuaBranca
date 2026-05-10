create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
begin
  if exists (
    select 1
    from pg_proc
    join pg_namespace on pg_namespace.oid = pg_proc.pronamespace
    where pg_namespace.nspname = 'public'
    and pg_proc.proname = 'rls_auto_enable'
  ) then
    revoke execute on function public.rls_auto_enable() from anon, authenticated;
  end if;
end;
$$;

create index if not exists assets_created_by_idx on public.assets(created_by);
create index if not exists audit_events_user_id_idx on public.audit_events(user_id);
create index if not exists favorites_record_id_idx on public.favorites(record_id);
create index if not exists record_relations_related_record_id_idx on public.record_relations(related_record_id);
create index if not exists records_cover_asset_id_idx on public.records(cover_asset_id);
create index if not exists records_created_by_idx on public.records(created_by);
create index if not exists records_updated_by_idx on public.records(updated_by);
