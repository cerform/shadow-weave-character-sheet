import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(() => ({
  server: {
    host: true, // 0.0.0.0
    port: 8080,
    strictPort: false, // не упираться в 8080
    // ❌ убрать кастомный hmr и allowedHosts
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // ❌ убрать эти алиасы — частая причина #185:
      // "react": path.resolve(__dirname, "./node_modules/react"),
      // "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
      // "three": path.resolve(__dirname, "./node_modules/three"),
    },
  },
  test: { globals: true, environment: "jsdom" },
}));
