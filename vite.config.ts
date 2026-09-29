// @lovable.dev/vite-tanstack-config remains temporarily as the TanStack Start build provider.
// The application is being decoupled from the historical Lovable runtime; no Lovable service
// is used as the development or deployment source of truth.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    // Public browser credentials. The fallback is aligned with the canonical PURE SPACE NETT
    // Supabase production project so the client cannot silently target an obsolete project.
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(
        "https://dgppmlkpvmvjkhsghtji.supabase.co",
      ),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(
        "sb_publishable_Uqxxo1jp4wENhs7XKC53Wg_2RGn3dRw",
      ),
    },
  },
  tanstackStart: {
    // Use the SSR error wrapper as the TanStack Start server entry.
    server: { entry: "server" },
  },
});
