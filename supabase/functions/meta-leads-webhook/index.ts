import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GRAPH_VERSION = Deno.env.get("META_GRAPH_API_VERSION");
const LEAD_ACCESS_TOKEN = Deno.env.get("META_LEADS_ACCESS_TOKEN") ?? Deno.env.get("META_ACCESS_TOKEN");
const VERIFY_TOKEN = Deno.env.get("META_VERIFY_TOKEN");
const APP_SECRET = Deno.env.get("META_APP_SECRET");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!GRAPH_VERSION || !LEAD_ACCESS_TOKEN || !VERIFY_TOKEN || !APP_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
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

async function verifySignature(request: Request, rawBody: string): Promise<"valid" | "missing" | "malformed" | "mismatch"> {
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
  const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody));
  const expected = "sha256=" + [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
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

async function fetchLead(leadId: string) {
  const url = new URL(`https://graph.facebook.com/${GRAPH_VERSION}/${encodeURIComponent(leadId)}`);
  url.searchParams.set("access_token", LEAD_ACCESS_TOKEN!);
  url.searchParams.set("fields", "id,created_time,form_id,ad_id,adset_id,campaign_id,field_data,custom_disclaimer_responses");
  const response = await fetch(url);
  const payload = await response.json();
  if (!response.ok || payload.error) throw new Error("Unable to retrieve Meta lead.");
  return payload;
}

Deno.serve(async (request) => {
  if (request.method === "GET") {
    const url = new URL(request.url);
    const mode = url.searchParams.get("hub.mode") ?? url.searchParams.get("hub_mode");
    const token = url.searchParams.get("hub.verify_token") ?? url.searchParams.get("hub_verify_token");
    const challenge = url.searchParams.get("hub.challenge") ?? url.searchParams.get("hub_challenge");
    if (mode === "subscribe" && token && constantTimeEqual(token, VERIFY_TOKEN!)) {
      return new Response(challenge ?? "", { status: 200 });
    }
    return new Response("Forbidden", { status: 403 });
  }

  if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  const rawBody = await request.text();
  const signatureStatus = await verifySignature(request, rawBody);
  if (signatureStatus !== "valid") {
    // Deliberately log only a fixed classification. Never log the signature, app secret, or body.
    console.warn(JSON.stringify({
      event: "meta_webhook_signature_rejected",
      signature_status: signatureStatus,
      app_secret_configured: Boolean(APP_SECRET),
    }));
    return new Response("Invalid signature", { status: 403 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const events: Array<{ leadgen_id: string; quote_request_id: string | null }> = [];
  const entries = Array.isArray(payload.entry) ? payload.entry : [];

  try {
    for (const entryValue of entries) {
      const entry = entryValue as Record<string, unknown>;
      const changes = Array.isArray(entry.changes) ? entry.changes : [];
      for (const changeValue of changes) {
        const change = changeValue as Record<string, unknown>;
        if (change.field !== "leadgen" && change.field !== "leadgen_update") continue;

        const value = (change.value ?? {}) as Record<string, unknown>;
        const leadId = String(value.leadgen_id ?? "");
        if (!leadId) continue;

        const lead = await fetchLead(leadId);
        const fields = fieldMap(lead.field_data);
        const contactName = fields.full_name || [fields.first_name, fields.last_name].filter(Boolean).join(" ");
        const email = fields.email || fields.email_address || null;
        const phone = fields.phone_number || fields.phone || null;

        const { data: attribution, error: attributionError } = await supabase
          .from("meta_lead_attributions")
          .upsert({
            lead_external_id: leadId,
            source: "meta_lead_ads",
            meta_page_id: value.page_id ? String(value.page_id) : String(entry.id ?? ""),
            meta_form_id: lead.form_id ? String(lead.form_id) : (value.form_id ? String(value.form_id) : null),
            meta_campaign_id: lead.campaign_id ? String(lead.campaign_id) : null,
            meta_adset_id: lead.adset_id ? String(lead.adset_id) : null,
            meta_ad_id: lead.ad_id ? String(lead.ad_id) : (value.ad_id ? String(value.ad_id) : null),
            lead_created_at: lead.created_time ? new Date(lead.created_time).toISOString() : null,
            raw: {
              event_field: change.field,
              lead_id: leadId,
              page_id: value.page_id ? String(value.page_id) : String(entry.id ?? ""),
              form_id: lead.form_id ? String(lead.form_id) : (value.form_id ? String(value.form_id) : null),
              campaign_id: lead.campaign_id ? String(lead.campaign_id) : null,
              adset_id: lead.adset_id ? String(lead.adset_id) : null,
              ad_id: lead.ad_id ? String(lead.ad_id) : (value.ad_id ? String(value.ad_id) : null),
              field_names: Array.isArray(lead.field_data)
                ? lead.field_data.map((field: Record<string, unknown>) => String(field.name ?? ""))
                : [],
            },
          }, { onConflict: "lead_external_id" })
          .select("id,quote_request_id")
          .single();

        if (attributionError) throw new Error("Unable to save Meta lead attribution.");

        let quoteRequestId = attribution.quote_request_id as string | null;

        if (!quoteRequestId && contactName && email && phone) {
          const requestedClientType = fields.client_type;
          const clientType = requestedClientType === "entreprise" || requestedClientType === "sous_traitance"
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
              estimate_min: 0,
              estimate_max: 0,
            })
            .select("id")
            .single();

          if (requestError) throw new Error("Unable to create CRM request.");
          quoteRequestId = requestRow.id;

          const { error: linkError } = await supabase
            .from("meta_lead_attributions")
            .update({ quote_request_id: quoteRequestId })
            .eq("id", attribution.id);
          if (linkError) throw new Error("Unable to link Meta attribution to CRM request.");
        }

        events.push({ leadgen_id: leadId, quote_request_id: quoteRequestId });
      }
    }
  } catch (error) {
    // Avoid putting prospect fields or Graph API responses in Edge Function logs.
    console.error(JSON.stringify({
      event: "meta_webhook_processing_failed",
      reason: error instanceof Error ? error.message : "Unknown processing error",
    }));
    return new Response("Unable to process Meta lead event", { status: 502 });
  }

  return Response.json({ ok: true, processed: events });
});
