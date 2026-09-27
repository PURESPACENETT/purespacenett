import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tanstackStart({
      server: {
        entry: "server",
      },
    }),
    nitro(),
    viteReact(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  define: {
    // These are public browser credentials, not secrets.
    // They are intentionally available to the client bundle.
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(
      "https://tunjuiuibsbbsepdkorx.supabase.co",
    ),
    "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(
      "sb_publishable_3YGmLGsmcp2tbDHVH9T2Aw_d--3ghe5",
    ),
  },
});
