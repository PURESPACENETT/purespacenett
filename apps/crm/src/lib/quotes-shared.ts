import { z } from "zod";

export const CLIENT_TYPES = [
  { value: "entreprise", label: "Entreprise" },
  { value: "sous_traitance", label: "Sous-traitance" },
  { value: "particulier", label: "Particulier" },
] as const;

export const PROPERTY_TYPES = [
  { value: "bureaux", label: "Bureaux" },
  { value: "commerce", label: "Commerce / local" },
  { value: "immeuble", label: "Immeuble / copropriété" },
  { value: "chantier", label: "Chantier" },
  { value: "logement", label: "Logement" },
  { value: "autre", label: "Autre" },
] as const;

export const FREQUENCIES = [
  { value: "ponctuel", label: "Ponctuel (une seule fois)" },
  { value: "hebdomadaire", label: "1 fois par semaine" },
  { value: "plusieurs_semaine", label: "Plusieurs fois par semaine" },
  { value: "quotidien", label: "Tous les jours" },
  { value: "contrat_annuel", label: "Contrat annuel" },
] as const;

export const SERVICES = [
  { value: "nettoyage_courant", label: "Nettoyage courant" },
  { value: "vitrerie", label: "Vitrerie" },
  { value: "remise_en_etat", label: "Remise en état" },
  { value: "fin_de_chantier", label: "Fin de chantier" },
  { value: "desinfection", label: "Désinfection" },
] as const;

export const STATUSES = [
  { value: "nouveau", label: "Nouveau" },
  { value: "contacte", label: "Contacté" },
  { value: "devis_envoye", label: "Devis envoyé" },
  { value: "gagne", label: "Gagné" },
  { value: "perdu", label: "Perdu" },
] as const;

export type StatusValue = (typeof STATUSES)[number]["value"];

export function labelOf(
  list: ReadonlyArray<{ value: string; label: string }>,
  value: string,
): string {
  return list.find((item) => item.value === value)?.label ?? value;
}

export const quoteRequestSchema = z.object({
  clientType: z.enum(["entreprise", "sous_traitance", "particulier"]),
  propertyType: z.enum(["bureaux", "commerce", "immeuble", "chantier", "logement", "autre"]),
  surfaceM2: z.coerce.number().int().min(1, "Surface requise").max(200000),
  rooms: z.coerce.number().int().min(0).max(5000).optional(),
  frequency: z.enum([
    "ponctuel",
    "hebdomadaire",
    "plusieurs_semaine",
    "quotidien",
    "contrat_annuel",
  ]),
  services: z
    .array(
      z.enum([
        "nettoyage_courant",
        "vitrerie",
        "remise_en_etat",
        "fin_de_chantier",
        "desinfection",
        "textile",
        "forte_salissure",
        "complexe",
      ]),
    )
    .min(1, "Choisissez au moins une prestation"),
  city: z.string().trim().min(1, "Ville requise").max(120),
  postalCode: z.string().trim().min(4, "Code postal requis").max(10),
  desiredDate: z.string().trim().max(20).optional().or(z.literal("")),
  contactName: z.string().trim().min(2, "Nom requis").max(120),
  companyName: z.string().trim().max(160).optional().or(z.literal("")),
  email: z.string().trim().email("Adresse email invalide").max(255),
  phone: z.string().trim().min(6, "Téléphone requis").max(30),
  message: z.string().trim().max(1500).optional().or(z.literal("")),
});

export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>;

export interface PricingSettings {
  min_price: number;
  range_spread: number;
  property_rates: Record<string, number>;
  frequency_multipliers: Record<string, number>;
  service_surcharges: {
    hourly_rates: {
      entretien: number;
      ponctuel: number;
      technique: number;
      complexe: number;
      dimanche: number;
      ferie: number;
    };
    productivity_m2_per_hour: {
      standard: number;
      chantier: number;
      complexe: number;
    };
    per_m2_rates: {
      chantier_min: number;
      chantier_standard: number;
      chantier_max: number;
      vitrerie_min: number;
      vitrerie_standard: number;
      vitrerie_max: number;
    };
    textile_ranges: Record<string, { min: number; max: number }>;
  };
}

const DEFAULT_SERVICE_PRICING: PricingSettings["service_surcharges"] = {
  hourly_rates: {
    entretien: 25,
    ponctuel: 30,
    technique: 35,
    complexe: 40,
    dimanche: 32,
    ferie: 32,
  },
  productivity_m2_per_hour: {
    standard: 20,
    chantier: 15,
    complexe: 15,
  },
  per_m2_rates: {
    chantier_min: 3.5,
    chantier_standard: 6,
    chantier_max: 9,
    vitrerie_min: 5,
    vitrerie_standard: 6.5,
    vitrerie_max: 9,
  },
  textile_ranges: {
    fauteuil: { min: 45, max: 60 },
    canape_2_places: { min: 80, max: 125 },
    canape_3_places: { min: 100, max: 150 },
    canape_4_places: { min: 120, max: 160 },
    canape_angle: { min: 140, max: 160 },
    matelas_1_place: { min: 50, max: 60 },
    matelas_2_places: { min: 70, max: 90 },
    chaise_tissu: { min: 15, max: 20 },
    tapis_moquette: { min: 15, max: 20 },
  },
};

export const DEFAULT_PRICING: PricingSettings = {
  min_price: 50,
  range_spread: 0,
  property_rates: {
    bureaux: 1.25,
    commerce: 1.25,
    immeuble: 1.25,
    chantier: 2.3333,
    logement: 1.25,
    autre: 1.25,
  },
  frequency_multipliers: {
    ponctuel: 1,
    hebdomadaire: 1,
    plusieurs_semaine: 1,
    quotidien: 1,
    contrat_annuel: 1,
  },
  service_surcharges: DEFAULT_SERVICE_PRICING,
};

function isFrenchPublicHoliday(value?: string): boolean {
  if (!value) return false;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return false;

  const monthDay = `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  if (["01-01", "05-01", "05-08", "07-14", "08-15", "11-01", "11-11", "12-25"].includes(monthDay)) {
    return true;
  }

  const year = date.getFullYear();
  const easter = (() => {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
  })();

  const diff = Math.round((date.getTime() - easter.getTime()) / 86400000);
  return diff === 1 || diff === 39 || diff === 50;
}

function normalizeServicePricing(value: unknown): PricingSettings["service_surcharges"] {
  const candidate = value as Partial<PricingSettings["service_surcharges"]> | null;
  if (!candidate || typeof candidate !== "object" || !candidate.hourly_rates) {
    return DEFAULT_SERVICE_PRICING;
  }
  return {
    hourly_rates: { ...DEFAULT_SERVICE_PRICING.hourly_rates, ...candidate.hourly_rates },
    productivity_m2_per_hour: {
      ...DEFAULT_SERVICE_PRICING.productivity_m2_per_hour,
      ...candidate.productivity_m2_per_hour,
    },
    per_m2_rates: { ...DEFAULT_SERVICE_PRICING.per_m2_rates, ...candidate.per_m2_rates },
    textile_ranges: { ...DEFAULT_SERVICE_PRICING.textile_ranges, ...candidate.textile_ranges },
  };
}

function hasService(input: Pick<QuoteRequestInput, "services">, key: string): boolean {
  return input.services.includes(key as never);
}

export function estimatePrice(
  input: Pick<QuoteRequestInput, "propertyType" | "surfaceM2" | "frequency" | "services"> & {
    desiredDate?: string;
  },
  pricing: PricingSettings,
): { min: number; max: number } {
  const servicePricing = normalizeServicePricing(pricing.service_surcharges);
  const surface = Math.max(1, input.surfaceM2);

  if (hasService(input, "vitrerie")) {
    const min = Math.max(pricing.min_price, surface * servicePricing.per_m2_rates.vitrerie_min);
    const max = Math.max(pricing.min_price, surface * servicePricing.per_m2_rates.vitrerie_max);
    return {
      min: Math.round(min / 5) * 5,
      max: Math.round(max / 5) * 5,
    };
  }

  if (hasService(input, "textile")) {
    const ranges = Object.values(servicePricing.textile_ranges);
    const min = Math.max(pricing.min_price, Math.min(...ranges.map((range) => range.min)));
    const max = Math.max(pricing.min_price, Math.max(...ranges.map((range) => range.max)));
    return { min, max };
  }

  const technical =
    hasService(input, "fin_de_chantier") ||
    hasService(input, "remise_en_etat") ||
    hasService(input, "desinfection") ||
    input.propertyType === "chantier";
  const complex = input.services.some((service) => service === "forte_salissure" || service === "complexe");
  const tier = complex ? "complexe" : technical ? "technique" : input.frequency === "ponctuel" ? "ponctuel" : "entretien";
  const isSunday = input.desiredDate
    ? new Date(`${input.desiredDate}T00:00:00`).getDay() === 0
    : false;
  const isHoliday = isFrenchPublicHoliday(input.desiredDate);
  const specialRate = isHoliday
    ? servicePricing.hourly_rates.ferie
    : isSunday
      ? servicePricing.hourly_rates.dimanche
      : 0;
  const hourlyRate = Math.max(servicePricing.hourly_rates[tier], specialRate);
  const productivity = technical || complex
    ? (complex ? servicePricing.productivity_m2_per_hour.complexe : servicePricing.productivity_m2_per_hour.chantier)
    : servicePricing.productivity_m2_per_hour.standard;
  const estimate = Math.max(pricing.min_price, surface * (hourlyRate / productivity));
  const rounded = Math.round(estimate / 5) * 5;
  return { min: rounded, max: rounded };
}

const RECURRING = new Set(["hebdomadaire", "plusieurs_semaine", "quotidien", "contrat_annuel"]);

export function scoreRequest(
  input: Pick<QuoteRequestInput, "clientType" | "frequency" | "surfaceM2" | "services">,
): number {
  let score = 20;
  if (input.clientType === "entreprise") score += 25;
  if (input.clientType === "sous_traitance") score += 20;
  if (RECURRING.has(input.frequency)) score += 25;
  if (input.frequency === "contrat_annuel" || input.frequency === "quotidien") score += 10;
  if (input.surfaceM2 >= 200) score += 10;
  if (input.surfaceM2 >= 800) score += 10;
  if (input.services.length > 1) score += 5;
  return Math.min(100, score);
}

export function scoreLabel(score: number): "Haute" | "Moyenne" | "Basse" {
  if (score >= 70) return "Haute";
  if (score >= 45) return "Moyenne";
  return "Basse";
}

export function formatEuros(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}
