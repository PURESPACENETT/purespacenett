import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type QuoteRequest = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string | null;
  property_type: string | null;
  surface: string | null;
  service_type: string | null;
  frequency: string | null;
  message: string | null;
  status: string;
  created_at: string;
};

/** Adresse du propriétaire : ce compte reçoit automatiquement le rôle administrateur. */
const OWNER_EMAIL = "contact@purespacenett.com";

/** Liste des demandes de devis. RLS : réservé au rôle administrateur. */
export const listQuoteRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const claims = context.claims as { email?: string } | undefined;
    if (claims?.email?.toLowerCase() === OWNER_EMAIL) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: context.userId, role: "admin" }, { onConflict: "user_id,role" });
    }

    const { data, error } = await context.supabase
      .from("quote_requests")
      .select(
        "id, full_name, email, phone, address, property_type, surface, service_type, frequency, message, status, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) throw new Error(error.message);
    return (data ?? []) as QuoteRequest[];
  });

export const setQuoteStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; status: "nouveau" | "traité" }) =>
    z.object({ id: z.string().uuid(), status: z.enum(["nouveau", "traité"]) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("quote_requests")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
