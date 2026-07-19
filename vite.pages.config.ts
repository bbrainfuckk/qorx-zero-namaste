import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/qorx-zero-namaste/",
  root: "static-site",
  publicDir: "../public",
  plugins: [react()],
  build: { outDir: "../gh-pages", emptyOutDir: true },
});
