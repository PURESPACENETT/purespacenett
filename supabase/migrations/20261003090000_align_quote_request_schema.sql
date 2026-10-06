-- Idempotent schema alignment retained in GitHub as the source of truth.
-- Align production quote request schema with the public quote form and CRM bridge.
alter table public.quote_requests
  add column if not exists source_external_id uuid,
  add column if not exists surface_m2 numeric,
  add column if not exists services text[] not null default '{}',
  add column if not exists client_type text,
  add column if not exists city text,
  add column if not exists postal_code text,
  add column if not exists desired_date text,
  add column if not exists contact_name text,
  add column if not exists company_name text,
  add column if not exists source_system text;

create unique index if not exists quote_requests_source_external_id_uidx
  on public.quote_requests (source_external_id)
  where source_external_id is not null;

alter table public.quote_requests
  add column if not exists gclid text,
  add column if not exists gbraid text,
  add column if not exists wbraid text,
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists utm_content text,
  add column if not exists utm_term text,
  add column if not exists landing_page text,
  add column if not exists referrer text;
