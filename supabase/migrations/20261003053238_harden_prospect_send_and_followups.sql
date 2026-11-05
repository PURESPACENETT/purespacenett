-- Preserve delivery/follow-up state used by the CRM automations.
alter table public.quote_requests
  add column if not exists review_requested_at timestamptz;

alter table public.prospects
  add column if not exists followup_sent_at timestamptz,
  add column if not exists outreach_send_lock_at timestamptz;

create index if not exists quote_requests_review_requested_idx
  on public.quote_requests (review_requested_at);

create index if not exists prospects_followup_sent_idx
  on public.prospects (followup_sent_at);
