import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { sentryVitePlugin } from "@sentry/vite-plugin";

export default defineConfig(({ mode }) => ({
  server: {
    host: true,
    port: 4173,
    strictPort: false,
    allowedHosts: mode === "development" ? undefined : ["60ca1f07-9f8f-4253-82ad-54f81c6c2667.lovableproject.com"],
  },

  plugins: [
    react(),
    
    // Sentry plugin для source maps (только для production)
    mode === "production" && sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      
      // Source maps будут загружаться автоматически
      sourcemaps: {
        assets: "./dist/**",
        ignore: ["node_modules"],
      },
      
      // Release tracking
      release: {
        name: process.env.VITE_APP_VERSION || "development",
        deploy: {
          env: mode,
        },
      },
      
      // Настройки загрузки
      silent: false,
      errorHandler: (err) => {
        console.warn("Sentry source maps upload failed:", err);
      },
    }),
  ].filter(Boolean),

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

  build: {
    sourcemap: mode === "production", // Генерируем source maps только для production
    rollupOptions: {
      output: {
        sourcemapExcludeSources: false, // Включаем исходники в source maps
      },
    },
  },
}));
