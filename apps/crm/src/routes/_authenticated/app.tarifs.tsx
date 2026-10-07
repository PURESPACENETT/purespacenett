import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { getPricing, updatePricing } from "@/lib/quotes.functions";
import { DEFAULT_PRICING, type PricingSettings } from "@/lib/quotes-shared";

export const Route = createFileRoute("/_authenticated/app/tarifs")({
  head: () => ({
    meta: [
      { title: "Tarifs — PURE SPACE NETT" },
      { name: "description", content: "Grille tarifaire 2026 utilisée pour les estimations." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PricingPage,
});

type Form = PricingSettings & { notify_email: string };

function PricingPage() {
  const queryClient = useQueryClient();
  const fetchPricing = useServerFn(getPricing);
  const savePricing = useServerFn(updatePricing);

  const { data, isLoading } = useQuery({
    queryKey: ["pricing"],
    queryFn: () => fetchPricing(),
  });

  const [form, setForm] = useState<Form>({ ...DEFAULT_PRICING, notify_email: "" });

  useEffect(() => {
    if (data) setForm(data as Form);
  }, [data]);

  const mutation = useMutation({
    mutationFn: (payload: Form) => savePricing({ data: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricing"] });
      toast.success("Grille tarifaire 2026 enregistrée");
    },
    onError: () => toast.error("Enregistrement impossible"),
  });

  if (isLoading) return <Skeleton className="h-96 rounded-xl" />;

  const setHourly = (key: keyof PricingSettings["service_surcharges"]["hourly_rates"], value: number) =>
    setForm((prev) => ({
      ...prev,
      service_surcharges: {
        ...prev.service_surcharges,
        hourly_rates: { ...prev.service_surcharges.hourly_rates, [key]: value },
      },
    }));

  const setM2 = (key: keyof PricingSettings["service_surcharges"]["per_m2_rates"], value: number) =>
    setForm((prev) => ({
      ...prev,
      service_surcharges: {
        ...prev.service_surcharges,
        per_m2_rates: { ...prev.service_surcharges.per_m2_rates, [key]: value },
      },
    }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl text-foreground">Tarifs 2026 & notifications</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Référentiel central utilisé par le CRM pour calculer les estimations de devis.
        </p>
      </div>

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-base text-foreground">Règles générales</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <NumberField
            label="Minimum d’intervention (€)"
            value={form.min_price}
            step={5}
            onChange={(v) => setForm((p) => ({ ...p, min_price: v }))}
          />
          <NumberField
            label="Rendement courant (m²/h)"
            value={form.service_surcharges.productivity_m2_per_hour.standard}
            step={1}
            onChange={(v) =>
              setForm((p) => ({
                ...p,
                service_surcharges: {
                  ...p.service_surcharges,
                  productivity_m2_per_hour: {
                    ...p.service_surcharges.productivity_m2_per_hour,
                    standard: v,
                  },
                },
              }))
            }
          />
          <div className="space-y-1.5">
            <Label htmlFor="notify">Email d’alerte</Label>
            <Input
              id="notify"
              type="email"
              value={form.notify_email}
              onChange={(e) => setForm((p) => ({ ...p, notify_email: e.target.value }))}
              placeholder="contact@purespacenett.com"
            />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-base text-foreground">Tarifs horaires</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {([
            ["entretien", "Entretien régulier"],
            ["ponctuel", "Ponctuel / grand nettoyage"],
            ["technique", "Technique / remise en état / chantier"],
            ["complexe", "Complexe / forte salissure"],
            ["dimanche", "Dimanche"],
            ["ferie", "Jour férié"],
          ] as const).map(([key, label]) => (
            <NumberField
              key={key}
              label={label}
              value={form.service_surcharges.hourly_rates[key]}
              step={1}
              onChange={(v) => setHourly(key, v)}
            />
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-base text-foreground">Tarifs au m²</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {([
            ["chantier_min", "Fin de chantier — bas"],
            ["chantier_standard", "Fin de chantier — standard"],
            ["chantier_max", "Fin de chantier — haut"],
            ["vitrerie_min", "Vitrerie — bas"],
            ["vitrerie_standard", "Vitrerie — standard"],
            ["vitrerie_max", "Vitrerie — haut"],
          ] as const).map(([key, label]) => (
            <NumberField
              key={key}
              label={`${label} (€ / m²)`}
              value={form.service_surcharges.per_m2_rates[key]}
              step={0.5}
              onChange={(v) => setM2(key, v)}
            />
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Référentiel : chantier 3,50–9 €/m² ; vitrerie 5–9 €/m².
        </p>
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-base text-foreground">Rendements techniques</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <NumberField
            label="Chantier / remise en état (m²/h)"
            value={form.service_surcharges.productivity_m2_per_hour.chantier}
            step={1}
            onChange={(v) =>
              setForm((p) => ({
                ...p,
                service_surcharges: {
                  ...p.service_surcharges,
                  productivity_m2_per_hour: {
                    ...p.service_surcharges.productivity_m2_per_hour,
                    chantier: v,
                  },
                },
              }))
            }
          />
          <NumberField
            label="Complexe (m²/h)"
            value={form.service_surcharges.productivity_m2_per_hour.complexe}
            step={1}
            onChange={(v) =>
              setForm((p) => ({
                ...p,
                service_surcharges: {
                  ...p.service_surcharges,
                  productivity_m2_per_hour: {
                    ...p.service_surcharges.productivity_m2_per_hour,
                    complexe: v,
                  },
                },
              }))
            }
          />
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-base text-foreground">Textile — fourchettes</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(form.service_surcharges.textile_ranges).map(([key, range]) => (
            <div key={key} className="rounded-lg border border-border p-3">
              <p className="text-sm font-medium">{textileLabel(key)}</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <NumberField
                  label="Min €"
                  value={range.min}
                  step={5}
                  onChange={(v) =>
                    setForm((p) => ({
                      ...p,
                      service_surcharges: {
                        ...p.service_surcharges,
                        textile_ranges: {
                          ...p.service_surcharges.textile_ranges,
                          [key]: { ...range, min: v },
                        },
                      },
                    }))
                  }
                />
                <NumberField
                  label="Max €"
                  value={range.max}
                  step={5}
                  onChange={(v) =>
                    setForm((p) => ({
                      ...p,
                      service_surcharges: {
                        ...p.service_surcharges,
                        textile_ranges: {
                          ...p.service_surcharges.textile_ranges,
                          [key]: { ...range, max: v },
                        },
                      },
                    }))
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex gap-2">
        <Button onClick={() => mutation.mutate(form)} disabled={mutation.isPending}>
          {mutation.isPending ? "Enregistrement..." : "Enregistrer la grille"}
        </Button>
        <Button
          variant="outline"
          onClick={() => setForm({ ...DEFAULT_PRICING, notify_email: form.notify_email })}
        >
          Réinitialiser
        </Button>
      </div>
    </div>
  );
}

function textileLabel(key: string): string {
  return {
    fauteuil: "Fauteuil",
    canape_2_places: "Canapé 2 places",
    canape_3_places: "Canapé 3 places",
    canape_4_places: "Canapé 4 places",
    canape_angle: "Canapé d’angle",
    matelas_1_place: "Matelas 1 place",
    matelas_2_places: "Matelas 2 places",
    chaise_tissu: "Chaise tissu",
    tapis_moquette: "Tapis / moquette",
  }[key] ?? key;
}

function NumberField({
  label,
  value,
  step,
  onChange,
}: {
  label: string;
  value: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input
        type="number"
        step={step}
        min={0}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
