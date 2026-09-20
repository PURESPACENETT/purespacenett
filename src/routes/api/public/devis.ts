import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const schema = z.object({
  fullName: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(6).max(30),
  address: z.string().trim().max(200).optional().default(""),
  propertyType: z.string().trim().max(50).optional().default(""),
  surface: z.string().trim().max(20).optional().default(""),
  serviceType: z.string().trim().min(2).max(80),
  frequency: z.string().trim().max(50).optional().default(""),
  message: z.string().trim().max(2000).optional().default(""),
  consent: z.literal(true),
  // champ piège anti-robots : doit rester vide
  company: z.string().max(0).optional().default(""),
});

export const Route = createFileRoute("/api/public/devis")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      // Google ne doit pas indexer ce point d'entrée : réponse explicite 405 + noindex.
      GET: async () =>
        new Response("Method Not Allowed", {
          status: 405,
          headers: { Allow: "POST", "X-Robots-Tag": "noindex, nofollow" },
        }),
      POST: async ({ request }) => {
        let payload: unknown;
        try {
          payload = await request.json();
        } catch {
          return Response.json({ error: "Requête invalide" }, { status: 400 });
        }

        const parsed = schema.safeParse(payload);
        if (!parsed.success) {
          return Response.json({ error: "Formulaire incomplet ou invalide" }, { status: 400 });
        }
        const data = parsed.data;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: inserted, error } = await supabaseAdmin
          .from("quote_requests")
          .insert({
            full_name: data.fullName,
            email: data.email,
            phone: data.phone,
            address: data.address || null,
            property_type: data.propertyType || null,
            surface: data.surface || null,
            service_type: data.serviceType,
            frequency: data.frequency || null,
            message: data.message || null,
          })
          .select("id")
          .single();

        if (error) {
          console.error("Enregistrement du devis impossible", error.message);
          return Response.json({ error: "Enregistrement impossible" }, { status: 500 });
        }

        try {
          const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
          await sendTemplateEmail("nouvelle-demande-devis", "contact@purespacenett.com", {
            templateData: {
              fullName: data.fullName,
              email: data.email,
              phone: data.phone,
              address: data.address,
              propertyType: data.propertyType,
              surface: data.surface,
              serviceType: data.serviceType,
              frequency: data.frequency,
              message: data.message,
            },
            idempotencyKey: `nouvelle-demande-devis-${inserted?.id ?? data.email}`,
            replyTo: data.email,
          });
        } catch (mailError) {
          console.error("Notification e-mail du devis impossible", mailError);
        }

        return Response.json({ ok: true });
      },
    },
  },
});
