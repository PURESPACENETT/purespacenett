import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { checkRateLimit, requestKey } from "@/lib/rate-limit";

const noStore = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" };

const schema = z.object({
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
        const limit = checkRateLimit(requestKey(request, "b2b-lead"), { limit: 5, windowMs: 60 * 60 * 1000 });
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
            return Response.json({ error: "Transmission au CRM impossible" }, { status: 502, headers: noStore });
          }

          return Response.json({ ok: true }, { headers: noStore });
        } catch (error) {
          console.error("B2B CRM bridge failed", error);
          return Response.json({ error: "Transmission au CRM impossible" }, { status: 502, headers: noStore });
        }
      },
    },
  },
});
