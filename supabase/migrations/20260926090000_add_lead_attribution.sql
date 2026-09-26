-- Conversion attribution for website and Google Ads leads.
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

create unique index if not exists quote_requests_source_external_id_uidx
  on public.quote_requests (source_external_id)
  where source_external_id is not null;

create index if not exists quote_requests_gclid_idx
  on public.quote_requests (gclid)
  where gclid is not null;

create index if not exists quote_requests_utm_campaign_idx
  on public.quote_requests (utm_campaign)
  where utm_campaign is not null;
