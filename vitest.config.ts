import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    // Vitest does not read .env on its own; CI sets the variables directly.
    env: loadEnv('test', process.cwd(), ''),
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/lib/**'],
    },
  },
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
});
