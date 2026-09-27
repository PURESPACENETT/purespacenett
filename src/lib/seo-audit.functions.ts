import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type SeoIssue = {
  titre: string;
  priorite: "haute" | "moyenne" | "normal";
  categorie: string;
  constat: string;
  explication: string;
  action: string;
  pages: string[];
};

export type SeoAuditResult = {
  synthese: string;
  etat_general: string;
  problemes: SeoIssue[];
  prochaines_etapes: string[];
};

const MAX_CHARS = 120_000;

const InputSchema = z.object({
  filename: z.string().min(1).max(300),
  content: z.string().min(1),
});

const SYSTEM_PROMPT = `Tu es un expert du référencement local en France et de Google Search Console.
Tu analyses le rapport fourni par le propriétaire de PURE SPACE NETT, une micro-entreprise de nettoyage
basée au Pré-Saint-Gervais (93310) dont le site est https://purespacenett.com. Le site a des pages par
prestation et une page par ville (Le Pré-Saint-Gervais, Pantin, Les Lilas, Aubervilliers, Montreuil,
Bagnolet, Saint-Denis, Paris, Île-de-France).

Règles impératives :
- Tu parles français, simplement, sans jargon technique. Le lecteur n'est pas informaticien.
- Tu te bases UNIQUEMENT sur les données du rapport. Tu n'inventes aucun chiffre ni aucune URL.
- Tu classes chaque point en priorité "haute" (bloque vraiment l'apparition dans Google),
  "moyenne" (améliore la position ou le taux de clic) ou "normal" (alerte sans danger, aucune action).
- Les redirections de www vers le domaine principal, les anciennes adresses WordPress supprimées
  (wp-login.php, wp-admin) et les pages techniques volontairement exclues sont "normal".
- Pour chaque point : un constat chiffré tiré du rapport, une explication en langage courant,
  et une action concrète et réalisable (sur le site ou dans Search Console).
- Trie les problèmes de la priorité la plus haute à la plus basse. Maximum 12 problèmes.
- "prochaines_etapes" : 3 à 6 actions dans l'ordre à faire en premier.`;

const JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    synthese: { type: "string" },
    etat_general: { type: "string" },
    problemes: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          titre: { type: "string" },
          priorite: { type: "string", enum: ["haute", "moyenne", "normal"] },
          categorie: { type: "string" },
          constat: { type: "string" },
          explication: { type: "string" },
          action: { type: "string" },
          pages: { type: "array", items: { type: "string" } },
        },
        required: [
          "titre",
          "priorite",
          "categorie",
          "constat",
          "explication",
          "action",
          "pages",
        ],
      },
    },
    prochaines_etapes: { type: "array", items: { type: "string" } },
  },
  required: ["synthese", "etat_general", "problemes", "prochaines_etapes"],
} as const;

/** Analyse IA d'un rapport SEO / Search Console. Réservé aux administrateurs. */
export const analyzeSeoReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data, context }): Promise<SeoAuditResult> => {
    const { data: roles, error: roleError } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .limit(1);
    if (roleError) throw new Error(roleError.message);
    if (!roles || roles.length === 0) {
      throw new Error("Accès réservé à l'administrateur du site.");
    }

    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("La clé d'accès au service d'analyse est absente.");

    const excerpt = data.content.slice(0, MAX_CHARS);
    const truncated = data.content.length > MAX_CHARS;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        stream: true,
        store: false,
        reasoning: { effort: "medium", summary: "auto" },
        instructions: SYSTEM_PROMPT,
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: `Fichier analysé : ${data.filename}${
                  truncated ? " (extrait des premières lignes, fichier volumineux)" : ""
                }\n\nContenu du rapport :\n\n${excerpt}`,
              },
            ],
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "audit_seo",
            strict: true,
            schema: JSON_SCHEMA,
          },
        },
      }),
    });

    if (!response.ok || !response.body) {
      const detail = await response.text().catch(() => "");
      if (response.status === 402) {
        throw new Error(
          "Les crédits d'analyse sont épuisés. Rechargez-les dans les réglages de l'espace Lovable.",
        );
      }
      if (response.status === 429) {
        throw new Error("Le service d'analyse est momentanément saturé. Réessayez dans une minute.");
      }
      throw new Error(
        `L'analyse a échoué (code ${response.status}). ${detail.slice(0, 300)}`.trim(),
      );
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let text = "";

    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      buffer += decoder.decode(chunk.value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const event = JSON.parse(payload) as {
            type?: string;
            delta?: string;
            response?: { output_text?: string };
          };
          if (event.type === "response.output_text.delta" && typeof event.delta === "string") {
            text += event.delta;
          } else if (event.type === "response.completed" && event.response?.output_text) {
            if (!text) text = event.response.output_text;
          }
        } catch {
          // Ligne SSE partielle ou non JSON : on l'ignore.
        }
      }
    }

    if (!text.trim()) {
      throw new Error("Le service d'analyse n'a renvoyé aucun résultat. Réessayez.");
    }

    let parsed: SeoAuditResult;
    try {
      parsed = JSON.parse(text) as SeoAuditResult;
    } catch {
      throw new Error("Le résultat de l'analyse est illisible. Réessayez.");
    }

    return {
      synthese: parsed.synthese ?? "",
      etat_general: parsed.etat_general ?? "",
      problemes: Array.isArray(parsed.problemes) ? parsed.problemes.slice(0, 12) : [],
      prochaines_etapes: Array.isArray(parsed.prochaines_etapes)
        ? parsed.prochaines_etapes.slice(0, 8)
        : [],
    };
  });
