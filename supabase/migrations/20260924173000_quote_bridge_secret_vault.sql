-- Shared quote bridge secret is stored in Supabase Vault, not in Lovable build secrets.
-- The actual Vault secret is provisioned separately in the production Supabase project.
create or replace function public.get_quote_webhook_secret()
returns text
language sql
security definer
set search_path = ''
as $$
  select decrypted_secret
  from vault.decrypted_secrets
  where name = 'purespacenett_quote_bridge_secret'
  limit 1;
$$;

revoke all on function public.get_quote_webhook_secret() from public, anon, authenticated;
grant execute on function public.get_quote_webhook_secret() to service_role;
