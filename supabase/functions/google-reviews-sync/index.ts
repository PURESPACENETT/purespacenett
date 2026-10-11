import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const OWNER_EMAIL = "contact@purespacenett.com";
const ALLOWED_ORIGINS = new Set([
  "https://purespacenett.com",
  "https://www.purespacenett.com",
  "http://localhost:3000",
]);
const corsHeaders = (origin: string | null) => ({
  "Access-Control-Allow-Origin": origin && ALLOWED_ORIGINS.has(origin) ? origin : "https://purespacenett.com",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
});

type GoogleReview = {
  reviewId?: string;
  name?: string;
  reviewer?: { displayName?: string; profilePhotoUrl?: string; isAnonymous?: boolean };
  starRating?: string;
  comment?: string;
  createTime?: string;
  updateTime?: string;
};

const stars: Record<string, number> = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
};

Deno.serve(async (request: Request) => {
  const origin = request.headers.get("origin");
  const headers = { ...corsHeaders(origin), "Content-Type": "application/json" };
  if (request.method === "OPTIONS") return new Response("ok", { headers });
  if (request.method !== "POST") return Response.json({ error: "Méthode non autorisée." }, { status: 405, headers });

  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return Response.json({ error: "Connexion requise." }, { status: 401, headers });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceRoleKey)
    return Response.json({ error: "Service de synchronisation indisponible." }, { status: 503, headers });

  const authClient = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });
  const { data: authData, error: authError } = await authClient.auth.getUser(token);
  if (authError || authData.user?.email?.toLowerCase() !== OWNER_EMAIL)
    return Response.json({ error: "Accès réservé au propriétaire du site." }, { status: 403, headers });

  const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
  const markFailure = async (message: string) => {
    await admin.from("google_review_sync_state").upsert({
      id: 1,
      last_sync_at: new Date().toISOString(),
      last_error: message,
      updated_at: new Date().toISOString(),
    }, { onConflict: "id" });
  };

  try {
    const { data: config, error: configError } = await admin.rpc("get_google_review_config");
    if (configError || !config || typeof config !== "object") {
      await markFailure("Configuration OAuth Google Business Profile absente.");
      return Response.json({ error: "Configuration OAuth Google Business Profile absente." }, { status: 409, headers });
    }
    const credentials = config as Record<string, unknown>;
    const required = ["client_id", "client_secret", "refresh_token", "account_id", "location_id"];
    if (required.some((key) => typeof credentials[key] !== "string" || !credentials[key])) {
      await markFailure("Configuration OAuth Google Business Profile incomplète.");
      return Response.json({ error: "Configuration OAuth Google Business Profile incomplète." }, { status: 409, headers });
    }

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: credentials.client_id as string,
        client_secret: credentials.client_secret as string,
        refresh_token: credentials.refresh_token as string,
        grant_type: "refresh_token",
      }),
    });
    if (!tokenResponse.ok) {
      await markFailure("Échec de l’authentification OAuth Google. Vérifiez les identifiants et autorisations.");
      return Response.json({ error: "Échec de l’authentification OAuth Google." }, { status: 502, headers });
    }
    const tokenBody = await tokenResponse.json();
    const accessToken = tokenBody.access_token as string | undefined;
    if (!accessToken) throw new Error("Jeton d’accès Google manquant.");

    const accountId = encodeURIComponent(credentials.account_id as string);
    const locationId = encodeURIComponent(credentials.location_id as string);
    const baseUrl = `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews`;
    const reviews: GoogleReview[] = [];
    const pageTokens = new Set<string>();
    let pageToken: string | undefined;
    let paginationComplete = false;
    for (let page = 0; page < 100; page++) {
      const url = new URL(baseUrl);
      url.searchParams.set("pageSize", "50");
      if (pageToken) url.searchParams.set("pageToken", pageToken);
      const response = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
      if (!response.ok) {
        await markFailure(response.status === 403
          ? "Accès Google refusé. Vérifiez que l’établissement est vérifié et que l’API est autorisée."
          : `Échec de lecture des avis Google (HTTP ${response.status}).`);
        return Response.json({ error: "Lecture des avis Google impossible. Vérifiez l’accès Business Profile." }, { status: 502, headers });
      }
      const body = await response.json();
      if (Array.isArray(body.reviews)) reviews.push(...body.reviews as GoogleReview[]);
      const next = typeof body.nextPageToken === "string" ? body.nextPageToken : "";
      if (!next) {
        paginationComplete = true;
        break;
      }
      if (pageTokens.has(next)) throw new Error("La pagination Google a renvoyé un curseur en boucle.");
      pageTokens.add(next);
      pageToken = next;
    }
    if (!paginationComplete) {
      await markFailure("Synchronisation incomplète : le nombre maximal de pages Google a été dépassé.");
      return Response.json({ error: "Synchronisation incomplète : pagination Google trop volumineuse." }, { status: 502, headers });
    }

    const unique = new Map<string, GoogleReview>();
    for (const review of reviews) {
      const id = review.reviewId || review.name;
      if (id) unique.set(id, review);
    }
    const rows = [...unique].flatMap(([id, review]) => {
      const rating = stars[review.starRating ?? ""];
      if (!rating || !review.createTime) return [];
      const name = review.reviewer?.displayName?.trim() || "Avis Google sans nom public";
      return {
        google_review_id: id,
        google_review_name: review.name ?? null,
        author_name: name,
        rating,
        message: review.comment ?? "",
        created_at: review.createTime,
        google_create_time: review.createTime ?? null,
        google_update_time: review.updateTime ?? null,
        source: "google",
        source_url: null,
      };
    });

    if (rows.length) {
      const { error } = await admin.from("review_submissions").upsert(rows, {
        onConflict: "google_review_id",
        ignoreDuplicates: false,
      });
      if (error) throw new Error("Enregistrement des avis synchronisés impossible.");
    }
    const now = new Date().toISOString();
    const { error: stateError } = await admin.from("google_review_sync_state").upsert({
      id: 1,
      account_id: credentials.account_id,
      location_id: credentials.location_id,
      last_sync_at: now,
      last_success_at: now,
      last_error: null,
      imported_count: rows.length,
      updated_at: now,
    }, { onConflict: "id" });
    if (stateError) throw new Error("État de synchronisation impossible à enregistrer.");

    return Response.json({ ok: true, imported: rows.length, syncedAt: now }, { headers });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur de synchronisation.";
    await markFailure(message);
    return Response.json({ error: "La synchronisation Google a échoué. Consultez l’état dans l’administration." }, { status: 500, headers });
  }
});
