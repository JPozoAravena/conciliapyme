import { defineConfig, devices } from '@playwright/test';

// Local runs read DATABASE_URL / MONGODB_URI / AUTH_SECRET from .env; CI sets them directly.
try {
  process.loadEnvFile('.env');
} catch {
  // no .env (CI)
}

const enCi = Boolean(process.env.CI);
// Locally, reuse the usual `next dev` on 3000 (Next allows one dev server per folder).
const PUERTO = enCi ? 3100 : 3000;

export default defineConfig({
  testDir: 'e2e',
  testMatch: '**/*.e2e.ts',
  timeout: 60_000,
  retries: enCi ? 1 : 0,
  reporter: enCi ? 'github' : 'list',
  use: { baseURL: `http://localhost:${PUERTO}`, trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: enCi
      ? `npm run build && npx next start -p ${PUERTO}`
      : `npx next dev -p ${PUERTO}`,
    url: `http://localhost:${PUERTO}/login`,
    reuseExistingServer: !enCi,
    timeout: 180_000,
    env: { AUTH_TRUST_HOST: 'true' },
  },
});
