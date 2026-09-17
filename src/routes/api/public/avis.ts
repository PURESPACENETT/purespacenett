import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const schema = z.object({
  authorName: z.string().trim().min(2).max(100),
  city: z.string().trim().max(80).optional().default(""),
  serviceType: z.string().trim().max(80).optional().default(""),
  rating: z.coerce.number().int().min(1).max(5),
  message: z.string().trim().min(10).max(2000),
  email: z.string().trim().email().max(255).optional().or(z.literal("")).default(""),
  // champ piège anti-robots : doit rester vide
  company: z.string().max(0).optional().default(""),
});

export const Route = createFileRoute("/api/public/avis")({
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
        const { error } = await supabaseAdmin.from("review_submissions").insert({
          author_name: data.authorName,
          city: data.city || null,
          service_type: data.serviceType || null,
          rating: data.rating,
          message: data.message,
          email: data.email || null,
        });

        if (error) {
          console.error("Enregistrement de l'avis impossible", error.message);
          return Response.json({ error: "Enregistrement impossible" }, { status: 500 });
        }

        return Response.json({ ok: true });
      },
    },
  },
});
