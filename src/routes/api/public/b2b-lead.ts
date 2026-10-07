import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { checkRateLimit, requestKey } from "@/lib/rate-limit";
import { retryTransient } from "@/lib/retry-transient";

const noStore = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" };

const schema = z.object({
  contactName: z.string().trim().min(2).max(120),
  sourceExternalId: z.string().uuid().optional(),
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
  gclid: z.string().trim().max(200).optional(),
  gbraid: z.string().trim().max(200).optional(),
  wbraid: z.string().trim().max(200).optional(),
  utm_source: z.string().trim().max(100).optional(),
  utm_medium: z.string().trim().max(100).optional(),
  utm_campaign: z.string().trim().max(200).optional(),
  utm_content: z.string().trim().max(200).optional(),
  utm_term: z.string().trim().max(200).optional(),
  landing_page: z.string().trim().max(500).optional(),
  referrer: z.string().trim().max(1000).optional(),
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

        const url = process.env["FUNNEL_B2B_WEBHOOK_URL"]?.trim();
        const secret = process.env["FUNNEL_B2B_WEBHOOK_SECRET"]?.trim();
        if (!url || !secret) {
          console.error("B2B CRM bridge is not configured");
          return Response.json({ error: "Canal B2B temporairement indisponible" }, { status: 503, headers: noStore });
        }

        const data = parsed.data;
        const payload = {
          clientType: "sous_traitance",
          sourceExternalId: data.sourceExternalId,
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
          gclid: data.gclid,
          gbraid: data.gbraid,
          wbraid: data.wbraid,
          utm_source: data.utm_source,
          utm_medium: data.utm_medium,
          utm_campaign: data.utm_campaign,
          utm_content: data.utm_content,
          utm_term: data.utm_term,
          landing_page: data.landing_page,
          referrer: data.referrer,
          message: [
            "Source : site PURE SPACE NETT — demande de sous-traitance.",
            data.message,
          ].filter(Boolean).join("\n\n"),
        };

        try {
          const response = await retryTransient(
            () => fetch(url, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-b2b-lead-secret": secret,
              },
              body: JSON.stringify(payload),
              signal: AbortSignal.timeout(3500),
            }),
            (result) => result.status >= 500,
            { attempts: 3, initialDelayMs: 200 },
          );

          if (!response.ok) {
            console.error("B2B CRM bridge rejected lead", { status: response.status });
            return Response.json({ error: "Transmission au CRM impossible" }, { status: 502, headers: noStore });
          }

          return Response.json({ ok: true }, { headers: noStore });
        } catch (error) {
          console.error("B2B CRM bridge failed", error instanceof Error ? error.name : "unknown_error");
          return Response.json({ error: "Transmission au CRM impossible" }, { status: 502, headers: noStore });
        }
      },
    },
  },
});
