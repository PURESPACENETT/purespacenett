import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { zones } from "@/content/zones";

const API_BASE = "https://www.googleapis.com/webmasters/v3";
const OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token";
const SITE_URL = "https://purespacenett.com";

export type SearchRow = {
  cle: string;
  clics: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type CityStats = {
  ville: string;
  slug: string;
  url: string;
  clics: number;
  impressions: number;
  ctr: number;
  position: number;
  requetes: SearchRow[];
};

export type SearchConsoleReport = {
  propriete: string;
  debut: string;
  fin: string;
  total: { clics: number; impressions: number; ctr: number; position: number };
  requetes: SearchRow[];
  pages: SearchRow[];
  villes: CityStats[];
};

const InputSchema = z.object({
  jours: z.number().int().min(7).max(180).optional(),
  proprieteChoisie: z.string().max(300).optional(),
});

function oauthConfigured() {
  return Boolean(
    process.env["GOOGLE_SEARCH_CONSOLE_CLIENT_ID"] &&
      process.env["GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET"] &&
      process.env["GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN"],
  );
}

async function headers() {
  if (!oauthConfigured()) {
    throw new Error(
      "Google Search Console n'est pas configuré : renseignez GOOGLE_SEARCH_CONSOLE_CLIENT_ID, GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET et GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN.",
    );
  }
  const body = new URLSearchParams({
    client_id: process.env["GOOGLE_SEARCH_CONSOLE_CLIENT_ID"]!,
    client_secret: process.env["GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET"]!,
    refresh_token: process.env["GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN"]!,
    grant_type: "refresh_token",
  });
  const tokenResponse = await fetch(OAUTH_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!tokenResponse.ok) {
    throw new Error(
      `Google OAuth n'a pas pu renouveler le jeton (${tokenResponse.status}) : ${await tokenResponse.text()}`,
    );
  }
  const token = (await tokenResponse.json()) as { access_token?: string };
  if (!token.access_token) throw new Error("Google OAuth n'a retourné aucun access_token.");
  return {
    Authorization: `Bearer ${token.access_token}`,
    "Content-Type": "application/json",
  };
}

async function coversTarget(siteUrl: string, target: URL) {
  if (siteUrl.startsWith("sc-domain:")) {
    const domain = siteUrl.slice("sc-domain:".length).toLowerCase();
    const host = target.hostname.toLowerCase();
    return host === domain || host.endsWith(`.${domain}`);
  }
  try {
    return target.href.startsWith(new URL(siteUrl).href);
  } catch {
    return false;
  }
}

async function resolveProperty(chosen?: string) {
  const res = await fetch(`${API_BASE}/sites`, { headers: await headers() });
  if (!res.ok) {
    throw new Error(`Google Search Console n'a pas répondu (${res.status}) : ${await res.text()}`);
  }
  const { siteEntry = [] } = (await res.json()) as {
    siteEntry?: { siteUrl: string; permissionLevel?: string }[];
  };
  const target = new URL(SITE_URL);
  const matches = siteEntry.filter(
    (e) => e.permissionLevel !== "siteUnverifiedUser" && coversTarget(e.siteUrl, target),
  );
  if (matches.length === 0) {
    throw new Error("Aucune propriété Google Search Console vérifiée ne couvre purespacenett.com.");
  }
  if (chosen) {
    const found = matches.find((e) => e.siteUrl === chosen);
    if (!found) throw new Error("La propriété Google choisie n'est plus disponible.");
    return found.siteUrl;
  }
  const exact = matches.find((e) => e.siteUrl === `${SITE_URL}/`);
  return (exact ?? matches[0]!).siteUrl;
}

async function query(property: string, body: Record<string, unknown>) {
  const res = await fetch(
    `${API_BASE}/sites/${encodeURIComponent(property)}/searchAnalytics/query`,
    { method: "POST", headers: await headers(), body: JSON.stringify(body) },
  );
  if (!res.ok) {
    throw new Error(`Lecture des statistiques Google impossible (${res.status}) : ${await res.text()}`);
  }
  const json = (await res.json()) as {
    rows?: { keys?: string[]; clicks?: number; impressions?: number; ctr?: number; position?: number }[];
  };
  return json.rows ?? [];
}

function toRows(
  rows: { keys?: string[]; clicks?: number; impressions?: number; ctr?: number; position?: number }[],
): SearchRow[] {
  return rows.map((r) => ({
    cle: r.keys?.[0] ?? "—",
    clics: r.clicks ?? 0,
    impressions: r.impressions ?? 0,
    ctr: r.ctr ?? 0,
    position: r.position ?? 0,
  }));
}

function isoDay(offsetDays: number) {
  const d = new Date(Date.now() - offsetDays * 86_400_000);
  return d.toISOString().slice(0, 10);
}

/** Impressions, clics et requêtes Google — global et par page de ville. Réservé à l'administrateur. */
export const getSearchConsoleReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => InputSchema.parse(data))
  .handler(async ({ data }): Promise<SearchConsoleReport> => {
    const jours = data.jours ?? 28;
    // Google a 2 à 3 jours de décalage sur les données.
    const endDate = isoDay(3);
    const startDate = isoDay(3 + jours);
    const property = await resolveProperty(data.proprieteChoisie);
    const base = { startDate, endDate, type: "web" as const };

    const [totalRows, queryRows, pageRows] = await Promise.all([
      query(property, { ...base, dimensions: [], rowLimit: 1 }),
      query(property, { ...base, dimensions: ["query"], rowLimit: 100 }),
      query(property, { ...base, dimensions: ["page"], rowLimit: 200 }),
    ]);

    const villes = await Promise.all(
      zones.map(async (z): Promise<CityStats> => {
        const url = `${SITE_URL}/zones/${z.slug}`;
        const filters = {
          dimensionFilterGroups: [
            {
              filters: [{ dimension: "page", operator: "equals", expression: url }],
            },
          ],
        };
        const [tot, reqs] = await Promise.all([
          query(property, { ...base, ...filters, dimensions: [], rowLimit: 1 }),
          query(property, { ...base, ...filters, dimensions: ["query"], rowLimit: 25 }),
        ]);
        const t = tot[0];
        return {
          ville: z.name,
          slug: z.slug,
          url,
          clics: t?.clicks ?? 0,
          impressions: t?.impressions ?? 0,
          ctr: t?.ctr ?? 0,
          position: t?.position ?? 0,
          requetes: toRows(reqs),
        };
      }),
    );

    const t = totalRows[0];
    return {
      propriete: property,
      debut: startDate,
      fin: endDate,
      total: {
        clics: t?.clicks ?? 0,
        impressions: t?.impressions ?? 0,
        ctr: t?.ctr ?? 0,
        position: t?.position ?? 0,
      },
      requetes: toRows(queryRows),
      pages: toRows(pageRows),
      villes: villes.sort((a, b) => b.impressions - a.impressions),
    };
  });
