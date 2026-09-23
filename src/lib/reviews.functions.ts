import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const REVIEW_STATUSES = ["nouveau", "publié", "refusé"] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export type ReviewSubmission = {
  id: string;
  author_name: string;
  city: string | null;
  service_type: string | null;
  rating: number;
  message: string;
  email: string | null;
  status: string;
  created_at: string;
};

/** Avis publié, sans aucune donnée personnelle (pas d'e-mail). */
export type PublishedReview = {
  id: string;
  author_name: string;
  city: string | null;
  service_type: string | null;
  rating: number;
  message: string;
  created_at: string;
};

export type PublishedReviewsSummary = {
  reviews: PublishedReview[];
  count: number;
  average: number | null;
};

/** Liste des avis laissés depuis le site. RLS : réservé au rôle administrateur. */
export const listReviewSubmissions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("review_submissions")
      .select("id, author_name, city, service_type, rating, message, email, status, created_at")
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) throw new Error(error.message);
    return (data ?? []) as ReviewSubmission[];
  });

/** Change le statut d'un avis. RLS : seule la règle administrateur autorise la mise à jour. */
export const setReviewStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; status: ReviewStatus }) =>
    z.object({ id: z.string().uuid(), status: z.enum(REVIEW_STATUSES) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: updated, error } = await context.supabase
      .from("review_submissions")
      .update({ status: data.status })
      .eq("id", data.id)
      .select("id, status");
    if (error) throw new Error(error.message);
    // RLS filtre silencieusement : aucune ligne = pas les droits ou avis introuvable.
    if (!updated || updated.length === 0)
      throw new Error("Action non autorisée ou avis introuvable");
    return { ok: true, id: data.id, status: data.status };
  });

/** Avis publiés uniquement (lecture publique, sans e-mail) + moyenne calculée sur ces seuls avis. */
export const getPublishedReviews = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublishedReviewsSummary> => {
    const url = process.env["SUPABASE_URL"];
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
    if (!url || !key) return { reviews: [], count: 0, average: null };

    const { createClient } = await import("@supabase/supabase-js");
    const client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`)
            h.delete("Authorization");
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });

    const { data, error } = await (
      client.rpc as unknown as (fn: string) => Promise<{
        data: PublishedReview[] | null;
        error: { message: string } | null;
      }>
    )("get_published_reviews");

    if (error) {
      console.error("Lecture des avis publiés impossible", error.message);
      return { reviews: [], count: 0, average: null };
    }
    const reviews = (data ?? []).map((r) => ({ ...r, rating: Number(r.rating) }));
    const count = reviews.length;
    const average = count
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10
      : null;
    return { reviews, count, average };
  },
);
