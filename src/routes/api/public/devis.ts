import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { checkRateLimit, requestKey } from "@/lib/rate-limit";

const MAX_PHOTOS = 5;
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
// Extension déduite uniquement du type MIME validé, jamais du nom de fichier fourni.
const PHOTO_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
};
const ALLOWED_PHOTO_TYPES = new Set(Object.keys(PHOTO_EXTENSIONS));

const noStore = { "Cache-Control": "no-store" };

const schema = z.object({
  fullName: z.string().trim().min(2).max(100),
  clientType: z.enum(["entreprise", "sous_traitance", "particulier"]),
  companyName: z.string().trim().max(160).optional().default(""),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(6).max(30),
  address: z.string().trim().max(200).optional().default(""),
  city: z.string().trim().min(1).max(120),
  postalCode: z.string().trim().min(4).max(10),
  propertyType: z.string().trim().max(50).optional().default(""),
  surface: z.string().trim().min(1).max(20),
  serviceType: z.string().trim().min(2).max(80),
  frequency: z.string().trim().max(50).optional().default(""),
  desiredDate: z.string().trim().max(20).optional().default(""),
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
          headers: { Allow: "POST", "X-Robots-Tag": "noindex, nofollow", ...noStore },
        }),
      POST: async ({ request }) => {
        const limit = await checkRateLimit(requestKey(request, "devis"), { limit: 5, windowMs: 60 * 60 * 1000 });
        if (!limit.allowed) {
          return Response.json(
            { error: "Trop de demandes. Réessayez plus tard." },
            { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds), ...noStore } },
          );
        }

        let formData: FormData;
        try {
          formData = await request.formData();
        } catch {
          return Response.json({ error: "Requête invalide" }, { status: 400, headers: noStore });
        }

        const photos = formData.getAll("photos").filter((value): value is File => value instanceof File);
        if (photos.length > MAX_PHOTOS || photos.some((photo) => photo.size > MAX_PHOTO_SIZE || !ALLOWED_PHOTO_TYPES.has(photo.type))) {
          return Response.json(
            { error: "Photos invalides : 5 maximum, 5 Mo maximum chacune, JPG/PNG/WebP/HEIC/HEIF." },
            { status: 400, headers: noStore },
          );
        }

        const payload = Object.fromEntries(
          ["fullName", "clientType", "companyName", "email", "phone", "address", "city", "postalCode", "propertyType", "surface", "serviceType", "frequency", "desiredDate", "message", "company"]
            .map((key) => [key, formData.get(key) ?? ""]),
        );
        (payload as Record<string, unknown>)["consent"] = formData.get("consent") === "true";
        const parsed = schema.safeParse(payload);
        if (!parsed.success) {
          return Response.json({ error: "Formulaire incomplet ou invalide" }, { status: 400, headers: noStore });
        }
        const data = parsed.data;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const bucket = "quote-photos";
        const photoUrls: string[] = [];
        const uploadedPhotoPaths: string[] = [];

        if (photos.length > 0) {
          // Le stockage privé "quote-photos" est déjà provisionné (privé, 5 Mo, types image autorisés).
          for (const photo of photos) {
            const extension = PHOTO_EXTENSIONS[photo.type];
            const path = `devis/${crypto.randomUUID()}.${extension}`;
            const { error: uploadError } = await supabaseAdmin.storage
              .from(bucket)
              .upload(path, await photo.arrayBuffer(), { contentType: photo.type, upsert: false });

            if (uploadError) {
              console.error("Upload photo impossible", uploadError.message);
              if (uploadedPhotoPaths.length > 0) {
                await supabaseAdmin.storage.from(bucket).remove(uploadedPhotoPaths);
              }
              return Response.json({ error: "Une photo n'a pas pu être enregistrée" }, { status: 500, headers: noStore });
            }

            uploadedPhotoPaths.push(path);

            const { data: signed, error: signedError } = await supabaseAdmin.storage
              .from(bucket)
              .createSignedUrl(path, 7 * 24 * 60 * 60);

            if (signedError || !signed?.signedUrl) {
              console.error("URL photo impossible", signedError?.message);
              if (uploadedPhotoPaths.length > 0) {
                await supabaseAdmin.storage.from(bucket).remove(uploadedPhotoPaths);
              }
              return Response.json({ error: "Accès aux photos impossible" }, { status: 500, headers: noStore });
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
          if (uploadedPhotoPaths.length > 0) {
            await supabaseAdmin.storage.from(bucket).remove(uploadedPhotoPaths);
          }
          return Response.json({ error: "Enregistrement impossible" }, { status: 500, headers: noStore });
        }

        const crmUrl =
          process.env["FUNNEL_QUOTE_WEBHOOK_URL"]?.trim() ??
          "https://funnel-friendship.lovable.app/api/public/hooks/quote-request";
        // Le routage reste historique, mais le secret serveur privilégie désormais
        // la variable d'environnement. Le RPC Vault reste un fallback de compatibilité.
        let crmSecret = process.env["FUNNEL_QUOTE_WEBHOOK_SECRET"]?.trim() ?? "";
        if (!crmSecret) {
          const { data: bridgeSecret, error: bridgeSecretError } =
            await supabaseAdmin.rpc("get_quote_webhook_secret");
          crmSecret = bridgeSecretError ? "" : (bridgeSecret ?? "").trim();
        }
        if (crmUrl && crmSecret) {
          const propertyTypeMap: Record<string, string> = {
            Maison: "logement",
            Appartement: "logement",
            Bureau: "bureaux",
            Commerce: "commerce",
            Immeuble: "immeuble",
          };
          const serviceMap: Record<string, string> = {
            "Nettoyage de bureaux et locaux professionnels": "nettoyage_courant",
            "Entretien de copropriété et parties communes": "nettoyage_courant",
            "Entretien de local commercial ou boutique": "nettoyage_courant",
            "Ménage régulier (particulier)": "nettoyage_courant",
            "Ménage ponctuel / grand nettoyage": "nettoyage_courant",
            "Nettoyage de vitres et vitrines": "vitrerie",
            "Nettoyage fin de chantier": "fin_de_chantier",
            "Remise en état après sinistre ou dégradation": "remise_en_etat",
            "Désinfection et sanitaires": "desinfection",
          };
          const frequencyMap: Record<string, string> = {
            "Une seule fois": "ponctuel",
            Hebdomadaire: "hebdomadaire",
            "Bi-mensuel": "plusieurs_semaine",
            Mensuel: "hebdomadaire",
          };
          const crmPayload = {
            sourceExternalId: inserted.id,
            clientType: data.clientType,
            propertyType: propertyTypeMap[data.propertyType] ?? "autre",
            surfaceM2: Number(data.surface),
            frequency: frequencyMap[data.frequency] ?? "ponctuel",
            services: [serviceMap[data.serviceType] ?? "nettoyage_courant"],
            city: data.city,
            postalCode: data.postalCode,
            desiredDate: data.desiredDate,
            contactName: data.fullName,
            companyName: data.companyName || "",
            email: data.email,
            phone: data.phone,
            message: [
              "Source : site PURE SPACE NETT — formulaire de devis.",
              "Adresse : " + (data.address || "Non précisée"),
              "Prestation : " + data.serviceType,
              data.message,
            ].filter(Boolean).join("\n"),
          };

          try {
            const response = await fetch(crmUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-quote-webhook-secret": crmSecret,
              },
              body: JSON.stringify(crmPayload),
              signal: AbortSignal.timeout(10000),
            });
            if (!response.ok) console.error("CRM quote bridge rejected request", response.status);
          } catch (crmError) {
            console.error("CRM quote bridge failed", crmError);
          }
        } else {
          console.warn("CRM quote bridge is not configured");
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

        return Response.json({ ok: true }, { headers: noStore });
      },
    },
  },
});
