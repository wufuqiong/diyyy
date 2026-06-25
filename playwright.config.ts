import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: 'http://localhost:3039',
    viewport: { width: 1280, height: 900 },
    actionTimeout: 10000,
  },
  webServer: {
    command: 'npx vite --port 3039',
    port: 3039,
    reuseExistingServer: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
});
