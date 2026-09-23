import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { checkRateLimit, requestKey } from "@/lib/rate-limit";

const MAX_PHOTOS = 5;
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);

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
        const limit = checkRateLimit(requestKey(request, "devis"), { limit: 5, windowMs: 60 * 60 * 1000 });
        if (!limit.allowed) {
          return Response.json({ error: "Trop de demandes. Réessayez plus tard." }, { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } });
        }

        let formData: FormData;
        try {
          formData = await request.formData();
        } catch {
          return Response.json({ error: "Requête invalide" }, { status: 400 });
        }

        const photos = formData.getAll("photos").filter((value): value is File => value instanceof File);
        if (photos.length > MAX_PHOTOS || photos.some((photo) => photo.size > MAX_PHOTO_SIZE || !ALLOWED_PHOTO_TYPES.has(photo.type))) {
          return Response.json({ error: "Photos invalides : 5 maximum, 5 Mo maximum chacune, JPG/PNG/WebP/HEIC/HEIF." }, { status: 400 });
        }

        const payload = Object.fromEntries(
          ["fullName", "email", "phone", "address", "propertyType", "surface", "serviceType", "frequency", "message", "company"]
            .map((key) => [key, formData.get(key) ?? ""]),
        );
        (payload as Record<string, unknown>).consent = formData.get("consent") === "true";
        const parsed = schema.safeParse(payload);
        if (!parsed.success) {
          return Response.json({ error: "Formulaire incomplet ou invalide" }, { status: 400 });
        }
        const data = parsed.data;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const photoUrls: string[] = [];

        if (photos.length > 0) {
          const bucket = "quote-photos";
          const { error: bucketError } = await supabaseAdmin.storage.createBucket(bucket, { public: false, fileSizeLimit: MAX_PHOTO_SIZE, allowedMimeTypes: [...ALLOWED_PHOTO_TYPES] });
          if (bucketError && !/already exists/i.test(bucketError.message)) {
            console.error("Création du stockage photos impossible", bucketError.message);
            return Response.json({ error: "Stockage des photos indisponible" }, { status: 500 });
          }

          for (const photo of photos) {
            const extension = photo.name.includes(".") ? photo.name.split(".").pop()?.toLowerCase() : "jpg";
            const path = `devis/${crypto.randomUUID()}.${extension}`;
            const { error: uploadError } = await supabaseAdmin.storage
              .from(bucket)
              .upload(path, await photo.arrayBuffer(), { contentType: photo.type, upsert: false });

            if (uploadError) {
              console.error("Upload photo impossible", uploadError.message);
              return Response.json({ error: "Une photo n'a pas pu être enregistrée" }, { status: 500 });
            }

            const { data: signed, error: signedError } = await supabaseAdmin.storage
              .from(bucket)
              .createSignedUrl(path, 7 * 24 * 60 * 60);

            if (signedError || !signed?.signedUrl) {
              console.error("URL photo impossible", signedError?.message);
              return Response.json({ error: "Accès aux photos impossible" }, { status: 500 });
            }
            photoUrls.push(signed.signedUrl);
          }
        }
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
              photoUrls,
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
