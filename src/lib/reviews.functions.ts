import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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
