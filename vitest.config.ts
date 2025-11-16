/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/__tests__/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov', 'json-summary'],
      include: [
        'src/stores/**/*.ts',
        'src/components/battle/enhanced/**/*.tsx',
        'src/utils/**/*.ts',
      ],
      exclude: [
        '**/__tests__/**',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/types.ts',
        '**/index.ts',
      ],
      // Строгие пороги покрытия для критичных файлов
      thresholds: {
        // Глобальные пороги (мягкие требования)
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
        // Строгие пороги для критичных файлов
        'src/stores/**/*.ts': {
          lines: 90,
          functions: 90,
          branches: 85,
          statements: 90,
        },
        'src/components/battle/enhanced/**/*.tsx': {
          lines: 90,
          functions: 90,
          branches: 85,
          statements: 90,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
