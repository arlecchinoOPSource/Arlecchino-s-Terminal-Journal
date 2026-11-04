import { expect, test, type Page } from '@playwright/test';
import { installNativeMock, type MockOptions } from './native-mock';

// T-31/T-32: the startup screen follows real readiness, recovers from failures and respects settings.
const startup = (page: Page) => page.locator('.startup');
async function launch(page: Page, options: MockOptions = {}, local: Record<string, string> = {}) {
  await page.addInitScript(values => { for (const [k, v] of Object.entries(values)) localStorage.setItem(k, v); }, local);
  await installNativeMock(page, { entries: [{ title: 'Startup entry', body: 'Synthetic' }], openEntry: 1, startup: true, ...options });
  const t = Date.now();
  await page.goto('/');
  return t;
}

test('the branded screen shows while the journal opens, then leaves for the editor', async ({ page }) => {
  const t = await launch(page);
  await expect(startup(page)).toBeVisible();
  await expect(startup(page).locator('.startup-wordmark')).toHaveText('TERMINAL');
  await expect(startup(page)).toHaveAttribute('aria-label', /starting/);
  // The journal opens underneath; the screen shows READY and then goes.
  await expect(page.locator('#storage-status')).toHaveText('Saved');
  await expect(startup(page)).toHaveCount(0, { timeout: 4000 });
  const shown = Date.now() - t;
  expect(shown).toBeGreaterThanOrEqual(1400);
  expect(shown).toBeLessThan(4000);
  await expect(page.getByRole('textbox', { name: 'Journal body' })).toContainText('Synthetic');
  // Nothing keeps animating once it is gone.
  await page.waitForTimeout(1300);
  expect(await page.evaluate(() => document.getAnimations().filter(a => a.playState === 'running').length)).toBe(0);
});

test('a slow journal shows an honest message and the screen waits for it', async ({ page }) => {
  await launch(page, { openJournal: 5000 });
  await expect(startup(page).locator('.startup-message')).toHaveText('OPENING JOURNAL');
  await expect(startup(page).locator('.startup-message')).toHaveText('STILL OPENING THE JOURNAL', { timeout: 6000 });
  await expect(startup(page)).toHaveCount(0, { timeout: 4000 });
  await expect(page.locator('#storage-status')).toHaveText('Saved');
});

test('a journal that cannot open shows its error at once, not a splash', async ({ page }) => {
  const t = await launch(page, { openJournal: 'fail' });
  await expect(page.getByRole('alert')).toContainText('could not be opened');
  await expect(startup(page)).toHaveCount(0);
  expect(Date.now() - t).toBeLessThan(1400);
  await expect(page.getByRole('button', { name: /Retry opening storage/ })).toBeVisible();
});

test('the screen never stays longer than the timeout', async ({ page }) => {
  test.setTimeout(30_000);
  await launch(page, { openJournal: 20_000 });
  await expect(startup(page)).toBeVisible();
  await expect(startup(page)).toHaveCount(0, { timeout: 12_000 });
  await expect(page.locator('#storage-status')).toHaveText('Loading…');
});

test('any key skips the sequence and still reaches the editor', async ({ page }) => {
  const t = await launch(page);
  await expect(page.locator('#storage-status')).toHaveText('Saved');
  await page.keyboard.press('Shift');
  await expect(startup(page)).toHaveCount(0);
  expect(Date.now() - t).toBeLessThan(1400);
});

test('reduced motion shows a static screen only until the journal is ready', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const t = await launch(page, { openJournal: 600 });
  await expect(startup(page)).toBeVisible();
  expect(await page.evaluate(() => document.getAnimations().filter(a => (a.effect as KeyframeEffect).target instanceof Element && ((a.effect as KeyframeEffect).target as Element).closest('.startup')).length)).toBe(0);
  await expect(startup(page)).toHaveCount(0, { timeout: 3000 });
  expect(Date.now() - t).toBeLessThan(1400 + 600);
  // The in-app Off level is treated the same way.
  await launch(page, { openJournal: 600 }, { 'terminal.motion': 'off' });
  await expect(startup(page)).toHaveAttribute('data-animated', 'false');
});

test('switching the startup screen off opens straight to the editor', async ({ page }) => {
  await launch(page, {}, { 'terminal.startup': 'off' });
  await expect(page.locator('#storage-status')).toHaveText('Saved');
  await expect(startup(page)).toHaveCount(0);
  await page.keyboard.press('ControlOrMeta+,');
  const settings = page.getByRole('dialog', { name: 'Settings' });
  const off = settings.getByRole('group', { name: /Startup screen/ }).getByRole('radio', { name: 'Off' });
  await expect(off).toBeChecked();
  await settings.getByRole('group', { name: /Startup screen/ }).getByRole('radio', { name: 'On' }).check();
  expect(await page.evaluate(() => localStorage.getItem('terminal.startup'))).toBe('on');
});

test('the screen uses the chosen theme from its first frame', async ({ page }) => {
  await launch(page, { openJournal: 800 }, { 'terminal.theme': 'amber' });
  await expect(startup(page)).toBeVisible();
  expect(await startup(page).locator('.startup-frame').evaluate(el => getComputedStyle(el).borderTopColor)).toBe('rgb(66, 59, 40)');
  expect(await startup(page).locator('.startup-meter > span').first().evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgb(255, 201, 60)');
});

test('the startup sound plays at most once and never later on a click', async ({ page }) => {
  await page.addInitScript(() => {
    const starts: number[] = [];
    (window as unknown as { __starts: number[] }).__starts = starts;
    const start = AudioBufferSourceNode.prototype.start;
    AudioBufferSourceNode.prototype.start = function (this: AudioBufferSourceNode, ...args: Parameters<typeof start>) {
      if (this.buffer && this.buffer.duration > 5) starts.push(this.buffer.duration);
      return start.apply(this, args);
    };
  });
  await launch(page, {}, { 'terminal.sound': JSON.stringify({ enabled: true, close: false }) });
  await expect(page.locator('#storage-status')).toHaveText('Saved');
  await page.waitForTimeout(500);
  const atLaunch = await page.evaluate(() => (window as unknown as { __starts: number[] }).__starts.length);
  expect(atLaunch).toBeLessThanOrEqual(1);
  await page.getByRole('button', { name: 'Archives' }).click();
  await page.keyboard.press('Escape');
  await page.getByRole('textbox', { name: 'Journal body' }).click();
  await page.keyboard.type('later');
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => (window as unknown as { __starts: number[] }).__starts.length)).toBe(atLaunch);
});
