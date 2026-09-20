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
          .from("review_submissions")
          .insert({
            author_name: data.authorName,
            city: data.city || null,
            service_type: data.serviceType || null,
            rating: data.rating,
            message: data.message,
            email: data.email || null,
          })
          .select("id")
          .single();

        if (error) {
          console.error("Enregistrement de l'avis impossible", error.message);
          return Response.json({ error: "Enregistrement impossible" }, { status: 500 });
        }

        try {
          const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
          await sendTemplateEmail("nouvel-avis-client", "contact@purespacenett.com", {
            templateData: {
              authorName: data.authorName,
              city: data.city,
              serviceType: data.serviceType,
              rating: data.rating,
              message: data.message,
              email: data.email,
            },
            idempotencyKey: `nouvel-avis-client-${inserted?.id ?? data.authorName}`,
            ...(data.email ? { replyTo: data.email } : {}),
          });
        } catch (mailError) {
          console.error("Notification e-mail de l'avis impossible", mailError);
        }

        return Response.json({ ok: true });
      },
    },
  },
});
