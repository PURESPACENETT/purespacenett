-- PURE SPACE NETT — Final 2026 pricing grid.
-- Reuses the existing pricing_settings JSON column to avoid a destructive schema change.
-- Applies the approved 25/30/35/40 EUR hourly tiers, 50 EUR minimum,
-- Sunday/public holiday 32 EUR baseline, chantier/vitrerie m² ranges and textile ranges.

UPDATE public.pricing_settings
SET
  min_price = 50,
  range_spread = 0,
  property_rates = '{
    "bureaux": 1.25,
    "commerce": 1.25,
    "immeuble": 1.25,
    "chantier": 2.3333,
    "logement": 1.25,
    "autre": 1.25
  }'::jsonb,
  frequency_multipliers = '{
    "ponctuel": 1,
    "hebdomadaire": 1,
    "plusieurs_semaine": 1,
    "quotidien": 1,
    "contrat_annuel": 1
  }'::jsonb,
  service_surcharges = '{
    "hourly_rates": {
      "entretien": 25,
      "ponctuel": 30,
      "technique": 35,
      "complexe": 40,
      "dimanche": 32,
      "ferie": 32
    },
    "productivity_m2_per_hour": {
      "standard": 20,
      "chantier": 15,
      "complexe": 15
    },
    "per_m2_rates": {
      "chantier_min": 3.5,
      "chantier_standard": 6,
      "chantier_max": 9,
      "vitrerie_min": 5,
      "vitrerie_standard": 6.5,
      "vitrerie_max": 9
    },
    "textile_ranges": {
      "fauteuil": {"min": 45, "max": 60},
      "canape_2_places": {"min": 80, "max": 125},
      "canape_3_places": {"min": 100, "max": 150},
      "canape_4_places": {"min": 120, "max": 160},
      "canape_angle": {"min": 140, "max": 160},
      "matelas_1_place": {"min": 50, "max": 60},
      "matelas_2_places": {"min": 70, "max": 90},
      "chaise_tissu": {"min": 15, "max": 20},
      "tapis_moquette": {"min": 15, "max": 20}
    }
  }'::jsonb
WHERE id = '00000000-0000-0000-0000-000000000001';

COMMENT ON COLUMN public.pricing_settings.service_surcharges IS
  'PURE SPACE NETT 2026 pricing catalog: hourly_rates, productivity_m2_per_hour, per_m2_rates and textile_ranges.';
