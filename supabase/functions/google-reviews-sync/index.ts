import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

type GoogleReview = {
  name?: string;
  reviewId?: string;
  reviewer?: { displayName?: string };
  starRating?: string;
  comment?: string;
  createTime?: string;
  updateTime?: string;
};

const RATING: Record<string, number> = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };

function getSecretKey() {
  const raw = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (raw) return JSON.parse(raw).default as string;
  const legacy = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (legacy) return legacy;
  throw new Error("Clé secrète Supabase absente");
}

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  getSecretKey(),
  { auth: { persistSession: false, autoRefreshToken: false } },
);

function getConfig() {
  const raw = Deno.env.get("GOOGLE_BUSINESS_PROFILE");
  if (!raw) throw new Error("Secret GOOGLE_BUSINESS_PROFILE manquant");
  const config = JSON.parse(raw) as {
    client_id: string;
    client_secret: string;
    refresh_token: string;
    account_id: string;
    location_id: string;
    review_url?: string;
  };
  for (const key of ["client_id", "client_secret", "refresh_token", "account_id", "location_id"]) {
    if (!config[key as keyof typeof config]) throw new Error(`Configuration Google incomplète : ${key}`);
  }
  return config;
}

async function getAccessToken(config: ReturnType<typeof getConfig>) {
  const body = new URLSearchParams({
    client_id: config.client_id,
    client_secret: config.client_secret,
    refresh_token: config.refresh_token,
    grant_type: "refresh_token",
  });
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!response.ok) throw new Error(`OAuth Google: ${response.status} ${(await response.text()).slice(0, 500)}`);
  const token = await response.json() as { access_token?: string };
  if (!token.access_token) throw new Error("Google n'a pas fourni de jeton d'accès");
  return token.access_token;
}

async function listReviews(accessToken: string, accountId: string, locationId: string) {
  const reviews: GoogleReview[] = [];
  let pageToken = "";
  for (let page = 0; page < 20; page += 1) {
    const params = new URLSearchParams({ pageSize: "50", orderBy: "updateTime desc" });
    if (pageToken) params.set("pageToken", pageToken);
    const url = `https://mybusiness.googleapis.com/v4/accounts/${encodeURIComponent(accountId)}/locations/${encodeURIComponent(locationId)}/reviews?${params}`;
    const response = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    if (!response.ok) throw new Error(`Google Reviews API: ${response.status} ${(await response.text()).slice(0, 500)}`);
    const payload = await response.json() as { reviews?: GoogleReview[]; nextPageToken?: string };
    reviews.push(...(payload.reviews ?? []));
    pageToken = payload.nextPageToken ?? "";
    if (!pageToken) break;
  }
  return reviews;
}

async function sync() {
  const config = getConfig();
  const accessToken = await getAccessToken(config);
  const reviews = await listReviews(accessToken, config.account_id, config.location_id);
  let imported = 0;

  for (const review of reviews) {
    const googleReviewId = review.reviewId ?? review.name?.split("/").pop();
    const rating = review.starRating ? RATING[review.starRating] : undefined;
    if (!googleReviewId || !rating) continue;

    const payload = {
      author_name: review.reviewer?.displayName?.trim() || "Client Google",
      city: null,
      service_type: null,
      rating,
      message: review.comment?.trim() || "Avis Google laissé avec une note.",
      source: "google",
      source_url: config.review_url ?? null,
      google_review_id: googleReviewId,
      google_review_name: review.name ?? null,
      google_create_time: review.createTime ?? null,
      google_update_time: review.updateTime ?? null,
      google_raw: review,
      created_at: review.createTime ?? new Date().toISOString(),
    };

    const { data: existing, error: findError } = await supabaseAdmin
      .from("review_submissions")
      .select("id")
      .eq("google_review_id", googleReviewId)
      .maybeSingle();
    if (findError) throw new Error(`Lecture avis Google: ${findError.message}`);

    if (existing) {
      const { error } = await supabaseAdmin.from("review_submissions").update({
        author_name: payload.author_name,
        rating: payload.rating,
        message: payload.message,
        source_url: payload.source_url,
        google_review_name: payload.google_review_name,
        google_create_time: payload.google_create_time,
        google_update_time: payload.google_update_time,
        google_raw: payload.google_raw,
      }).eq("id", existing.id);
      if (error) throw new Error(`Mise à jour avis Google: ${error.message}`);
    } else {
      const { error } = await supabaseAdmin.from("review_submissions").insert({ ...payload, status: "nouveau" });
      if (error) throw new Error(`Import avis Google: ${error.message}`);
    }
    imported += 1;
  }

  const now = new Date().toISOString();
  await supabaseAdmin.from("google_review_sync_state").upsert({
    id: 1,
    account_id: config.account_id,
    location_id: config.location_id,
    last_sync_at: now,
    last_success_at: now,
    last_error: null,
    imported_count: imported,
    updated_at: now,
  });

  return { ok: true, fetched: reviews.length, imported };
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return Response.json({ error: "Méthode non autorisée" }, { status: 405 });
  const expected = Deno.env.get("GOOGLE_REVIEW_SYNC_SECRET");
  if (!expected || req.headers.get("x-google-sync-secret") !== expected) {
    return Response.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    return Response.json(await sync());
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    await supabaseAdmin.from("google_review_sync_state").upsert({
      id: 1,
      last_sync_at: new Date().toISOString(),
      last_error: message.slice(0, 1000),
      updated_at: new Date().toISOString(),
    });
    console.error(message);
    return Response.json({ ok: false, error: message }, { status: 502 });
  }
});
