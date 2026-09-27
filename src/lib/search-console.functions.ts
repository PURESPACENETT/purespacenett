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
    throw new Error(`Authentification Google Search Console impossible (${tokenResponse.status}). ${detail.slice(0, 300)}`.trim());
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

