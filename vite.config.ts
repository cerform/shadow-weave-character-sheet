import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  server: {
    host: true,
    port: 4173,
    strictPort: false,
    allowedHosts: mode === "development" ? undefined : ["60ca1f07-9f8f-4253-82ad-54f81c6c2667.lovableproject.com"],
  },

  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // ❌ НЕТ react, react-dom, three
    },
  },

  test: {
    globals: true,
    environment: "jsdom",
  },
}));
