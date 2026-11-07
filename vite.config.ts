import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

// Plain TanStack Start + Vite setup (no hosted-platform wrapper).
// Dev server: http://localhost:8080 — the backend's CORS allow-list (APP_CORS_ORIGINS) expects this port.
// Production build: Nitro "netlify" preset → static assets in dist/, SSR function in .netlify/functions-internal/.
export default defineConfig(({ command }) => ({
  server: { host: "::", port: 8080 },
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-dom/client", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
  plugins: [
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({
      // src/server.ts wraps TanStack Start's server entry with our SSR error page.
      server: { entry: "server" },
      // Server-only code must never be bundled into the browser.
      importProtection: { behavior: "error", client: { files: ["**/server/**"], specifiers: ["server-only"] } },
    }),
    ...(command === "build" ? [nitro({ preset: "netlify" })] : []),
    viteReact(),
  ],
}));
