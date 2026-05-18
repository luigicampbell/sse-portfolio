import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const webPort = Number(Deno.env.get("WEB_PORT"));
const apiPort = Number(Deno.env.get("API_PORT"));

export default defineConfig({
  root: new URL(".", import.meta.url).pathname,

  plugins: [react()],

  server: {
    host: "0.0.0.0",
    port: webPort,
    strictPort: true,
    proxy: {
      "/api": {
        target: `http://localhost:${apiPort}`,
        changeOrigin: true,
      },
    },
  },

  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
