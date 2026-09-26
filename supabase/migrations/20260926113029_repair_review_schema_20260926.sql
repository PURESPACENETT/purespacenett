-- Repair migration for production databases where the Google review migration
-- was not applied or was only partially applied.
alter table public.review_submissions
  add column if not exists source text,
  add column if not exists source_url text,
  add column if not exists google_review_id text,
  add column if not exists google_review_name text,
  add column if not exists google_create_time timestamptz,
  add column if not exists google_update_time timestamptz,
  add column if not exists google_raw jsonb;

update public.review_submissions
set source = 'site'
where source is null;

alter table public.review_submissions
  alter column source set default 'site',
  alter column source set not null;

alter table public.review_submissions
  drop constraint if exists review_submissions_source_check;

alter table public.review_submissions
  add constraint review_submissions_source_check
  check (source in ('site', 'google'));

create unique index if not exists review_submissions_google_review_id_uidx
  on public.review_submissions (google_review_id)
  where google_review_id is not null;

create index if not exists review_submissions_source_status_created_idx
  on public.review_submissions (source, status, created_at desc);

drop function if exists public.get_published_reviews();

create function public.get_published_reviews()
returns table (
  id uuid,
  author_name text,
  city text,
  service_type text,
  rating smallint,
  message text,
  created_at timestamptz,
  source text,
  source_url text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    id,
    author_name,
    city,
    service_type,
    rating,
    message,
    created_at,
    source,
    source_url
  from public.review_submissions
  where status = 'publié'
  order by created_at desc
  limit 200
$$;

revoke all on function public.get_published_reviews() from public;
grant execute on function public.get_published_reviews() to anon, authenticated, service_role;
