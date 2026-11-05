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

create or replace function public.capture_meta_quote_attribution()
returns trigger
language plpgsql
security definer
set search_path = public
as $function$
begin
  if lower(coalesce(new.utm_source, '')) in ('facebook', 'instagram', 'meta', 'fb', 'ig')
     or lower(coalesce(new.utm_medium, '')) in ('cpc', 'paid_social', 'paid-social', 'meta') then
    insert into public.meta_lead_attributions (
      source,
      quote_request_id,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      lead_created_at,
      contact_name,
      email,
      phone,
      raw
    )
    values (
      'meta_web',
      new.id,
      new.utm_source,
      new.utm_medium,
      new.utm_campaign,
      new.utm_content,
      new.utm_term,
      new.created_at,
      coalesce(new.contact_name, new.full_name),
      new.email,
      new.phone,
      jsonb_build_object(
        'landing_page', new.landing_page,
        'referrer', new.referrer,
        'fbclid', new.fbclid,
        'source_system', new.source_system
      )
    )
    on conflict (quote_request_id) where quote_request_id is not null
    do update set
      utm_source = excluded.utm_source,
      utm_medium = excluded.utm_medium,
      utm_campaign = excluded.utm_campaign,
      utm_content = excluded.utm_content,
      utm_term = excluded.utm_term,
      raw = excluded.raw,
      updated_at = now();
  end if;
  return new;
end;
$function$;

drop trigger if exists quote_requests_capture_meta_attribution on public.quote_requests;
create trigger quote_requests_capture_meta_attribution
after insert or update of utm_source, utm_medium, utm_campaign, utm_content, utm_term
on public.quote_requests
for each row execute function public.capture_meta_quote_attribution();
