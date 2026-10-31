import { createMiddleware } from "@tanstack/react-start";

import { requireSupabaseAuth } from "./auth-middleware";

/** Requires the proprietor's active admin role. */
export const requireSupabaseStaff = createMiddleware({ type: "function" })
  .middleware([requireSupabaseAuth])
  .server(async ({ context, next }) => {
    const { data, error } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .maybeSingle();

    if (error) {
      console.error("CRM staff authorization lookup failed", error.message);
      throw new Error("Accès non autorisé");
    }

    if (data?.role !== "admin") {
      throw new Error("Accès non autorisé");
    }

    return next();
  });
