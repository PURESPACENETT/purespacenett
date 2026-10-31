-- Reproducible baseline for the Meta CRM tables used by the sync functions
-- and CRM. Keep this before 20261004220000_meta_crm_actual_revenue.sql.
-- The production project already has these tables; IF NOT EXISTS makes this
-- migration safe to apply there while allowing a fresh database to build them.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public' AND t.typname = 'meta_sync_status'
  ) THEN
    CREATE TYPE public.meta_sync_status AS ENUM ('running', 'success', 'failed');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public' AND t.typname = 'meta_recommendation_status'
  ) THEN
    CREATE TYPE public.meta_recommendation_status AS ENUM ('pending', 'applied', 'dismissed', 'expired');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.meta_ad_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meta_account_id text NOT NULL UNIQUE,
  name text NOT NULL,
  currency text NOT NULL DEFAULT 'EUR',
  timezone text NOT NULL DEFAULT 'Europe/Paris',
  is_active boolean NOT NULL DEFAULT true,
  last_synced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.meta_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.meta_ad_accounts(id) ON DELETE CASCADE,
  meta_campaign_id text NOT NULL UNIQUE,
  name text NOT NULL,
  objective text,
  status text,
  effective_status text,
  daily_budget_cents integer,
  lifetime_budget_cents integer,
  start_time timestamptz,
  stop_time timestamptz,
  raw jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.meta_ad_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.meta_campaigns(id) ON DELETE CASCADE,
  meta_adset_id text NOT NULL UNIQUE,
  name text NOT NULL,
  status text,
  effective_status text,
  optimization_goal text,
  billing_event text,
  daily_budget_cents integer,
  lifetime_budget_cents integer,
  targeting jsonb NOT NULL DEFAULT '{}'::jsonb,
  raw jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.meta_ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_set_id uuid NOT NULL REFERENCES public.meta_ad_sets(id) ON DELETE CASCADE,
  meta_ad_id text NOT NULL UNIQUE,
  name text NOT NULL,
  status text,
  effective_status text,
  creative_id text,
  creative_name text,
  raw jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.meta_lead_attributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_external_id text UNIQUE,
  source text NOT NULL DEFAULT 'meta',
  quote_request_id uuid REFERENCES public.quote_requests(id) ON DELETE SET NULL,
  prospect_id uuid,
  meta_account_id text,
  meta_page_id text,
  meta_form_id text,
  meta_campaign_id text,
  meta_adset_id text,
  meta_ad_id text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  first_touch_at timestamptz,
  lead_created_at timestamptz,
  contact_name text,
  email text,
  phone text,
  raw jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.meta_conversion_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attribution_id uuid REFERENCES public.meta_lead_attributions(id) ON DELETE SET NULL,
  quote_request_id uuid REFERENCES public.quote_requests(id) ON DELETE SET NULL,
  prospect_id uuid,
  conversion_type text NOT NULL,
  revenue_amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'EUR',
  occurred_at timestamptz NOT NULL DEFAULT now(),
  source text NOT NULL DEFAULT 'crm',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.meta_insights_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.meta_ad_accounts(id) ON DELETE CASCADE,
  date date NOT NULL,
  campaign_id uuid REFERENCES public.meta_campaigns(id) ON DELETE SET NULL,
  ad_set_id uuid REFERENCES public.meta_ad_sets(id) ON DELETE SET NULL,
  ad_id uuid REFERENCES public.meta_ads(id) ON DELETE SET NULL,
  meta_campaign_id text,
  meta_adset_id text,
  meta_ad_id text,
  spend numeric NOT NULL DEFAULT 0,
  impressions bigint NOT NULL DEFAULT 0,
  reach bigint NOT NULL DEFAULT 0,
  clicks bigint NOT NULL DEFAULT 0,
  link_clicks bigint NOT NULL DEFAULT 0,
  leads integer NOT NULL DEFAULT 0,
  ctr numeric NOT NULL DEFAULT 0,
  cpc numeric NOT NULL DEFAULT 0,
  cpl numeric NOT NULL DEFAULT 0,
  conversions integer NOT NULL DEFAULT 0,
  conversion_value numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'EUR',
  raw jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  roas numeric GENERATED ALWAYS AS (conversion_value / nullif(spend, 0)) STORED,
  UNIQUE (account_id, date, meta_campaign_id, meta_adset_id, meta_ad_id)
);

CREATE TABLE IF NOT EXISTS public.meta_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid REFERENCES public.meta_ad_accounts(id) ON DELETE CASCADE,
  entity_type text NOT NULL,
  entity_id text,
  recommendation_type text NOT NULL,
  priority text NOT NULL DEFAULT 'medium',
  title text NOT NULL,
  rationale text NOT NULL,
  metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  status public.meta_recommendation_status NOT NULL DEFAULT 'pending',
  generated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  applied_at timestamptz,
  dismissed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.meta_sync_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid REFERENCES public.meta_ad_accounts(id) ON DELETE SET NULL,
  sync_type text NOT NULL,
  status public.meta_sync_status NOT NULL DEFAULT 'running',
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  rows_upserted integer NOT NULL DEFAULT 0,
  error_message text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

-- The CRM prospect table is provisioned by its own migration track. Add these
-- links whenever that table is present without making the Meta baseline depend
-- on a migration track that may be deployed separately.
DO $$
BEGIN
  IF to_regclass('public.prospects') IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'meta_lead_attributions_prospect_id_fkey') THEN
      ALTER TABLE public.meta_lead_attributions
        ADD CONSTRAINT meta_lead_attributions_prospect_id_fkey
        FOREIGN KEY (prospect_id) REFERENCES public.prospects(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'meta_conversion_events_prospect_id_fkey') THEN
      ALTER TABLE public.meta_conversion_events
        ADD CONSTRAINT meta_conversion_events_prospect_id_fkey
        FOREIGN KEY (prospect_id) REFERENCES public.prospects(id) ON DELETE SET NULL;
    END IF;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS meta_campaigns_account_idx ON public.meta_campaigns(account_id);
CREATE INDEX IF NOT EXISTS meta_ad_sets_campaign_idx ON public.meta_ad_sets(campaign_id);
CREATE INDEX IF NOT EXISTS meta_ads_adset_idx ON public.meta_ads(ad_set_id);
CREATE INDEX IF NOT EXISTS meta_attribution_campaign_idx ON public.meta_lead_attributions(meta_campaign_id, lead_created_at DESC);
CREATE INDEX IF NOT EXISTS meta_attribution_quote_idx ON public.meta_lead_attributions(quote_request_id);
CREATE INDEX IF NOT EXISTS meta_attribution_prospect_idx ON public.meta_lead_attributions(prospect_id);
CREATE UNIQUE INDEX IF NOT EXISTS meta_lead_attributions_quote_request_unique
  ON public.meta_lead_attributions(quote_request_id) WHERE quote_request_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS meta_conversion_events_attribution_idx ON public.meta_conversion_events(attribution_id);
CREATE INDEX IF NOT EXISTS meta_conversion_events_quote_request_idx ON public.meta_conversion_events(quote_request_id);
CREATE INDEX IF NOT EXISTS meta_conversion_events_prospect_idx ON public.meta_conversion_events(prospect_id);
CREATE INDEX IF NOT EXISTS meta_conversion_occurred_idx ON public.meta_conversion_events(occurred_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS meta_conversion_events_quote_request_type_uidx
  ON public.meta_conversion_events(quote_request_id, conversion_type);
CREATE INDEX IF NOT EXISTS meta_insights_date_idx ON public.meta_insights_daily(date DESC);
CREATE INDEX IF NOT EXISTS meta_insights_campaign_idx ON public.meta_insights_daily(meta_campaign_id, date DESC);
CREATE INDEX IF NOT EXISTS meta_insights_daily_campaign_idx ON public.meta_insights_daily(campaign_id);
CREATE INDEX IF NOT EXISTS meta_insights_daily_ad_set_idx ON public.meta_insights_daily(ad_set_id);
CREATE INDEX IF NOT EXISTS meta_insights_daily_ad_idx ON public.meta_insights_daily(ad_id);
CREATE INDEX IF NOT EXISTS meta_recommendations_account_idx ON public.meta_recommendations(account_id);
CREATE INDEX IF NOT EXISTS meta_recommendations_pending_idx ON public.meta_recommendations(status, priority, generated_at DESC);
CREATE INDEX IF NOT EXISTS meta_sync_runs_account_idx ON public.meta_sync_runs(account_id);

CREATE OR REPLACE FUNCTION public.meta_touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.meta_touch_updated_at() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS meta_ad_accounts_touch ON public.meta_ad_accounts;
CREATE TRIGGER meta_ad_accounts_touch BEFORE UPDATE ON public.meta_ad_accounts FOR EACH ROW EXECUTE FUNCTION public.meta_touch_updated_at();
DROP TRIGGER IF EXISTS meta_campaigns_touch ON public.meta_campaigns;
CREATE TRIGGER meta_campaigns_touch BEFORE UPDATE ON public.meta_campaigns FOR EACH ROW EXECUTE FUNCTION public.meta_touch_updated_at();
DROP TRIGGER IF EXISTS meta_ad_sets_touch ON public.meta_ad_sets;
CREATE TRIGGER meta_ad_sets_touch BEFORE UPDATE ON public.meta_ad_sets FOR EACH ROW EXECUTE FUNCTION public.meta_touch_updated_at();
DROP TRIGGER IF EXISTS meta_ads_touch ON public.meta_ads;
CREATE TRIGGER meta_ads_touch BEFORE UPDATE ON public.meta_ads FOR EACH ROW EXECUTE FUNCTION public.meta_touch_updated_at();
DROP TRIGGER IF EXISTS meta_insights_touch ON public.meta_insights_daily;
CREATE TRIGGER meta_insights_touch BEFORE UPDATE ON public.meta_insights_daily FOR EACH ROW EXECUTE FUNCTION public.meta_touch_updated_at();
DROP TRIGGER IF EXISTS meta_attributions_touch ON public.meta_lead_attributions;
CREATE TRIGGER meta_attributions_touch BEFORE UPDATE ON public.meta_lead_attributions FOR EACH ROW EXECUTE FUNCTION public.meta_touch_updated_at();

DO $$
DECLARE
  table_name text;
  command_name text;
  policy_name text;
  admin_predicate constant text := '(EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = (SELECT auth.uid()) AND ur.role::text = ''admin''))';
  meta_tables constant text[] := ARRAY[
    'meta_ad_accounts', 'meta_campaigns', 'meta_ad_sets', 'meta_ads',
    'meta_lead_attributions', 'meta_conversion_events', 'meta_insights_daily',
    'meta_recommendations', 'meta_sync_runs'
  ];
BEGIN
  FOREACH table_name IN ARRAY meta_tables LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format('REVOKE ALL PRIVILEGES ON public.%I FROM anon', table_name);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', table_name);
    EXECUTE format('GRANT ALL PRIVILEGES ON public.%I TO service_role', table_name);

    FOREACH command_name IN ARRAY ARRAY['SELECT', 'INSERT', 'UPDATE', 'DELETE'] LOOP
      policy_name := format('Admin can %s %s', lower(command_name), table_name);
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_name, table_name);
      IF command_name = 'SELECT' OR command_name = 'DELETE' THEN
        EXECUTE format('CREATE POLICY %I ON public.%I FOR %s TO authenticated USING %s', policy_name, table_name, command_name, admin_predicate);
      ELSIF command_name = 'INSERT' THEN
        EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK %s', policy_name, table_name, admin_predicate);
      ELSE
        EXECUTE format('CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING %s WITH CHECK %s', policy_name, table_name, admin_predicate, admin_predicate);
      END IF;
    END LOOP;
  END LOOP;
END
$$;
