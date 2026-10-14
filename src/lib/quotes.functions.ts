import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type QuoteRequest = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  property_type: string | null;
  surface: string | null;
  service_type: string | null;
  frequency: string | null;
  message: string | null;
  status: string;
  created_at: string;
};

/** Liste des demandes. RLS vérifie l’adresse propriétaire sur le JWT authentifié. */
export const listQuoteRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("quote_requests")
      .select(
        "id, full_name, email, phone, address, city, postal_code, property_type, surface, service_type, frequency, message, status, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) throw new Error(error.message);
    return (data ?? []) as QuoteRequest[];
  });

export const setQuoteStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; status: "nouveau" | "à relancer" | "traité" }) =>
    z.object({ id: z.string().uuid(), status: z.enum(["nouveau", "à relancer", "traité"]) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: updated, error } = await context.supabase
      .from("quote_requests")
      .update({ status: data.status })
      .eq("id", data.id)
      .select("id");
    if (error) throw new Error(error.message);
    if (!updated || updated.length === 0) throw new Error("Action non autorisée ou demande introuvable");
    return { ok: true };
  });
