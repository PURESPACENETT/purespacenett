import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { checkRateLimit, requestKey } from "@/lib/rate-limit";

const noStore = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" };

const schema = z.object({
  requestId: z.string().uuid(),
  contactName: z.string().trim().min(2).max(120),
  companyName: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(6).max(30),
  propertyType: z.enum(["bureaux", "commerce", "immeuble", "chantier", "autre"]),
  surfaceM2: z.coerce.number().int().min(1).max(200000),
  frequency: z.enum(["ponctuel", "hebdomadaire", "plusieurs_semaine", "quotidien", "contrat_annuel"]),
  services: z.array(z.enum(["nettoyage_courant", "vitrerie", "remise_en_etat", "fin_de_chantier", "desinfection"])).min(1),
  city: z.string().trim().min(1).max(120),
  postalCode: z.string().trim().min(4).max(10),
  desiredDate: z.string().trim().max(20).optional().default(""),
  message: z.string().trim().max(1500).optional().default(""),
  consent: z.literal(true),
});

export const Route = createFileRoute("/api/public/b2b-lead")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      GET: async () =>
        new Response("Method Not Allowed", {
          status: 405,
          headers: { Allow: "POST", ...noStore },
        }),
      POST: async ({ request }) => {
        const limit = await checkRateLimit(requestKey(request, "b2b-lead"), { limit: 5, windowMs: 60 * 60 * 1000 });
        if (!limit.allowed) {
          return Response.json({ error: "Trop de demandes. Réessayez plus tard." }, { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds), ...noStore } });
        }

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Requête invalide" }, { status: 400, headers: noStore });
        }

        // Piège anti-robots : analysé avant la validation, réponse neutre sans transmission.
        if (body && typeof body === "object" && typeof (body as Record<string, unknown>)["website"] === "string" && ((body as Record<string, unknown>)["website"] as string).trim() !== "") {
          return Response.json({ ok: true }, { headers: noStore });
        }

        const parsed = schema.safeParse(body);
        if (!parsed.success) {
          return Response.json({ error: "Formulaire incomplet ou invalide" }, { status: 400, headers: noStore });
        }

        const data = parsed.data;
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: existing, error: lookupError } = await supabaseAdmin
          .from("quote_requests")
          .select("id,delivery_attempts")
          .eq("request_id", data.requestId)
          .maybeSingle();

        if (lookupError) {
          console.error("B2B request idempotency lookup failed", lookupError.message);
          return Response.json({ error: "Enregistrement de la demande impossible" }, { status: 500, headers: noStore });
        }

        let leadId = existing?.id;
        let deliveryAttempts = existing?.delivery_attempts ?? 0;
        if (!leadId) {
          leadId = crypto.randomUUID();
          const { data: inserted, error: insertError } = await supabaseAdmin
            .from("quote_requests")
            .insert({
              id: leadId,
              request_id: data.requestId,
              source_system: "purespacenett_b2b",
              source_external_id: leadId,
              full_name: data.contactName,
              client_type: "sous_traitance",
              property_type: data.propertyType,
              surface: String(data.surfaceM2),
              surface_m2: data.surfaceM2,
              service_type: data.services[0] ?? null,
              services: data.services,
              frequency: data.frequency,
              city: data.city,
              postal_code: data.postalCode,
              desired_date: data.desiredDate || null,
              contact_name: data.contactName,
              company_name: data.companyName,
              email: data.email.trim().toLowerCase(),
              phone: data.phone,
              message: [
                "Source : site PURE SPACE NETT — demande de sous-traitance.",
                data.message,
              ].filter(Boolean).join("\n\n"),
              crm_delivery_status: "pending",
              email_delivery_status: "pending",
              delivery_attempts: 0,
            })
            .select("id,delivery_attempts")
            .single();

          if (insertError) {
            if (insertError.code === "23505") {
              const { data: duplicate } = await supabaseAdmin
                .from("quote_requests")
                .select("id,delivery_attempts")
                .eq("request_id", data.requestId)
                .maybeSingle();
              if (duplicate) {
                leadId = duplicate.id;
                deliveryAttempts = duplicate.delivery_attempts ?? 0;
              } else {
                console.error("B2B idempotent insert conflict without matching request");
                return Response.json({ error: "Enregistrement de la demande impossible" }, { status: 500, headers: noStore });
              }
            } else {
              console.error("B2B request persistence failed", insertError.message);
              return Response.json({ error: "Enregistrement de la demande impossible" }, { status: 500, headers: noStore });
            }
          } else if (inserted) {
            leadId = inserted.id;
            deliveryAttempts = inserted.delivery_attempts ?? 0;
          }
        }

        const url = process.env["FUNNEL_B2B_WEBHOOK_URL"]?.trim();
        const secret = process.env["FUNNEL_B2B_WEBHOOK_SECRET"]?.trim();
        const attemptAt = new Date().toISOString();
        const attemptNumber = deliveryAttempts + 1;
        const updateDelivery = async (status: "sent" | "error", errorMessage: string | null = null) => {
          const { error } = await supabaseAdmin
            .from("quote_requests")
            .update({
              crm_delivery_status: status,
              crm_delivered_at: status === "sent" ? attemptAt : null,
              delivery_attempts: attemptNumber,
              last_delivery_attempt_at: attemptAt,
              last_delivery_error: errorMessage,
            })
            .eq("id", leadId);
          if (error) console.error("B2B delivery tracking failed", error.message);
        };

        if (!url || !secret) {
          console.error("B2B CRM bridge is not configured; request remains stored locally");
          await updateDelivery("error", "CRM bridge is not configured");
          return Response.json({ error: "Votre demande est enregistrée, mais le CRM est temporairement indisponible. Réessayez plus tard.", saved: true }, { status: 503, headers: noStore });
        }

        const payload = {
          sourceExternalId: leadId,
          clientType: "sous_traitance",
          propertyType: data.propertyType,
          surfaceM2: data.surfaceM2,
          frequency: data.frequency,
          services: data.services,
          city: data.city,
          postalCode: data.postalCode,
          desiredDate: data.desiredDate,
          contactName: data.contactName,
          companyName: data.companyName,
          email: data.email,
          phone: data.phone,
          message: [
            "Source : site PURE SPACE NETT — demande de sous-traitance.",
            data.message,
          ].filter(Boolean).join("\n\n"),
        };

        try {
          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-b2b-lead-secret": secret,
            },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(10000),
          });

          if (!response.ok) {
            console.error("B2B CRM bridge rejected lead", response.status);
            await updateDelivery("error", `CRM HTTP ${response.status}`);
            return Response.json({ error: "Votre demande est enregistrée, mais le CRM ne l'a pas encore reçue. Réessayez." , saved: true }, { status: 502, headers: noStore });
          }

          await updateDelivery("sent");
          return Response.json({ ok: true }, { headers: noStore });
        } catch (error) {
          console.error("B2B CRM bridge failed", error);
          await updateDelivery("error", "CRM network request failed");
          return Response.json({ error: "Votre demande est enregistrée, mais la transmission au CRM a échoué. Réessayez." , saved: true }, { status: 502, headers: noStore });
        }
      },
    },
  },
});
