-- The attribution trigger is invoked by PostgreSQL as a trigger, not as an RPC.
revoke all on function public.capture_meta_quote_attribution() from public, anon, authenticated;
grant execute on function public.capture_meta_quote_attribution() to service_role;

-- Updated-at triggers also need no direct API/RPC execution grants.
revoke all on function public.meta_touch_updated_at() from public, anon, authenticated;
