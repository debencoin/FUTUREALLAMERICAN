-- FAA Recruit database. Run once in Supabase: SQL Editor -> New query -> paste -> Run.
-- Access rules match the original page:
--   requests, profiles   : each person reads and writes only their own document; owners read and write all
--   chatmsgs             : signed-in members read all; each person writes only their own document
--   caldays              : everyone can read (so taken days show for all); each person writes their own; owners all
--   members, featured    : owners only
--   site_state           : everyone reads; owners publish

-- Owners: add your sign-in email(s) here.
create table if not exists public.app_owners (email text primary key);
insert into public.app_owners (email) values ('fasterphysicaltherapy@gmail.com') on conflict do nothing;

create or replace function public.is_owner() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.app_owners where lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));
$$;
grant execute on function public.is_owner() to anon, authenticated;

-- One row per document. path = 'collection/doc_id'
create table if not exists public.docs (
  path text primary key,
  collection text not null,
  doc_id text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint path_matches check (path = collection || '/' || doc_id),
  constraint known_collection check (collection in ('requests','profiles','chatmsgs','caldays','members','featured'))
);
create index if not exists docs_collection_idx on public.docs (collection, updated_at desc);
alter table public.docs enable row level security;

drop policy if exists docs_read on public.docs;
create policy docs_read on public.docs for select using (
  public.is_owner()
  or collection = 'caldays'
  or (collection = 'chatmsgs' and auth.uid() is not null)
  or (collection in ('requests','profiles') and doc_id = auth.uid()::text)
);

drop policy if exists docs_insert on public.docs;
create policy docs_insert on public.docs for insert with check (
  public.is_owner()
  or (collection in ('requests','profiles','chatmsgs','caldays') and doc_id = auth.uid()::text)
);

drop policy if exists docs_update on public.docs;
create policy docs_update on public.docs for update using (
  public.is_owner()
  or (collection in ('requests','profiles','chatmsgs','caldays') and doc_id = auth.uid()::text)
) with check (
  public.is_owner()
  or (collection in ('requests','profiles','chatmsgs','caldays') and doc_id = auth.uid()::text)
);

drop policy if exists docs_delete on public.docs;
create policy docs_delete on public.docs for delete using (
  public.is_owner() or (collection in ('requests','chatmsgs','caldays') and doc_id = auth.uid()::text)
);

-- Live chat and calendar updates
alter publication supabase_realtime add table public.docs;

-- Published site data (athletes, rankings, sponsors, settings). One row, id = 1.
create table if not exists public.site_state (
  id int primary key check (id = 1),
  data jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.site_state enable row level security;
drop policy if exists site_read on public.site_state;
create policy site_read on public.site_state for select using (true);
drop policy if exists site_write on public.site_state;
create policy site_write on public.site_state for all using (public.is_owner()) with check (public.is_owner());

-- Uploads (athlete photos, highlight videos, sponsor logos, NFT art). Public read.
insert into storage.buckets (id, name, public, file_size_limit)
values ('media', 'media', true, 52428800)
on conflict (id) do update set public = true;

drop policy if exists media_read on storage.objects;
create policy media_read on storage.objects for select using (bucket_id = 'media');
drop policy if exists media_upload on storage.objects;
create policy media_upload on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists media_delete on storage.objects;
create policy media_delete on storage.objects for delete using (bucket_id = 'media' and public.is_owner());
