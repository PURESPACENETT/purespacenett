alter table public.review_submissions
  add column if not exists source text not null default 'site',
  add column if not exists google_review_id text,
  add column if not exists source_url text,
  add column if not exists google_review_name text,
  add column if not exists google_create_time timestamptz,
  add column if not exists google_update_time timestamptz,
  add column if not exists google_raw jsonb;

alter table public.review_submissions
  drop constraint if exists review_submissions_source_check;
alter table public.review_submissions
  add constraint review_submissions_source_check check (source in ('site','google'));

create unique index if not exists review_submissions_google_review_id_uidx
  on public.review_submissions (google_review_id) where google_review_id is not null;
create index if not exists review_submissions_source_status_created_idx
  on public.review_submissions (source, status, created_at desc);

drop policy if exists "Public can view published reviews" on public.review_submissions;
create policy "Public can view published reviews"
  on public.review_submissions for select to anon, authenticated
  using (status = 'publié');

drop function if exists public.get_published_reviews();
create function public.get_published_reviews()
returns table (id uuid, author_name text, city text, service_type text, rating smallint, message text, created_at timestamptz, source text, source_url text)
language sql stable security definer set search_path = public
as $$
  select id, author_name, city, service_type, rating, message, created_at, source, source_url
  from public.review_submissions
  where status = 'publié'
  order by created_at desc
  limit 200
$$;
revoke all on function public.get_published_reviews() from public;
grant execute on function public.get_published_reviews() to anon, authenticated, service_role;

create table if not exists public.google_review_sync_state (
  id integer primary key default 1 check (id = 1),
  account_id text,
  location_id text,
  last_sync_at timestamptz,
  last_success_at timestamptz,
  last_error text,
  imported_count integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.google_review_sync_state enable row level security;
drop policy if exists "Admins can view Google review sync state" on public.google_review_sync_state;
create policy "Admins can view Google review sync state"
  on public.google_review_sync_state for select to authenticated
  using (exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid() and ur.role = 'admin'::public.app_role
  ));
grant select on public.google_review_sync_state to authenticated;
grant all on public.google_review_sync_state to service_role;
create or replace function public.get_google_review_config()
returns jsonb
language sql
security definer
set search_path = public, vault
as $$
  select decrypted_secret::jsonb
  from vault.decrypted_secrets
  where name = 'google_business_profile_credentials'
  limit 1
$$;
revoke all on function public.get_google_review_config() from public;
grant execute on function public.get_google_review_config() to service_role;
