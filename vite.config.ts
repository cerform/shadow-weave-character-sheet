import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::", // слушает на всех интерфейсах
    port: 8080,
    strictPort: true, // предотвращает смену порта
    allowedHosts: ["60ca1f07-9f8f-4253-82ad-54f81c6c2667.lovableproject.com", "localhost"],
    hmr: {
      overlay: false, // ❗ выключает ошибочный overlay, вызывающий React error #185
      host: "localhost", // гарантирует корректную перезагрузку в Lovable Preview
      protocol: "ws",
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      react: path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
      three: path.resolve(__dirname, "./node_modules/three"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
  },
}));
