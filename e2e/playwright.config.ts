import path from 'node:path';
import { defineConfig } from '@playwright/test';

const WEB_DIR = process.env.SHIFTBASE_WEB_DIR ?? path.resolve(__dirname, '../../shiftbase-web');

export default defineConfig({
  testDir: './tests',
  use: { baseURL: 'http://localhost:5198', screenshot: 'only-on-failure' },
  webServer: {
    command: 'npm run dev -- --port 5198 --strictPort',
    cwd: WEB_DIR,
    url: 'http://localhost:5198',
    reuseExistingServer: true,
    env: { VITE_API_URL: process.env.VITE_API_URL ?? 'http://localhost:18092' },
  },
  reporter: [['json', { outputFile: '../reports/playwright.json' }]],
});
