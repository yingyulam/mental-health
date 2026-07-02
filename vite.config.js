import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Static SPA. `base: "./"` keeps asset paths relative so the build can be
// dropped onto GitHub Pages or any subpath host without extra config.
export default defineConfig({
  base: "./",
  plugins: [react()],
});
