import { createServerFn } from "@tanstack/react-start";
import { createSign } from "node:crypto";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { zones } from "@/content/zones";

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

function base64Url(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

type GoogleServiceAccount = {
  client_email?: string;
  private_key?: string;
  private_key_id?: string;
};

let cachedToken: { accessToken: string; expiresAt: number } | null = null;

async function googleAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.accessToken;

  const raw = process.env["GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT_JSON"];
  if (!raw) {
    throw new Error(
      "La connexion Google Search Console n'est pas configurée. Ajoutez GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT_JSON dans Vercel.",
    );
  }

  let account: GoogleServiceAccount;
  try {
    account = JSON.parse(raw) as GoogleServiceAccount;
  } catch {
    throw new Error("GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT_JSON est invalide.");
  }

  if (!account.client_email || !account.private_key) {
    throw new Error("Le compte de service Google doit contenir client_email et private_key.");
  }

  const iat = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({
    alg: "RS256",
    typ: "JWT",
    ...(account.private_key_id ? { kid: account.private_key_id } : {}),
  }));
  const claim = base64Url(JSON.stringify({
    iss: account.client_email,
    scope: "https://www.googleapis.com/auth/webmasters.readonly",
    aud: "https://oauth2.googleapis.com/token",
    iat,
    exp: iat + 3600,
  }));
  const unsigned = `${header}.${claim}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  const signature = signer.sign(account.private_key).toString("base64url");
  const assertion = `${unsigned}.${signature}`;

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  if (!tokenResponse.ok) {
    const detail = await tokenResponse.text().catch(() => "");
    throw new Error(
      `Authentification Google Search Console impossible (${tokenResponse.status}). ${detail.slice(0, 300)}`.trim(),
    );
  }

  const token = (await tokenResponse.json()) as { access_token?: string; expires_in?: number };
  if (!token.access_token) throw new Error("Google n'a pas fourni de jeton d'accès.");
  cachedToken = {
    accessToken: token.access_token,
    expiresAt: Date.now() + Math.max(60, token.expires_in ?? 3600) * 1000,
  };
  return token.access_token;
}

async function googleHeaders() {
  return {
    Authorization: `Bearer ${await googleAccessToken()}`,
    "Content-Type": "application/json",
  };
}

function coversTarget(siteUrl: string, target: URL) {
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
  const res = await fetch("https://www.googleapis.com/webmasters/v3/sites", {
    headers: await googleHeaders(),
  });
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
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(property)}/searchAnalytics/query`,
    {
      method: "POST",
      headers: await googleHeaders(),
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) {
    throw new Error(
      `Lecture des statistiques Google impossible (${res.status}) : ${await res.text()}`,
    );
  }
  const json = (await res.json()) as {
    rows?: {
      keys?: string[];
      clicks?: number;
      impressions?: number;
      ctr?: number;
      position?: number;
    }[];
  };
  return json.rows ?? [];
}

function toRows(
  rows: {
    keys?: string[];
    clicks?: number;
    impressions?: number;
    ctr?: number;
    position?: number;
  }[],
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
