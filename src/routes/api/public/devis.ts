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
        const { data: inserted, error } = await supabaseAdmin.from("quote_requests").insert({
          full_name: data.fullName,
          email: data.email,
          phone: data.phone,
          address: data.address || null,
          property_type: data.propertyType || null,
          surface: data.surface || null,
          service_type: data.serviceType,
          frequency: data.frequency || null,
          message: data.message || null,
        });

        if (error) {
          console.error("Enregistrement du devis impossible", error.message);
          return Response.json({ error: "Enregistrement impossible" }, { status: 500 });
        }

        return Response.json({ ok: true });
      },
    },
  },
});
