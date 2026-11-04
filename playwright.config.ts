import { defineConfig, devices } from '@playwright/test';

// UI tests drive the real React/Tiptap interface in Chromium against the Vite
// dev server, with the native Tauri commands replaced by an in-memory stand-in
// (tests/ui/native-mock.ts). They do not prove native SQLite or installation;
// those are covered by `cargo test` and manual desktop checks.
const port = 4319;
export default defineConfig({
  testDir: 'tests/ui',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL: `http://localhost:${port}`, trace: 'retain-on-failure', viewport: { width: 1100, height: 780 } },
  // WebKit is the engine of the macOS app; Chromium is close to Windows' WebView2.
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1100, height: 780 } } },
    { name: 'webkit', use: { ...devices['Desktop Safari'], viewport: { width: 1100, height: 780 } } },
  ],
  webServer: { command: `npx vite --port ${port} --strictPort`, url: `http://localhost:${port}`, reuseExistingServer: false, timeout: 60_000 },
});
