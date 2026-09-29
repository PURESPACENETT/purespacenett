import path from "path";
import { loadEnv, type Plugin } from "vite";
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";
import tsconfigPaths from "vite-tsconfig-paths";

function serverEnvPlugin(): Plugin {
  return {
    name: "server-env",
    config(_, { mode }) {
      const serverEnv = loadEnv(mode, process.cwd(), "");
      Object.assign(process.env, serverEnv);

      const isUrl = (v?: string) => !!v && /^https?:\/\//.test(v);
      const url =
        [process.env["VITE_SUPABASE_URL"], process.env["SUPABASE_URL"]].find(isUrl) ??
        "https://dgppmlkpvmvjkhsghtji.supabase.co";
      const key =
        [process.env["VITE_SUPABASE_PUBLISHABLE_KEY"], process.env["SUPABASE_PUBLISHABLE_KEY"]]
          .find((v) => !!v && v !== "undefined") ??
        "sb_publishable_Uqxxo1jp4wENhs7XKC53Wg_2RGn3dRw";

      process.env["VITE_SUPABASE_URL"] = url;
      process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] = key;
      if (!isUrl(process.env["SUPABASE_URL"])) process.env["SUPABASE_URL"] = url;
      const sk = process.env["SUPABASE_PUBLISHABLE_KEY"];
      if (!sk || sk === "undefined") process.env["SUPABASE_PUBLISHABLE_KEY"] = key;
    },
  };
}

export default defineConfig({
  plugins: [
    serverEnvPlugin(),
    tanstackStart({ server: { entry: "server" } }),
    nitro(),
    viteReact(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  resolve: {
    alias: {
      "entities/lib/decode.js": path.resolve(__dirname, "node_modules/entities/lib/decode.js"),
      "entities/lib/encode.js": path.resolve(__dirname, "node_modules/entities/lib/encode.js"),
      entities: path.resolve(__dirname, "node_modules/entities"),
    },
  },
});
