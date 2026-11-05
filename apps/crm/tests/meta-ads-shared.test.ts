import { describe, expect, test } from "bun:test";

import {
  HIGH_CPL_RATIO,
  LOW_CPL_RATIO,
  MIN_LEADS_FOR_CPL,
  NO_LEAD_SPEND_THRESHOLD,
  RECOMMENDATION_TTL_DAYS,
  buildCampaignRecommendations,
  freshRecommendationExpiryFilter,
  isPendingRecommendationFresh,
  metaAdAccountInputSchema,
  metaRecommendationStatusInputSchema,
  normalizeMetaAccountId,
  parisWindowStart,
  partitionPendingRecommendations,
  recommendationExpiresAt,
  recommendationExpiryCutoff,
  recommendationKey,
  recommendationStatusPatch,
  recommendationTimestamps,
  staleRecommendationFilter,
  type RecommendationInsight,
} from "@/lib/meta-ads-shared";

const ACCOUNT = "11111111-1111-4111-8111-111111111111";

function row(campaign: string, spend: number, leads: number): RecommendationInsight {
  return { account_id: ACCOUNT, meta_campaign_id: campaign, spend, leads, impressions: 1000, clicks: 10 };
}

describe("Meta ad account validation", () => {
  test("normalizes account ids to the act_ Graph API form", () => {
    expect(normalizeMetaAccountId("act_123456789")).toBe("act_123456789");
    expect(normalizeMetaAccountId(" 123456789 ")).toBe("act_123456789");
    expect(normalizeMetaAccountId("ACT_123456789")).toBe("act_123456789");
    expect(normalizeMetaAccountId("act_12")).toBeNull();
    expect(normalizeMetaAccountId("act_123/campaigns")).toBeNull();
    expect(normalizeMetaAccountId("")).toBeNull();
  });

  test("accepts a valid creation and applies defaults", () => {
    const parsed = metaAdAccountInputSchema.parse({ mode: "create", meta_account_id: "987654321", name: "  Compte  " });
    expect(parsed).toEqual({ mode: "create", meta_account_id: "act_987654321", name: "Compte", is_active: true });
  });

  test("rejects invalid ids, short names and unknown fields", () => {
    expect(metaAdAccountInputSchema.safeParse({ mode: "create", meta_account_id: "abc", name: "Compte" }).success).toBe(false);
    expect(metaAdAccountInputSchema.safeParse({ mode: "create", meta_account_id: "act_123456", name: "x" }).success).toBe(false);
    expect(
      metaAdAccountInputSchema.safeParse({ mode: "create", meta_account_id: "act_123456", name: "Compte", currency: "USD" })
        .success,
    ).toBe(false);
  });

  test("updates cannot change the Meta account id", () => {
    expect(
      metaAdAccountInputSchema.safeParse({ mode: "update", id: ACCOUNT, name: "Compte", is_active: false }).success,
    ).toBe(true);
    expect(
      metaAdAccountInputSchema.safeParse({
        mode: "update",
        id: ACCOUNT,
        name: "Compte",
        is_active: false,
        meta_account_id: "act_999999",
      }).success,
    ).toBe(false);
    expect(metaAdAccountInputSchema.safeParse({ mode: "update", id: "nope", name: "Compte", is_active: true }).success).toBe(
      false,
    );
  });
});

describe("Meta recommendation status", () => {
  test("only allows manual applied/dismissed decisions", () => {
    expect(metaRecommendationStatusInputSchema.safeParse({ id: ACCOUNT, status: "applied" }).success).toBe(true);
    expect(metaRecommendationStatusInputSchema.safeParse({ id: ACCOUNT, status: "dismissed" }).success).toBe(true);
    expect(metaRecommendationStatusInputSchema.safeParse({ id: ACCOUNT, status: "pending" }).success).toBe(false);
    expect(metaRecommendationStatusInputSchema.safeParse({ id: ACCOUNT, status: "expired" }).success).toBe(false);
    expect(metaRecommendationStatusInputSchema.safeParse({ id: "1", status: "applied" }).success).toBe(false);
  });

  test("timestamps the matching decision column", () => {
    const now = new Date("2026-11-05T10:00:00.000Z");
    expect(recommendationStatusPatch("applied", now)).toEqual({ status: "applied", applied_at: now.toISOString() });
    expect(recommendationStatusPatch("dismissed", now)).toEqual({ status: "dismissed", dismissed_at: now.toISOString() });
  });
});

describe("Paris recommendation window", () => {
  test("uses the Paris calendar day, inclusive of today", () => {
    // 23:30 UTC on 4 Nov is already 5 Nov in Paris.
    expect(parisWindowStart(new Date("2026-11-04T23:30:00.000Z"), 14)).toBe("2026-10-23");
    expect(parisWindowStart(new Date("2026-11-05T10:00:00.000Z"), 1)).toBe("2026-11-05");
    expect(parisWindowStart(new Date("2026-03-02T12:00:00.000Z"), 14)).toBe("2026-02-17");
  });
});

describe("campaign recommendations", () => {
  const names = new Map([
    ["c-low", "Campagne efficace"],
    ["c-high", "Campagne chère"],
  ]);

  test("flags spend without leads for review", () => {
    const result = buildCampaignRecommendations([row("c-zero", 30, 0), row("c-zero", 25, 0)], names);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      account_id: ACCOUNT,
      entity_type: "campaign",
      entity_id: "c-zero",
      recommendation_type: "pause_review",
      priority: "high",
    });
    expect(result[0]?.metrics.spend).toBe(55);
    expect(result[0]?.rationale).toContain("c-zero");
  });

  test("does not flag small spend without leads", () => {
    expect(buildCampaignRecommendations([row("c-zero", 49.99, 0)], names)).toEqual([]);
  });

  test("compares CPL against the true median of active campaigns", () => {
    // CPLs: low 5, mid-a 10, mid-b 12, high 30 → median 11.
    const result = buildCampaignRecommendations(
      [row("c-low", 25, 5), row("c-mid-a", 50, 5), row("c-mid-b", 60, 5), row("c-high", 150, 5)],
      names,
    );
    const byCampaign = Object.fromEntries(result.map((r) => [r.entity_id, r]));
    expect(Object.keys(byCampaign).sort()).toEqual(["c-high", "c-low"]);
    expect(byCampaign["c-low"]?.recommendation_type).toBe("increase_budget");
    expect(byCampaign["c-low"]?.metrics.median_cpl).toBe(11);
    expect(byCampaign["c-high"]?.recommendation_type).toBe("reduce_or_test");
    expect(byCampaign["c-high"]?.priority).toBe("medium");
    expect(byCampaign["c-high"]?.rationale).toContain("Campagne chère");
  });

  test("ignores campaigns with too few leads and rows without campaign", () => {
    const result = buildCampaignRecommendations(
      [row("c-low", 4, 2), row("c-a", 50, 5), row("c-b", 60, 5), { ...row("x", 500, 0), meta_campaign_id: null }],
      names,
    );
    expect(result).toEqual([]);
  });

  test("campaigns under MIN_LEADS_FOR_CPL do not shift the median or eligible recommendations", () => {
    // Eligible CPLs: low 7, mid 10, high 16 → median 10 → low ≤ 7 (increase), high ≥ 15 (reduce).
    const eligible = [row("c-low", 35, 5), row("c-mid", 50, 5), row("c-high", 80, 5)];
    const baseline = buildCampaignRecommendations(eligible, names);
    expect(baseline.map((r) => [r.entity_id, r.recommendation_type])).toEqual([
      ["c-high", "reduce_or_test"],
      ["c-low", "increase_budget"],
    ]);
    expect(baseline.every((r) => r.metrics.median_cpl === 10)).toBe(true);

    // Each outlier alone would move the median (to 13 / 8.5) and drop one recommendation if counted.
    for (const outlier of [row("c-outlier-high", 1000, 1), row("c-outlier-low", 1, 2)]) {
      expect(buildCampaignRecommendations([...eligible, outlier], names)).toEqual(baseline);
    }
  });

  test("parses numeric strings returned by PostgREST", () => {
    const result = buildCampaignRecommendations(
      [{ account_id: ACCOUNT, meta_campaign_id: "c-str", spend: "60.50", leads: "0" }],
      names,
    );
    expect(result[0]?.metrics.spend).toBe(60.5);
  });

  test("approved thresholds are unchanged", () => {
    expect(NO_LEAD_SPEND_THRESHOLD).toBe(50);
    expect(MIN_LEADS_FOR_CPL).toBe(3);
    expect(LOW_CPL_RATIO).toBe(0.7);
    expect(HIGH_CPL_RATIO).toBe(1.5);
  });

  test("dedup key is stable between candidates and pending rows", () => {
    const [candidate] = buildCampaignRecommendations([row("c-zero", 80, 0)], names);
    expect(candidate).toBeDefined();
    expect(recommendationKey(candidate!)).toBe(
      recommendationKey({ entity_type: "campaign", entity_id: "c-zero", recommendation_type: "pause_review" }),
    );
  });
});

describe("recommendation expiry", () => {
  const now = new Date("2026-11-05T10:00:00.000Z");
  const daysAgo = (days: number, extraMs = 0) => new Date(now.getTime() - days * 86_400_000 + extraMs).toISOString();

  test("expires_at is exactly 14 days after generation", () => {
    expect(RECOMMENDATION_TTL_DAYS).toBe(14);
    expect(recommendationExpiresAt(now).toISOString()).toBe("2026-11-19T10:00:00.000Z");
    // Absolute duration: unaffected by the Paris DST change on 25 Oct 2026.
    expect(recommendationExpiresAt(new Date("2026-10-20T12:00:00.000Z")).toISOString()).toBe(
      "2026-11-03T12:00:00.000Z",
    );
    expect(recommendationExpiryCutoff(now).toISOString()).toBe("2026-10-22T10:00:00.000Z");
  });

  test("new recommendations get generated_at and expires_at from the same instant", () => {
    expect(recommendationTimestamps(now)).toEqual({
      generated_at: "2026-11-05T10:00:00.000Z",
      expires_at: "2026-11-19T10:00:00.000Z",
    });
  });

  test("a freshly generated row is fresh until its expiry instant", () => {
    const row = recommendationTimestamps(now);
    expect(isPendingRecommendationFresh(row, now)).toBe(true);
    expect(isPendingRecommendationFresh(row, new Date("2026-11-19T09:59:59.999Z"))).toBe(true);
    expect(isPendingRecommendationFresh(row, new Date("2026-11-19T10:00:00.000Z"))).toBe(false);
  });

  test("legacy rows without expires_at expire on generated_at age", () => {
    expect(isPendingRecommendationFresh({ generated_at: daysAgo(14, 1), expires_at: null }, now)).toBe(true);
    expect(isPendingRecommendationFresh({ generated_at: daysAgo(14), expires_at: null }, now)).toBe(false);
    expect(isPendingRecommendationFresh({ generated_at: daysAgo(30), expires_at: null }, now)).toBe(false);
  });

  test("a pending row generated 14 days ago is stale for both read and status update", () => {
    // Read path and setMetaRecommendationStatus share this predicate and filters.
    const row = recommendationTimestamps(new Date(daysAgo(14)));
    expect(isPendingRecommendationFresh(row, now)).toBe(false);
    expect(row.generated_at <= recommendationExpiryCutoff(now).toISOString()).toBe(true);
    expect(isPendingRecommendationFresh(recommendationTimestamps(new Date(daysAgo(14, 1))), now)).toBe(true);
  });

  test("an elapsed explicit expires_at wins over a recent generated_at", () => {
    expect(isPendingRecommendationFresh({ generated_at: daysAgo(1), expires_at: daysAgo(0) }, now)).toBe(false);
    expect(isPendingRecommendationFresh({ generated_at: "not a date", expires_at: null }, now)).toBe(false);
  });

  test("partitions pending rows and dedups only against fresh ones", () => {
    const pending = [
      { entity_type: "campaign", entity_id: "c-fresh", recommendation_type: "pause_review", ...recommendationTimestamps(new Date(daysAgo(3))) },
      { entity_type: "campaign", entity_id: "c-old", recommendation_type: "pause_review", ...recommendationTimestamps(new Date(daysAgo(15))) },
      { entity_type: "campaign", entity_id: "c-legacy", recommendation_type: "pause_review", generated_at: daysAgo(20), expires_at: null },
    ];
    const { fresh, stale } = partitionPendingRecommendations(pending, now);
    expect(fresh.map((r) => r.entity_id)).toEqual(["c-fresh"]);
    expect(stale.map((r) => r.entity_id)).toEqual(["c-old", "c-legacy"]);

    const pendingKeys = new Set(fresh.map(recommendationKey));
    const candidates = buildCampaignRecommendations(
      [row("c-fresh", 80, 0), row("c-old", 80, 0), row("c-legacy", 80, 0)],
      new Map(),
    ).filter((candidate) => !pendingKeys.has(recommendationKey(candidate)));
    expect(candidates.map((r) => r.entity_id)).toEqual(["c-legacy", "c-old"]);
  });

  test("PostgREST filters quote ISO timestamps and mirror the fresh predicate", () => {
    expect(staleRecommendationFilter(now)).toBe(
      'generated_at.lte."2026-10-22T10:00:00.000Z",expires_at.lte."2026-11-05T10:00:00.000Z"',
    );
    expect(freshRecommendationExpiryFilter(now)).toBe('expires_at.is.null,expires_at.gt."2026-11-05T10:00:00.000Z"');
  });
});
