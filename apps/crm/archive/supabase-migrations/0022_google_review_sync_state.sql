-- Persist the state of the Google Business Profile review synchronization.
-- The table is service-only; RLS is enabled with no public policies.

create table if not exists public.google_review_sync_state (
  id integer primary key,
  account_id text,
  location_id text,
  last_sync_at timestamptz,
  last_success_at timestamptz,
  last_error text,
  imported_count integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.google_review_sync_state enable row level security;
