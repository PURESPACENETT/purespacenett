import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const ALLOWED_ORIGINS = new Set([
  "https://purespacenett.com",
  "https://www.purespacenett.com",
]);

const rate = new Map<string, { windowStart: number; count: number }>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 10;

function corsHeaders(origin: string | null) {
  const allowed = origin && ALLOWED_ORIGINS.has(origin)
    ? origin
    : "https://purespacenett.com";

  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers": "content-type, x-quote-webhook, x-quote-webhook-secret",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
    "Content-Type": "application/json; charset=utf-8",
  };
}

function json(data: unknown, status: number, origin: string | null) {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders(origin),
  });
}

function isString(value: unknown, min = 0, max = 2000) {
  return typeof value === "string" && value.trim().length >= min && value.length <= max;
}

function isUuid(value: unknown) {
  return typeof value === "string" &&
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(value);
}

function isFrenchPublicHoliday(value?: string | null): boolean {
  if (!value) return false;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return false;
  const monthDay = `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  if (["01-01", "05-01", "05-08", "07-14", "08-15", "11-01", "11-11", "12-25"].includes(monthDay)) return true;

  const year = date.getFullYear();
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
  const easter = new Date(year, month - 1, day);
  const daysAfterEaster = Math.round((date.getTime() - easter.getTime()) / 86_400_000);
  return daysAfterEaster === 1 || daysAfterEaster === 39 || daysAfterEaster === 50;
}

function estimatePrice(
  input: { surface_m2: number; property_type: string; frequency: string; services: string[]; desired_date: string | null },
  settings: Record<string, unknown> | null,
): { min: number; max: number } {
  const minPrice = Number(settings?.min_price ?? 50);
  const raw = settings?.service_surcharges && typeof settings.service_surcharges === "object"
    ? settings.service_surcharges as Record<string, unknown>
    : {};
  const hourly = raw.hourly_rates && typeof raw.hourly_rates === "object" ? raw.hourly_rates as Record<string, number> : {};
  const productivity = raw.productivity_m2_per_hour && typeof raw.productivity_m2_per_hour === "object"
    ? raw.productivity_m2_per_hour as Record<string, number>
    : {};
  const perM2 = raw.per_m2_rates && typeof raw.per_m2_rates === "object" ? raw.per_m2_rates as Record<string, number> : {};
  const textileRanges = raw.textile_ranges && typeof raw.textile_ranges === "object"
    ? Object.values(raw.textile_ranges as Record<string, { min?: number; max?: number }>)
    : [];
  const has = (service: string) => input.services.includes(service);
  const surface = Math.max(1, input.surface_m2);

  if (has("vitrerie")) {
    return {
      min: Math.round(Math.max(minPrice, surface * Number(perM2.vitrerie_min ?? 5)) / 5) * 5,
      max: Math.round(Math.max(minPrice, surface * Number(perM2.vitrerie_max ?? 9)) / 5) * 5,
    };
  }
  if (has("textile")) {
    const mins = textileRanges.map((range) => Number(range.min ?? 45));
    const maxs = textileRanges.map((range) => Number(range.max ?? 160));
    return {
      min: Math.max(minPrice, mins.length ? Math.min(...mins) : 45),
      max: Math.max(minPrice, maxs.length ? Math.max(...maxs) : 160),
    };
  }

  const technical = has("fin_de_chantier") || has("remise_en_etat") || has("desinfection") || input.property_type === "chantier";
  const complex = has("forte_salissure") || has("complexe");
  const tier = complex ? "complexe" : technical ? "technique" : input.frequency === "ponctuel" ? "ponctuel" : "entretien";
  const date = input.desired_date ? new Date(`${input.desired_date}T00:00:00`) : null;
  const specialRate = isFrenchPublicHoliday(input.desired_date)
    ? Number(hourly.ferie ?? 32)
    : date && !Number.isNaN(date.getTime()) && date.getDay() === 0
      ? Number(hourly.dimanche ?? 32)
      : 0;
  const defaultHourly: Record<string, number> = { entretien: 25, ponctuel: 30, technique: 35, complexe: 40 };
  const hourlyRate = Math.max(Number(hourly[tier] ?? defaultHourly[tier] ?? 25), specialRate);
  const productivityRate = complex
    ? Number(productivity.complexe ?? 15)
    : technical
      ? Number(productivity.chantier ?? 15)
      : Number(productivity.standard ?? 20);
  const rounded = Math.round(Math.max(minPrice, surface * (hourlyRate / productivityRate)) / 5) * 5;
  return { min: rounded, max: rounded };
}

type NormalizedQuote = ReturnType<typeof normalize>;

async function enrichExistingQuote(
  supabase: ReturnType<typeof createClient>,
  id: string,
  data: NormalizedQuote,
) {
  const { data: updated, error } = await supabase
    .from("quote_requests")
    .update({
      full_name: data.full_name,
      client_type: data.client_type,
      property_type: data.property_type,
      surface_m2: data.surface_m2,
      rooms: data.rooms,
      frequency: data.frequency,
      services: data.services,
      city: data.city,
      postal_code: data.postal_code,
      desired_date: data.desired_date,
      contact_name: data.contact_name,
      company_name: data.company_name,
      email: data.email,
      phone: data.phone,
      message: data.message,
      estimate_min: data.estimate_min,
      estimate_max: data.estimate_max,
      score: data.score,
    })
    .eq("id", id)
    .select("id,status,created_at,estimate_min,estimate_max,score")
    .single();
  if (error) throw new Error("Unable to enrich existing quote request.");
  return updated;
}

function normalize(body: Record<string, unknown>) {
  const clientType = body.clientType ?? body.client_type ?? "entreprise";
  const propertyType = body.propertyType ?? body.property_type ?? "autre";
  const surfaceM2 = body.surfaceM2 ?? body.surface_m2 ?? body.surface;
  const rooms = body.rooms;
  const frequency = body.frequency ?? "ponctuel";
  const services = body.services;
  const city = body.city;
  const postalCode = body.postalCode ?? body.postal_code;
  const desiredDate = body.desiredDate ?? body.desired_date ?? "";
  const contactName = body.contactName ?? body.contact_name ?? body.fullName ?? body.full_name;
  const companyName = body.companyName ?? body.company_name ?? "";
  const email = body.email;
  const phone = body.phone;
  const message = body.message ?? "";
  const sourceExternalId = body.sourceExternalId ?? body.source_external_id;

  const validClientTypes = ["entreprise", "sous_traitance", "particulier"];
  const validPropertyTypes = ["bureaux", "commerce", "immeuble", "chantier", "logement", "autre"];
  const validFrequencies = ["ponctuel", "hebdomadaire", "plusieurs_semaine", "mensuel", "toutes_les_deux_semaines", "quotidien", "contrat_annuel"];
  const validServices = ["nettoyage_courant", "vitrerie", "remise_en_etat", "fin_de_chantier", "desinfection"];

  if (!validClientTypes.includes(String(clientType))) throw new Error("clientType invalide");
  if (!validPropertyTypes.includes(String(propertyType))) throw new Error("propertyType invalide");
  if (!validFrequencies.includes(String(frequency))) throw new Error("frequency invalide");
  if (!isString(city, 1, 120) || !isString(postalCode, 1, 10)) throw new Error("Ville ou code postal invalide");
  if (!isString(contactName, 2, 120)) throw new Error("Nom du contact invalide");
  if (!isString(companyName, 0, 160)) throw new Error("Nom d'entreprise invalide");
  if (!isString(phone, 6, 30)) throw new Error("Téléphone invalide");
  if (!isString(message, 0, 1500)) throw new Error("Message invalide");
  if (sourceExternalId !== undefined && sourceExternalId !== null && !isUuid(sourceExternalId)) {
    throw new Error("sourceExternalId invalide");
  }
  if (
    typeof email !== "string" ||
    !/^\S+@\S+\.\S+$/.test(email) ||
    email.length > 255
  ) throw new Error("Email invalide");

  const surface = Number(surfaceM2);
  if (!Number.isInteger(surface) || surface < 1 || surface > 200000) {
    throw new Error("Surface invalide");
  }

  let roomCount: number | null = null;
  if (rooms !== undefined && rooms !== null && rooms !== "") {
    roomCount = Number(rooms);
    if (!Number.isInteger(roomCount) || roomCount < 0 || roomCount > 5000) {
      throw new Error("Nombre de pièces invalide");
    }
  }

  const normalizedServices = Array.isArray(services)
    ? services.map(String).filter((service) => validServices.includes(service))
    : [];

  let score = 20;
  if (clientType === "entreprise") score += 25;
  if (clientType === "sous_traitance") score += 20;
  if (["hebdomadaire", "plusieurs_semaine", "mensuel", "toutes_les_deux_semaines", "quotidien", "contrat_annuel"].includes(String(frequency))) score += 25;
  if (frequency === "contrat_annuel" || frequency === "quotidien") score += 10;
  if (surface >= 200) score += 10;
  if (surface >= 800) score += 10;
  if (normalizedServices.length > 1) score += 5;

  return {
    full_name: String(contactName).trim(),
    client_type: String(clientType),
    property_type: String(propertyType),
    surface_m2: surface,
    rooms: roomCount,
    frequency: String(frequency),
    services: normalizedServices,
    city: String(city).trim(),
    postal_code: String(postalCode).trim(),
    desired_date: isString(desiredDate, 0, 20) ? String(desiredDate).trim() || null : null,
    contact_name: String(contactName).trim(),
    company_name: String(companyName).trim() || null,
    email: String(email).trim().toLowerCase(),
    phone: String(phone).trim(),
    message: String(message).trim() || null,
    source_external_id: sourceExternalId ? String(sourceExternalId) : null,
    estimate_min: 0,
    estimate_max: 0,
    score: Math.min(100, score),
    status: "nouveau",
  };
}

Deno.serve(async (request) => {
  const origin = request.headers.get("origin");

  if (request.method === "OPTIONS") {
    if (origin && !ALLOWED_ORIGINS.has(origin)) {
      return json({ ok: false, error: "Origin non autorisée" }, 403, origin);
    }

    return new Response(null, {
      status: 204,
      headers: corsHeaders(origin),
    });
  }

  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    return json({ ok: false, error: "Origin non autorisée" }, 403, origin);
  }

  if (request.method !== "POST") {
    return json({ ok: false, error: "Méthode non autorisée" }, 405, origin);
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 20_000) {
    return json({ ok: false, error: "Requête trop volumineuse" }, 413, origin);
  }

  const forwarded = request.headers.get("x-forwarded-for") || "";
  const ip = forwarded.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const current = rate.get(ip);

  if (!current || now - current.windowStart >= WINDOW_MS) {
    rate.set(ip, { windowStart: now, count: 1 });
  } else {
    current.count += 1;

    if (current.count > MAX_PER_WINDOW) {
      return json(
        { ok: false, error: "Trop de demandes, veuillez réessayer plus tard." },
        429,
        origin,
      );
    }
  }

  try {
    const providedSecret =
      request.headers.get("x-quote-webhook-secret") ||
      request.headers.get("x-quote-webhook");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const secretKeysRaw = Deno.env.get("SUPABASE_SECRET_KEYS");
    const legacyServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    let secretKeys: Record<string, string> | null = null;
    try {
      secretKeys = secretKeysRaw ? JSON.parse(secretKeysRaw) : null;
    } catch (error) {
      console.error("Invalid SUPABASE_SECRET_KEYS configuration", error);
      return json({ ok: false, error: "Service temporairement indisponible" }, 503, origin);
    }

    const adminKey = secretKeys?.default || legacyServiceRoleKey;

    if (!supabaseUrl || !adminKey) {
      console.error("Supabase admin credentials unavailable");
      return json({ ok: false, error: "Service temporairement indisponible" }, 503, origin);
    }

    const supabase = createClient(supabaseUrl, adminKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: expectedSecret, error: secretError } = await supabase.rpc(
      "get_quote_webhook_secret",
    );

    if (secretError || !expectedSecret) {
      console.error("Quote webhook secret unavailable", secretError);
      return json({ ok: false, error: "Service temporairement indisponible" }, 503, origin);
    }

    if (!providedSecret || providedSecret !== expectedSecret) {
      return json({ ok: false, error: "Non autorisé" }, 401, origin);
    }

    const body = await request.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return json({ ok: false, error: "Payload invalide" }, 400, origin);
    }

    const data = normalize(body as Record<string, unknown>);
    const { data: pricingRow, error: pricingError } = await supabase
      .from("pricing_settings")
      .select("min_price,service_surcharges")
      .eq("id", "00000000-0000-0000-0000-000000000001")
      .maybeSingle();
    if (pricingError) console.error("Quote pricing lookup failed", pricingError.message);
    const estimate = estimatePrice(data, pricingRow as Record<string, unknown> | null);
    data.estimate_min = estimate.min;
    data.estimate_max = estimate.max;

    if (data.source_external_id) {
      const { data: existing, error: existingError } = await supabase
        .from("quote_requests")
        .select("id, status, created_at")
        .eq("source_external_id", data.source_external_id)
        .maybeSingle();

      if (existingError) {
        console.error("quote_requests idempotency lookup failed", existingError);
        return json({ ok: false, error: "Impossible de vérifier la demande" }, 500, origin);
      }

      if (existing) {
        try {
          const enriched = await enrichExistingQuote(supabase, existing.id, data);
          return json({ ok: true, duplicate: true, enriched: true, request: enriched }, 200, origin);
        } catch (enrichmentError) {
          console.error("quote_requests enrichment failed", enrichmentError);
          return json({ ok: false, error: "Impossible de compléter la demande CRM" }, 500, origin);
        }
      }
    }

    const { data: inserted, error } = await supabase
      .from("quote_requests")
      .insert(data)
      .select("id, status, created_at")
      .single();

    if (error) {
      if (error.code === "23505" && data.source_external_id) {
        const { data: existing, error: existingError } = await supabase
          .from("quote_requests")
          .select("id, status, created_at")
          .eq("source_external_id", data.source_external_id)
          .maybeSingle();

        if (!existingError && existing) {
          try {
            const enriched = await enrichExistingQuote(supabase, existing.id, data);
            return json({ ok: true, duplicate: true, enriched: true, request: enriched }, 200, origin);
          } catch (enrichmentError) {
            console.error("quote_requests enrichment after conflict failed", enrichmentError);
            return json({ ok: false, error: "Impossible de compléter la demande CRM" }, 500, origin);
          }
        }
      }

      console.error("quote_requests insert failed", error);
      return json(
        { ok: false, error: "Impossible d'enregistrer la demande" },
        500,
        origin,
      );
    }

    return json({ ok: true, request: inserted }, 201, origin);
  } catch (error) {
    console.error("quote-request-webhook error", error);

    return json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Payload invalide",
      },
      400,
      origin,
    );
  }
});
