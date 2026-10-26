-- Durable delivery state and idempotency for website quote submissions.
alter table public.quote_requests
  add column if not exists request_id uuid,
  add column if not exists crm_delivery_status text not null default 'pending',
  add column if not exists email_delivery_status text not null default 'pending',
  add column if not exists delivery_attempts integer not null default 0,
  add column if not exists last_delivery_attempt_at timestamptz,
  add column if not exists last_delivery_error text,
  add column if not exists crm_delivered_at timestamptz,
  add column if not exists email_delivered_at timestamptz;

create unique index if not exists quote_requests_request_id_uidx
  on public.quote_requests (request_id)
  where request_id is not null;

alter table public.quote_requests
  add constraint quote_requests_crm_delivery_status_check
    check (crm_delivery_status in ('pending', 'sent', 'error')),
  add constraint quote_requests_email_delivery_status_check
    check (email_delivery_status in ('pending', 'sent', 'error'));

comment on column public.quote_requests.request_id is
  'Stable client-generated UUID for idempotent website quote submission retries.';
comment on column public.quote_requests.crm_delivery_status is
  'Durable status of delivery to the CRM webhook.';
comment on column public.quote_requests.email_delivery_status is
  'Durable status of notification email delivery.';
