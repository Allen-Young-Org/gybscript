import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import autoprefixer from "autoprefixer";
import tailwindcss from "tailwindcss";
import tsconfigPaths from "vite-tsconfig-paths"; // 🔥 Import this plugin

export default defineConfig({
  plugins: [react(), tsconfigPaths()], // 🔥 Add tsconfigPaths()
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: true,
  },
  server: {
    port: 3000,
    open: true,
  },
  css: {
    postcss: {
      plugins: [tailwindcss(), autoprefixer],
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      target: "es2020",
    },
  },
  esbuild: {
    logOverride: { "this-is-undefined-in-esm": "silent" },
  },
});
