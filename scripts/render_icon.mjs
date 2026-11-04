// Renders an SVG to a 1024 px PNG with Playwright's Chromium (transparent unless a background colour is given).
// usage: node scripts/render_icon.mjs assets/terminal-icon.svg assets/terminal-icon.png [background]
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
const [svgPath, out, bg] = process.argv.slice(2);
const svg = readFileSync(svgPath, 'utf8');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1024, height: 1024 } });
await page.setContent(`<html><body style="margin:0;background:${bg ?? 'transparent'}">${svg.replace('<svg ', '<svg width="1024" height="1024" ')}</body></html>`);
await page.screenshot({ path: out, omitBackground: !bg, clip: { x: 0, y: 0, width: 1024, height: 1024 } });
await browser.close();
