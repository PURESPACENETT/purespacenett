import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { metaLeadExternalId, processIndividually } from "../_shared/meta-lead-reliability.ts";

const GRAPH_VERSION = Deno.env.get("META_GRAPH_API_VERSION");
const LEAD_ACCESS_TOKEN =
  Deno.env.get("META_LEADS_ACCESS_TOKEN") ?? Deno.env.get("META_ACCESS_TOKEN");
const VERIFY_TOKEN = Deno.env.get("META_VERIFY_TOKEN");
const APP_SECRET = Deno.env.get("META_APP_SECRET");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (
  !GRAPH_VERSION ||
  !LEAD_ACCESS_TOKEN ||
  !VERIFY_TOKEN ||
  !APP_SECRET ||
  !SUPABASE_URL ||
  !SUPABASE_SERVICE_ROLE_KEY
) {
  throw new Error("Missing Meta Lead Ads webhook configuration.");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function constantTimeEqual(left: string, right: string) {
  const a = new TextEncoder().encode(left);
  const b = new TextEncoder().encode(right);
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let index = 0; index < a.length; index += 1) difference |= a[index] ^ b[index];
  return difference === 0;
}

async function verifySignature(
  request: Request,
  rawBody: ArrayBuffer,
): Promise<"valid" | "missing" | "malformed" | "mismatch"> {
  const signature = request.headers.get("x-hub-signature-256");
  if (!signature) return "missing";
  if (!/^sha256=[a-f0-9]{64}$/i.test(signature)) return "malformed";

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(APP_SECRET!),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign("HMAC", key, rawBody);
  const expected =
    "sha256=" +
    [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return constantTimeEqual(signature.toLowerCase(), expected) ? "valid" : "mismatch";
}

function fieldMap(fieldData: unknown) {
  const result: Record<string, string> = {};
  if (!Array.isArray(fieldData)) return result;
  for (const field of fieldData) {
    const item = field as Record<string, unknown>;
    const values = Array.isArray(item.values) ? item.values : [];
    result[String(item.name ?? "")] = String(values[0] ?? "");
  }
  return result;
}

class MetaLeadFetchError extends Error {
  constructor(
    readonly httpStatus: number,
    readonly metaErrorCode: number | null,
    readonly metaErrorSubcode: number | null,
  ) {
    super("Meta lead fetch failed");
    this.name = "MetaLeadFetchError";
  }
}

async function fetchLead(leadId: string) {
  const url = new URL(`https://graph.facebook.com/${GRAPH_VERSION}/${encodeURIComponent(leadId)}`);
  url.searchParams.set("access_token", LEAD_ACCESS_TOKEN!);
  url.searchParams.set("fields", "id,created_time,form_id,field_data");
  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    // Never include fetch exceptions: some runtimes include the request URL, which contains the access token.
    throw new MetaLeadFetchError(0, null, null);
  }

  let payload: Record<string, unknown>;
  try {
    payload = await response.json();
  } catch {
    throw new MetaLeadFetchError(response.status, null, null);
  }

  const metaError = payload.error as Record<string, unknown> | undefined;
  if (!response.ok || metaError) {
    const code =
      typeof metaError?.code === "number" && Number.isInteger(metaError.code)
        ? metaError.code
        : null;
    const subcode =
      typeof metaError?.error_subcode === "number" && Number.isInteger(metaError.error_subcode)
        ? metaError.error_subcode
        : null;
    throw new MetaLeadFetchError(response.status, code, subcode);
  }
  return payload;
}

Deno.serve(async (request) => {
  if (request.method === "GET") {
    const url = new URL(request.url);
    const mode = url.searchParams.get("hub.mode") ?? url.searchParams.get("hub_mode");
    const token =
      url.searchParams.get("hub.verify_token") ?? url.searchParams.get("hub_verify_token");
    const challenge =
      url.searchParams.get("hub.challenge") ?? url.searchParams.get("hub_challenge");
    if (mode === "subscribe" && token && constantTimeEqual(token, VERIFY_TOKEN!)) {
      return new Response(challenge ?? "", { status: 200 });
    }
    return new Response("Forbidden", { status: 403 });
  }

  if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  const rawBody = await request.arrayBuffer();
  const signatureStatus = await verifySignature(request, rawBody);
  if (signatureStatus !== "valid") {
    // Deliberately log only a fixed classification. Never log the signature, app secret, or body.
    console.warn(
      JSON.stringify({
        event: "meta_webhook_signature_rejected",
        signature_status: signatureStatus,
        app_secret_configured: Boolean(APP_SECRET),
      }),
    );
    return new Response("Invalid signature", { status: 403 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(new TextDecoder().decode(rawBody));
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const events: Array<{ leadgen_id: string; quote_request_id: string | null }> = [];
  const failed: Array<{ leadId: string; error: unknown }> = [];
  const entries = Array.isArray(payload.entry) ? payload.entry : [];
  const incoming: Array<{
    entryId: string;
    field: string;
    leadId: string;
    value: Record<string, unknown>;
  }> = [];

  for (const entryValue of entries) {
    const entry = entryValue as Record<string, unknown>;
    const changes = Array.isArray(entry.changes) ? entry.changes : [];
    for (const changeValue of changes) {
      const change = changeValue as Record<string, unknown>;
      if (change.field !== "leadgen" && change.field !== "leadgen_update") continue;
      const value = (change.value ?? {}) as Record<string, unknown>;
      const leadId = String(value.leadgen_id ?? "");
      if (leadId)
        incoming.push({
          entryId: String(entry.id ?? ""),
          field: String(change.field),
          leadId,
          value,
        });
    }
  }

  const result = await processIndividually(incoming, async ({ entryId, field, leadId, value }) => {
    const lead = await fetchLead(leadId);
    const fields = fieldMap(lead.field_data);
    const contactName =
      fields.full_name || [fields.first_name, fields.last_name].filter(Boolean).join(" ");
    const email = fields.email || fields.email_address || null;
    const phone = fields.phone_number || fields.phone || null;

    const { data: attribution, error: attributionError } = await supabase
      .from("meta_lead_attributions")
      .upsert(
        {
          lead_external_id: leadId,
          source: "meta_lead_ads",
          contact_name: contactName || null,
          email,
          phone,
          meta_page_id: value.page_id ? String(value.page_id) : entryId,
          meta_form_id: lead.form_id
            ? String(lead.form_id)
            : value.form_id
              ? String(value.form_id)
              : null,
          meta_campaign_id: lead.campaign_id
            ? String(lead.campaign_id)
            : value.campaign_id
              ? String(value.campaign_id)
              : null,
          meta_adset_id: lead.adset_id
            ? String(lead.adset_id)
            : value.adset_id
              ? String(value.adset_id)
              : value.adgroup_id
                ? String(value.adgroup_id)
                : null,
          meta_ad_id: lead.ad_id ? String(lead.ad_id) : value.ad_id ? String(value.ad_id) : null,
          lead_created_at:
            typeof lead.created_time === "string" || typeof lead.created_time === "number"
              ? new Date(lead.created_time).toISOString()
              : typeof value.created_time === "number"
                ? new Date(value.created_time * 1000).toISOString()
                : null,
          raw: {
            event_field: field,
            lead_id: leadId,
            page_id: value.page_id ? String(value.page_id) : entryId,
            form_id: lead.form_id
              ? String(lead.form_id)
              : value.form_id
                ? String(value.form_id)
                : null,
            campaign_id: lead.campaign_id
              ? String(lead.campaign_id)
              : value.campaign_id
                ? String(value.campaign_id)
                : null,
            adset_id: lead.adset_id
              ? String(lead.adset_id)
              : value.adset_id
                ? String(value.adset_id)
                : value.adgroup_id
                  ? String(value.adgroup_id)
                  : null,
            ad_id: lead.ad_id ? String(lead.ad_id) : value.ad_id ? String(value.ad_id) : null,
            field_names: Array.isArray(lead.field_data)
              ? lead.field_data.map((item: Record<string, unknown>) => String(item.name ?? ""))
              : [],
          },
        },
        { onConflict: "lead_external_id" },
      )
      .select("id,quote_request_id")
      .single();

    if (attributionError) throw new Error("Unable to save Meta lead attribution.");

    let quoteRequestId = attribution.quote_request_id as string | null;
    if (!quoteRequestId && contactName && email && phone) {
      const sourceExternalId = await metaLeadExternalId(leadId);
      const { data: existingRequest, error: lookupError } = await supabase
        .from("quote_requests")
        .select("id")
        .eq("source_external_id", sourceExternalId)
        .maybeSingle();
      if (lookupError) throw new Error("Unable to look up CRM request.");

      if (existingRequest) {
        quoteRequestId = existingRequest.id;
      } else {
        const requestedClientType = fields.client_type;
        const clientType =
          requestedClientType === "entreprise" || requestedClientType === "sous_traitance"
            ? requestedClientType
            : requestedClientType === "particulier"
              ? "particulier"
              : fields.company_name
                ? "entreprise"
                : "particulier";
        const { data: requestRow, error: requestError } = await supabase
          .from("quote_requests")
          .insert({
            full_name: contactName,
            contact_name: contactName,
            company_name: fields.company_name || null,
            email,
            phone,
            status: "nouveau",
            client_type: clientType,
            service_type: fields.service_type ?? "Demande via Meta Ads",
            message: fields.message ?? null,
            source_system: "meta_lead_ads",
            source_external_id: sourceExternalId,
            estimate_min: 0,
            estimate_max: 0,
          })
          .select("id")
          .single();

        if (requestError) {
          if (requestError.code !== "23505") throw new Error("Unable to create CRM request.");
          const { data: racedRequest, error: racedLookupError } = await supabase
            .from("quote_requests")
            .select("id")
            .eq("source_external_id", sourceExternalId)
            .maybeSingle();
          if (racedLookupError || !racedRequest)
            throw new Error("Unable to recover duplicate CRM request.");
          quoteRequestId = racedRequest.id;
        } else {
          quoteRequestId = requestRow.id;
        }
      }

      const { error: linkError } = await supabase
        .from("meta_lead_attributions")
        .update({ quote_request_id: quoteRequestId })
        .eq("id", attribution.id);
      if (linkError) throw new Error("Unable to link Meta attribution to CRM request.");
    }

    return { leadgen_id: leadId, quote_request_id: quoteRequestId };
  });

  events.push(...result.completed);
  for (const item of result.failed) {
    failed.push({ leadId: item.item.leadId, error: item.error });
    const error = item.error;
    const fixedReasons: Record<string, string> = {
      "Unable to save Meta lead attribution.": "attribution_upsert_failed",
      "Unable to look up CRM request.": "crm_request_lookup_failed",
      "Unable to create CRM request.": "crm_request_insert_failed",
      "Unable to recover duplicate CRM request.": "crm_request_recovery_failed",
      "Unable to link Meta attribution to CRM request.": "attribution_link_failed",
    };
    const safeReason =
      error instanceof MetaLeadFetchError
        ? "meta_lead_fetch_failed"
        : error instanceof Error
          ? (fixedReasons[error.message] ?? "unknown_processing_error")
          : "unknown_processing_error";
    console.error(
      JSON.stringify({
        event: "meta_webhook_lead_processing_failed",
        reason: safeReason,
        ...(error instanceof MetaLeadFetchError
          ? {
              meta_http_status: error.httpStatus,
              meta_error_code: error.metaErrorCode,
              meta_error_subcode: error.metaErrorSubcode,
            }
          : {}),
      }),
    );
  }

  if (failed.length > 0) {
    console.warn(
      JSON.stringify({
        event: "meta_webhook_partial_processing",
        processed_count: events.length,
        failed_count: failed.length,
      }),
    );
    return Response.json(
      { ok: false, processed: events.length, failed: failed.length },
      { status: 502 },
    );
  }

  return Response.json({ ok: true, processed: events });
});
