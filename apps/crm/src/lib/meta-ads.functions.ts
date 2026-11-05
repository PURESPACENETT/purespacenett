import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";

import { requireSupabaseStaff } from "@/integrations/supabase/staff-middleware";
import {
  RECOMMENDATION_CURRENCY,
  RECOMMENDATION_WINDOW_DAYS,
  buildCampaignRecommendations,
  freshRecommendationExpiryFilter,
  metaAdAccountInputSchema,
  metaRecommendationStatusInputSchema,
  parisWindowStart,
  partitionPendingRecommendations,
  recommendationExpiryCutoff,
  recommendationKey,
  recommendationStatusPatch,
  recommendationTimestamps,
  staleRecommendationFilter,
  type PendingRecommendationTiming,
  type RecommendationInsight,
} from "@/lib/meta-ads-shared";

const UNIQUE_VIOLATION = "23505";
const INSIGHT_PAGE_SIZE = 1000;

function metaClient(supabase: object) {
  // Meta tables are not part of the generated CRM database types.
  return supabase as unknown as SupabaseClient;
}

function logMetaError(operation: string, error: { message: string; code?: string }) {
  console.error(`Meta Ads ${operation} failed`, error.code ?? "", error.message);
}

type InsightRow = {
  date: string;
  spend: number | null;
  conversion_value: number | null;
  currency: string | null;
};

export const listMetaAdsPerformance = createServerFn({ method: "GET" })
  .middleware([requireSupabaseStaff])
  .handler(async ({ context }) => {
    const metaDb = context.supabase as unknown as SupabaseClient;
    const end = new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - 29);

    const { data, error } = await metaDb
      .from("meta_insights_daily")
      .select("date,spend,conversion_value,currency")
      .eq("currency", "EUR")
      .gte("date", start.toISOString().slice(0, 10))
      .lte("date", end.toISOString().slice(0, 10))
      .order("date", { ascending: false });

    if (error) throw new Error("Impossible de charger les performances Meta Ads.");

    const byDate = new Map<string, { spend: number; revenue: number }>();
    for (const row of (data ?? []) as InsightRow[]) {
      const current = byDate.get(row.date) ?? { spend: 0, revenue: 0 };
      current.spend += Number(row.spend ?? 0);
      current.revenue += Number(row.conversion_value ?? 0);
      byDate.set(row.date, current);
    }

    const days = [...byDate.entries()]
      .map(([date, values]) => ({
        date,
        spend: values.spend,
        revenue: values.revenue,
        roas: values.spend > 0 ? values.revenue / values.spend : null,
      }))
      .sort((a, b) => b.date.localeCompare(a.date));

    const totals = days.reduce(
      (result, day) => ({
        spend: result.spend + day.spend,
        revenue: result.revenue + day.revenue,
      }),
      { spend: 0, revenue: 0 },
    );

    return {
      days,
      totals: {
        ...totals,
        roas: totals.spend > 0 ? totals.revenue / totals.spend : null,
      },
    };
  });

export type MetaAdAccountRow = {
  id: string;
  meta_account_id: string;
  name: string;
  currency: string;
  timezone: string;
  is_active: boolean;
  last_synced_at: string | null;
};

export type MetaRecommendationRow = {
  id: string;
  account_id: string | null;
  entity_type: string;
  entity_id: string | null;
  recommendation_type: string;
  priority: string;
  title: string;
  rationale: string;
  generated_at: string;
  expires_at: string | null;
};

const ACCOUNT_COLUMNS = "id,meta_account_id,name,currency,timezone,is_active,last_synced_at";
const RECOMMENDATION_COLUMNS =
  "id,account_id,entity_type,entity_id,recommendation_type,priority,title,rationale,generated_at,expires_at";

/**
 * Ad accounts and fresh pending advisory recommendations for the proprietor.
 * Pending rows older than the 14-day TTL are hidden (read-only: they are only
 * marked `expired` when a new analysis is requested).
 */
export const getMetaAdsOptimizer = createServerFn({ method: "GET" })
  .middleware([requireSupabaseStaff])
  .handler(async ({ context }) => {
    const metaDb = metaClient(context.supabase);
    const now = new Date();
    const [accountsResult, recommendationsResult] = await Promise.all([
      metaDb.from("meta_ad_accounts").select(ACCOUNT_COLUMNS).order("created_at", { ascending: true }),
      metaDb
        .from("meta_recommendations")
        .select(RECOMMENDATION_COLUMNS)
        .eq("status", "pending")
        .gt("generated_at", recommendationExpiryCutoff(now).toISOString())
        .or(freshRecommendationExpiryFilter(now))
        .order("generated_at", { ascending: false })
        .limit(50),
    ]);

    if (accountsResult.error) {
      logMetaError("account listing", accountsResult.error);
      throw new Error("Impossible de charger les comptes publicitaires Meta.");
    }
    if (recommendationsResult.error) {
      logMetaError("recommendation listing", recommendationsResult.error);
      throw new Error("Impossible de charger les recommandations Meta Ads.");
    }

    return {
      accounts: (accountsResult.data ?? []) as MetaAdAccountRow[],
      // Defensive in-memory check with the same predicate as the query filters.
      recommendations: partitionPendingRecommendations(
        (recommendationsResult.data ?? []) as MetaRecommendationRow[],
        now,
      ).fresh,
    };
  });

/** Registers, renames or (de)activates an ad account. Never contacts Meta. */
export const saveMetaAdAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseStaff])
  .validator((input: unknown) => metaAdAccountInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const metaDb = metaClient(context.supabase);

    if (data.mode === "create") {
      const { data: account, error } = await metaDb
        .from("meta_ad_accounts")
        .insert({ meta_account_id: data.meta_account_id, name: data.name, is_active: data.is_active })
        .select(ACCOUNT_COLUMNS)
        .single();
      if (error) {
        if (error.code === UNIQUE_VIOLATION) {
          throw new Error("Ce compte publicitaire est déjà enregistré.");
        }
        logMetaError("account creation", error);
        throw new Error("Impossible d’enregistrer le compte publicitaire.");
      }
      return account as MetaAdAccountRow;
    }

    const { data: account, error } = await metaDb
      .from("meta_ad_accounts")
      .update({ name: data.name, is_active: data.is_active })
      .eq("id", data.id)
      .select(ACCOUNT_COLUMNS)
      .maybeSingle();
    if (error) {
      logMetaError("account update", error);
      throw new Error("Impossible de mettre à jour le compte publicitaire.");
    }
    if (!account) throw new Error("Compte publicitaire introuvable.");
    return account as MetaAdAccountRow;
  });

/**
 * Records the proprietor's decision on a pending recommendation. "applied"
 * means the change was made manually in Meta Ads Manager; nothing is sent to Meta.
 * Only fresh pending rows (same predicate as `getMetaAdsOptimizer`) can be
 * updated, so an expired recommendation cannot be acted upon via a direct call.
 */
export const setMetaRecommendationStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseStaff])
  .validator((input: unknown) => metaRecommendationStatusInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const metaDb = metaClient(context.supabase);
    const now = new Date();
    const { data: updated, error } = await metaDb
      .from("meta_recommendations")
      .update(recommendationStatusPatch(data.status, now))
      .eq("id", data.id)
      .eq("status", "pending")
      .gt("generated_at", recommendationExpiryCutoff(now).toISOString())
      .or(freshRecommendationExpiryFilter(now))
      .select("id")
      .maybeSingle();

    if (error) {
      logMetaError("recommendation status update", error);
      throw new Error("Impossible de mettre à jour la recommandation.");
    }
    if (!updated) throw new Error("Recommandation introuvable, expirée ou déjà traitée.");
    return { id: data.id, status: data.status };
  });

type PendingRecommendationKey = PendingRecommendationTiming & {
  entity_type: string;
  entity_id: string | null;
  recommendation_type: string;
};

/**
 * Computes advisory campaign recommendations from the last 14 Paris days of
 * EUR insights already stored in Supabase. Makes no call to Meta.
 *
 * Pending recommendations past their 14-day TTL are first marked `expired`;
 * if that fails nothing is computed or inserted.
 */
export const generateMetaRecommendations = createServerFn({ method: "POST" })
  .middleware([requireSupabaseStaff])
  .handler(async ({ context }) => {
    const metaDb = metaClient(context.supabase);
    const now = new Date();

    const { data: expiredRows, error: expireError } = await metaDb
      .from("meta_recommendations")
      .update({ status: "expired" })
      .eq("status", "pending")
      .or(staleRecommendationFilter(now))
      .select("id");
    if (expireError) {
      logMetaError("recommendation expiry", expireError);
      throw new Error(
        "Impossible d’expirer les anciennes recommandations Meta Ads : aucune nouvelle recommandation n’a été enregistrée.",
      );
    }
    const expired = (expiredRows ?? []).length;

    const since = parisWindowStart(now, RECOMMENDATION_WINDOW_DAYS);

    const loadInsights = async () => {
      const rows: RecommendationInsight[] = [];
      for (let from = 0; ; from += INSIGHT_PAGE_SIZE) {
        const { data, error } = await metaDb
          .from("meta_insights_daily")
          .select("account_id,meta_campaign_id,spend,leads,impressions,clicks,conversion_value")
          .eq("currency", RECOMMENDATION_CURRENCY)
          .gte("date", since)
          .order("id", { ascending: true })
          .range(from, from + INSIGHT_PAGE_SIZE - 1);
        if (error) return { data: null, error };
        rows.push(...((data ?? []) as RecommendationInsight[]));
        if ((data ?? []).length < INSIGHT_PAGE_SIZE) return { data: rows, error: null };
      }
    };

    const [insightsResult, campaignsResult, pendingResult] = await Promise.all([
      loadInsights(),
      metaDb.from("meta_campaigns").select("meta_campaign_id,name"),
      metaDb
        .from("meta_recommendations")
        .select("entity_type,entity_id,recommendation_type,generated_at,expires_at")
        .eq("status", "pending"),
    ]);

    const failure = insightsResult.error ?? campaignsResult.error ?? pendingResult.error;
    if (failure) {
      logMetaError("recommendation inputs loading", failure);
      throw new Error("Impossible de calculer les recommandations Meta Ads.");
    }

    const names = new Map(
      ((campaignsResult.data ?? []) as { meta_campaign_id: string; name: string }[]).map((campaign) => [
        campaign.meta_campaign_id,
        campaign.name,
      ]),
    );
    // Only fresh pending rows block a new identical recommendation.
    const pendingKeys = new Set(
      partitionPendingRecommendations((pendingResult.data ?? []) as PendingRecommendationKey[], now).fresh.map(
        recommendationKey,
      ),
    );

    const timestamps = recommendationTimestamps(now);
    const candidates = buildCampaignRecommendations(insightsResult.data ?? [], names)
      .filter((recommendation) => !pendingKeys.has(recommendationKey(recommendation)))
      .map((recommendation) => ({ ...recommendation, ...timestamps }));

    if (candidates.length === 0) return { generated: 0, expired };

    const { data: inserted, error } = await metaDb
      .from("meta_recommendations")
      .insert(candidates)
      .select("id");
    if (error) {
      logMetaError("recommendation insert", error);
      throw new Error("Impossible d’enregistrer les recommandations Meta Ads.");
    }

    return { generated: (inserted ?? []).length, expired };
  });
