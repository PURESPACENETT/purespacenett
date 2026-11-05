import { z } from "zod";

/**
 * Shared, side-effect free rules for the Meta Ads optimizer.
 *
 * Recommendations are advisory only: nothing in this module (or in the CRM)
 * changes a Meta campaign, ad set, ad or budget. "applied" only records that
 * the proprietor made the change manually in Meta Ads Manager.
 */

/** Insight look-back window used to compute recommendations (Paris days). */
export const RECOMMENDATION_WINDOW_DAYS = 14;
export const RECOMMENDATION_CURRENCY = "EUR";

/** Spend without any Meta lead that triggers a review recommendation (EUR). */
export const NO_LEAD_SPEND_THRESHOLD = 50;
/** Minimum number of leads before CPL comparisons are considered meaningful. */
export const MIN_LEADS_FOR_CPL = 3;
export const LOW_CPL_RATIO = 0.7;
export const HIGH_CPL_RATIO = 1.5;

/**
 * Accepts `act_123…` or a bare numeric id and returns the `act_` form used by
 * the Graph API paths in `supabase/functions/meta-ads-sync`.
 */
export function normalizeMetaAccountId(value: string) {
  const trimmed = value.trim();
  const match = /^(?:act_)?(\d{5,20})$/i.exec(trimmed);
  return match ? `act_${match[1]}` : null;
}

const metaAccountIdSchema = z
  .string()
  .transform((value, ctx) => {
    const normalized = normalizeMetaAccountId(value);
    if (!normalized) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Identifiant de compte publicitaire invalide (format attendu : act_123456789).",
      });
      return z.NEVER;
    }
    return normalized;
  });

const accountNameSchema = z
  .string()
  .trim()
  .min(2, "Le nom du compte doit contenir au moins 2 caractères.")
  .max(120, "Le nom du compte ne peut pas dépasser 120 caractères.");

/**
 * Creation registers a new account; currency and timezone keep the database
 * defaults (EUR / Europe/Paris), which match the sync function.
 * Updates never change `meta_account_id`, so the sync linkage stays intact.
 */
export const metaAdAccountInputSchema = z.discriminatedUnion("mode", [
  z
    .object({
      mode: z.literal("create"),
      meta_account_id: metaAccountIdSchema,
      name: accountNameSchema,
      is_active: z.boolean().default(true),
    })
    .strict(),
  z
    .object({
      mode: z.literal("update"),
      id: z.string().uuid("Compte publicitaire invalide."),
      name: accountNameSchema,
      is_active: z.boolean(),
    })
    .strict(),
]);

export type MetaAdAccountInput = z.infer<typeof metaAdAccountInputSchema>;

/** Only pending recommendations can be decided; `expired` is never user-set. */
export const MANUAL_RECOMMENDATION_STATUSES = ["applied", "dismissed"] as const;

export const metaRecommendationStatusInputSchema = z
  .object({
    id: z.string().uuid("Recommandation invalide."),
    status: z.enum(MANUAL_RECOMMENDATION_STATUSES),
  })
  .strict();

export type ManualRecommendationStatus = (typeof MANUAL_RECOMMENDATION_STATUSES)[number];

export function recommendationStatusPatch(status: ManualRecommendationStatus, now: Date) {
  return status === "applied"
    ? { status, applied_at: now.toISOString() }
    : { status, dismissed_at: now.toISOString() };
}

const parisDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Paris",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** First Paris calendar date (YYYY-MM-DD) of a window of `days` days ending today. */
export function parisWindowStart(now: Date, days: number) {
  const today = parisDateFormatter.format(now);
  const [year, month, day] = today.split("-").map(Number) as [number, number, number];
  const start = new Date(Date.UTC(year, month - 1, day - (days - 1)));
  return start.toISOString().slice(0, 10);
}

export type RecommendationInsight = {
  account_id: string | null;
  meta_campaign_id: string | null;
  spend: number | string | null;
  leads: number | string | null;
  impressions?: number | string | null;
  clicks?: number | string | null;
  conversion_value?: number | string | null;
};

export type CampaignMetrics = {
  spend: number;
  leads: number;
  impressions: number;
  clicks: number;
  revenue: number;
  cpl: number | null;
  window_days: number;
  median_cpl: number | null;
};

export type RecommendationType = "pause_review" | "increase_budget" | "reduce_or_test";

export type CampaignRecommendation = {
  account_id: string | null;
  entity_type: "campaign";
  entity_id: string;
  recommendation_type: RecommendationType;
  priority: "high" | "medium";
  title: string;
  rationale: string;
  metrics: CampaignMetrics;
};

function toNumber(value: number | string | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function median(values: number[]) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2
    : (sorted[middle] ?? null);
}

const euroFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});

/**
 * Deterministic rule set ported from funnel-friendship PR #12. Input rows must
 * already be limited to the EUR recommendation window.
 */
export function buildCampaignRecommendations(
  rows: RecommendationInsight[],
  campaignNames: ReadonlyMap<string, string>,
): CampaignRecommendation[] {
  const byCampaign = new Map<
    string,
    { account_id: string | null; spend: number; leads: number; impressions: number; clicks: number; revenue: number }
  >();

  for (const row of rows) {
    if (!row.meta_campaign_id) continue;
    const current = byCampaign.get(row.meta_campaign_id) ?? {
      account_id: row.account_id,
      spend: 0,
      leads: 0,
      impressions: 0,
      clicks: 0,
      revenue: 0,
    };
    current.spend += toNumber(row.spend);
    current.leads += toNumber(row.leads);
    current.impressions += toNumber(row.impressions);
    current.clicks += toNumber(row.clicks);
    current.revenue += toNumber(row.conversion_value);
    byCampaign.set(row.meta_campaign_id, current);
  }

  // Only campaigns with enough leads for a reliable CPL feed the median, so a
  // 1–2 lead outlier cannot shift the baseline used for eligible campaigns.
  const activeCpls = [...byCampaign.values()]
    .filter((campaign) => campaign.spend > 0 && campaign.leads >= MIN_LEADS_FOR_CPL)
    .map((campaign) => campaign.spend / campaign.leads);
  const medianCpl = median(activeCpls);

  const recommendations: CampaignRecommendation[] = [];
  const sortedCampaigns = [...byCampaign.entries()].sort(([a], [b]) => a.localeCompare(b));

  for (const [campaignId, totals] of sortedCampaigns) {
    const cpl = totals.leads > 0 ? totals.spend / totals.leads : null;
    const metrics: CampaignMetrics = {
      spend: totals.spend,
      leads: totals.leads,
      impressions: totals.impressions,
      clicks: totals.clicks,
      revenue: totals.revenue,
      cpl,
      window_days: RECOMMENDATION_WINDOW_DAYS,
      median_cpl: medianCpl,
    };
    const name = campaignNames.get(campaignId) ?? campaignId;
    const base = { account_id: totals.account_id, entity_type: "campaign" as const, entity_id: campaignId, metrics };

    if (totals.spend >= NO_LEAD_SPEND_THRESHOLD && totals.leads === 0) {
      recommendations.push({
        ...base,
        recommendation_type: "pause_review",
        priority: "high",
        title: "Revoir ou suspendre cette campagne",
        rationale: `${name} a dépensé ${euroFormatter.format(totals.spend)} sur ${RECOMMENDATION_WINDOW_DAYS} jours sans lead Meta. Vérifier ciblage, formulaire et créatifs avant de continuer à investir.`,
      });
      continue;
    }

    if (medianCpl === null || medianCpl <= 0 || cpl === null || totals.leads < MIN_LEADS_FOR_CPL) continue;

    if (cpl <= medianCpl * LOW_CPL_RATIO) {
      recommendations.push({
        ...base,
        recommendation_type: "increase_budget",
        priority: "high",
        title: "Envisager une hausse progressive du budget",
        rationale: `${name} présente un CPL de ${euroFormatter.format(cpl)}, inférieur d’au moins 30 % à la médiane (${euroFormatter.format(medianCpl)}). Tester une hausse progressive dans Meta plutôt qu’un changement brutal.`,
      });
    } else if (cpl >= medianCpl * HIGH_CPL_RATIO) {
      recommendations.push({
        ...base,
        recommendation_type: "reduce_or_test",
        priority: "medium",
        title: "Réduire ou tester une nouvelle créative",
        rationale: `${name} présente un CPL de ${euroFormatter.format(cpl)}, supérieur d’au moins 50 % à la médiane (${euroFormatter.format(medianCpl)}). Tester un nouvel angle publicitaire avant d’augmenter le budget.`,
      });
    }
  }

  return recommendations;
}

export function recommendationKey(entry: { entity_type: string; entity_id: string | null; recommendation_type: string }) {
  return `${entry.entity_type}:${entry.entity_id ?? ""}:${entry.recommendation_type}`;
}

/** Pending recommendations older than this are expired (approved policy). */
export const RECOMMENDATION_TTL_DAYS = 14;
const DAY_MS = 24 * 60 * 60 * 1000;
const RECOMMENDATION_TTL_MS = RECOMMENDATION_TTL_DAYS * DAY_MS;

/** `expires_at` stored with a recommendation generated at `generatedAt`. */
export function recommendationExpiresAt(generatedAt: Date) {
  return new Date(generatedAt.getTime() + RECOMMENDATION_TTL_MS);
}

/** Pending rows generated at or before this instant are stale at `now`. */
export function recommendationExpiryCutoff(now: Date) {
  return new Date(now.getTime() - RECOMMENDATION_TTL_MS);
}

/** Timestamps for a recommendation inserted at `now`. */
export function recommendationTimestamps(now: Date) {
  return { generated_at: now.toISOString(), expires_at: recommendationExpiresAt(now).toISOString() };
}

export type PendingRecommendationTiming = { generated_at: string; expires_at: string | null };

/**
 * A pending row is fresh while it is younger than the TTL and its explicit
 * `expires_at` (if any) is still in the future. Rows created before the
 * policy have `expires_at = null` and fall back on `generated_at`.
 */
export function isPendingRecommendationFresh(row: PendingRecommendationTiming, now: Date) {
  const generatedAt = Date.parse(row.generated_at);
  if (!Number.isFinite(generatedAt) || generatedAt <= recommendationExpiryCutoff(now).getTime()) return false;
  if (row.expires_at === null) return true;
  const expiresAt = Date.parse(row.expires_at);
  return Number.isFinite(expiresAt) && expiresAt > now.getTime();
}

export function partitionPendingRecommendations<T extends PendingRecommendationTiming>(rows: readonly T[], now: Date) {
  const fresh: T[] = [];
  const stale: T[] = [];
  for (const row of rows) (isPendingRecommendationFresh(row, now) ? fresh : stale).push(row);
  return { fresh, stale };
}

/**
 * PostgREST `or` filter matching stale pending rows; the exact complement of
 * `isPendingRecommendationFresh` for valid timestamps. Values are quoted
 * because ISO timestamps contain PostgREST reserved characters (`.` and `:`).
 */
export function staleRecommendationFilter(now: Date) {
  return `generated_at.lte."${recommendationExpiryCutoff(now).toISOString()}",expires_at.lte."${now.toISOString()}"`;
}

/** PostgREST `or` filter for the `expires_at` half of the fresh predicate. */
export function freshRecommendationExpiryFilter(now: Date) {
  return `expires_at.is.null,expires_at.gt."${now.toISOString()}"`;
}
