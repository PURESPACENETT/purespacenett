import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type InsightRow = {
  date: string;
  spend: number | null;
  conversion_value: number | null;
  currency: string | null;
};

export const listMetaAdsPerformance = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
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
