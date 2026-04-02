import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    baseURL: 'https://localhost:5959',
    ignoreHTTPSErrors: true,
    viewport: { width: 1280, height: 700 },
    headless: false, // opens browser
  },
  reporter: 'html',
  timeout: 60000,
});