-- PURE SPACE NETT — Final 2026 pricing grid.
-- Idempotent production migration. The CRM production project is dgppmlkpvmvjkhsghtji.

CREATE TABLE IF NOT EXISTS public.pricing_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  min_price NUMERIC NOT NULL DEFAULT 50,
  range_spread NUMERIC NOT NULL DEFAULT 0,
  property_rates JSONB NOT NULL DEFAULT '{}'::jsonb,
  frequency_multipliers JSONB NOT NULL DEFAULT '{}'::jsonb,
  service_surcharges JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.pricing_settings TO authenticated;
GRANT ALL ON public.pricing_settings TO service_role;
ALTER TABLE public.pricing_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can read pricing" ON public.pricing_settings;
CREATE POLICY "Authenticated can read pricing"
  ON public.pricing_settings FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated can update pricing" ON public.pricing_settings;
CREATE POLICY "Authenticated can update pricing"
  ON public.pricing_settings FOR UPDATE TO authenticated USING (true);

INSERT INTO public.pricing_settings (id)
VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

UPDATE public.pricing_settings
SET min_price=50, range_spread=0,
property_rates='{"bureaux":1.25,"commerce":1.25,"immeuble":1.25,"chantier":2.3333,"logement":1.25,"autre":1.25}'::jsonb,
frequency_multipliers='{"ponctuel":1,"hebdomadaire":1,"plusieurs_semaine":1,"quotidien":1,"contrat_annuel":1}'::jsonb,
service_surcharges='{"hourly_rates":{"entretien":25,"ponctuel":30,"technique":35,"complexe":40,"dimanche":32,"ferie":32},"productivity_m2_per_hour":{"standard":20,"chantier":15,"complexe":15},"per_m2_rates":{"chantier_min":3.5,"chantier_standard":6,"chantier_max":9,"vitrerie_min":5,"vitrerie_standard":6.5,"vitrerie_max":9},"textile_ranges":{"fauteuil":{"min":45,"max":60},"canape_2_places":{"min":80,"max":125},"canape_3_places":{"min":100,"max":150},"canape_4_places":{"min":120,"max":160},"canape_angle":{"min":140,"max":160},"matelas_1_place":{"min":50,"max":60},"matelas_2_places":{"min":70,"max":90},"chaise_tissu":{"min":15,"max":20},"tapis_moquette":{"min":15,"max":20}}}'::jsonb,
updated_at=now()
WHERE id='00000000-0000-0000-0000-000000000001';
