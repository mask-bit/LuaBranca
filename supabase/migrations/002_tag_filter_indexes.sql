create index if not exists record_tags_tag_idx on public.record_tags(tag_id);
create index if not exists record_tags_record_idx on public.record_tags(record_id);
