import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tanstackStart(), nitro(), viteReact(), tailwindcss(), tsconfigPaths()],
  define: {
    // Supabase's project variables are currently not injected into Vercel's
    // production client build. Keep the browser client pointed at the public
    // production project; only the publishable key belongs here, never a
    // service-role or secret key.
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(
      process.env["VITE_SUPABASE_URL"] ||
        process.env["SUPABASE_URL"] ||
        process.env["NEXT_PUBLIC_SUPABASE_URL"] ||
        "https://dgppmlkpvmvjkhsghtji.supabase.co",
    ),
    "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(
      process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ||
        process.env["SUPABASE_PUBLISHABLE_KEY"] ||
        process.env["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"] ||
        "sb_publishable_Uqxxo1jp4wENhs7XKC53Wg_2RGn3dRw",
    ),
  },
});
