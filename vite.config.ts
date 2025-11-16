import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
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
