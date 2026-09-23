import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  staticData: { sitemap: "exclude-subtree" },
  beforeLoad: async () => {
    try {
      // Lire la session locale évite un appel réseau inutile au chargement de /admin.
      // Les Server Functions restent l'autorité pour l'accès réel aux données privées.
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session?.user) throw redirect({ to: "/connexion" });
      return { user: data.session.user };
    } catch (error) {
      if (error && typeof error === "object" && "to" in error) throw error;
      throw redirect({ to: "/connexion" });
    }
  },
  component: () => <Outlet />,
});
