alter table public.quote_requests
  add column if not exists actual_revenue numeric(12, 2);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'quote_requests_actual_revenue_nonnegative'
      and conrelid = 'public.quote_requests'::regclass
  ) then
    alter table public.quote_requests
      add constraint quote_requests_actual_revenue_nonnegative
      check (actual_revenue is null or actual_revenue >= 0);
  end if;
end
$$;

create unique index if not exists meta_conversion_events_quote_request_type_uidx
  on public.meta_conversion_events (quote_request_id, conversion_type);

alter table public.meta_insights_daily
  add column if not exists roas numeric generated always as (
    conversion_value / nullif(spend, 0)
  ) stored;
