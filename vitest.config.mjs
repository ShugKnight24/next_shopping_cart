import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vitest/config';
const rootDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.js'],
    include: ['__tests__/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    env: {
      NEXT_PUBLIC_GOOGLE_ANALYTICS_ID: 'UA-147974881-10',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(rootDir, './'),
    },
  },
});
