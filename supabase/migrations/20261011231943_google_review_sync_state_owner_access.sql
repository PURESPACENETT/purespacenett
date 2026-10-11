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
create policy "Owner can view Google review sync state"
  on public.google_review_sync_state for select to authenticated
  using (lower((select auth.jwt() ->> 'email')) = 'contact@purespacenett.com');
revoke all on public.google_review_sync_state from anon, public;
grant select on public.google_review_sync_state to authenticated;
grant all on public.google_review_sync_state to service_role;

create unique index if not exists review_submissions_google_review_id_full_uidx
  on public.review_submissions (google_review_id);
