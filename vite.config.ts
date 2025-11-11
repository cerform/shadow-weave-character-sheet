import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(() => ({
  server: {
    host: true, // слушать 0.0.0.0 — корректно в облаке
    port: 8080, // ок оставить, но не настаиваем
    strictPort: false, // позволить занять соседний порт, если 8080 занят
    // ⚠️ НИЧЕГО не задаём для allowedHosts / hmr — пусть Vite/Lovable решают
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // ⚠️ Удалены спорные алиасы:
      // "react": path.resolve(__dirname, "./node_modules/react"),
      // "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
      // "three": path.resolve(__dirname, "./node_modules/three"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
  },
}));
