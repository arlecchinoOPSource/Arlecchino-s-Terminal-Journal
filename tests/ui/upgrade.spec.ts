import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { installNativeMock, mockState } from './native-mock';

// T-33: a person upgrading from 1.0 has entries and writing preferences but none of the 2.0 settings.
const formatted = JSON.parse(readFileSync(new URL('../fixtures/formatted-entry.json', import.meta.url), 'utf8'));
const v1 = { entries: [{ title: 'Kept from 1.0', content: formatted }, { title: 'Second 1.0 entry' }], openEntry: 1, startup: true,
  preferences: { font: 'literata', font_size: 19, writing_width: 640, line_spacing: 180 } };

test('first 2.0 launch keeps 1.0 writing and settings, and new features start quiet and safe', async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { __audioContexts: number }).__audioContexts = 0;
    const Real = window.AudioContext;
    window.AudioContext = class extends Real { constructor(...a: ConstructorParameters<typeof AudioContext>) { super(...a); (window as unknown as { __audioContexts: number }).__audioContexts++; } };
  });
  await installNativeMock(page, v1);
  await page.goto('/');
  // The new startup screen is shown (default on) and gives way to the 1.0 entry.
  await expect(page.locator('.startup')).toBeVisible();
  await expect(page.locator('.startup')).toHaveCount(0, { timeout: 5000 });
  const editor = page.getByRole('textbox', { name: 'Journal body' });
  await expect(page.getByRole('textbox', { name: 'Entry title' })).toHaveValue('Kept from 1.0');
  await expect(editor.locator('table')).toHaveCount(1);
  await expect(editor.locator('h1')).toHaveCount(1);
  // 1.0 writing preferences still apply.
  const css = await page.evaluate(() => ['--entry-font', '--entry-size', '--writing-width', '--entry-line-height'].map(p => document.documentElement.style.getPropertyValue(p).replaceAll('"', "'")));
  expect(css).toEqual(["'Literata', serif", '19px', '640px', '1.8']);
  // New settings: Mint, full motion, sound off with no audio started.
  expect(await page.evaluate(() => [document.documentElement.dataset.theme, document.documentElement.dataset.motion])).toEqual(['mint', 'full']);
  expect(await page.evaluate(() => (window as unknown as { __audioContexts: number }).__audioContexts)).toBe(0);
  // Opening the journal made no write, and none of the new settings touched native preferences.
  const state = await mockState(page);
  expect(state.writes).toBe(0);
  expect(state.preferences).toEqual(v1.preferences);
  expect(state.calls.filter(c => c === 'preferences_set')).toEqual([]);
});

test('a full session across every theme, motion level and sound keeps the entry intact', async ({ page }) => {
  await installNativeMock(page, { ...v1, startup: false });
  await page.goto('/');
  await expect(page.locator('#storage-status')).toHaveText('Saved');
  const editor = page.getByRole('textbox', { name: 'Journal body' });
  const before = await editor.innerHTML();
  for (const theme of ['Blue Monitor', 'Ember Orange', 'Amber Display', 'Terminal Mint']) {
    await page.getByRole('button', { name: 'Themes', exact: true }).click();
    await page.getByRole('dialog', { name: 'Themes' }).getByRole('option', { name: new RegExp(theme) }).click();
    await page.keyboard.press('Escape');
  }
  await page.getByRole('button', { name: 'Sounds', exact: true }).click();
  await page.getByRole('dialog', { name: 'Sounds' }).getByRole('switch', { name: 'Sound' }).check();
  await page.keyboard.press('Escape');
  await page.keyboard.press('ControlOrMeta+,');
  await page.getByRole('dialog', { name: 'Settings' }).getByRole('group', { name: /Motion/ }).getByRole('radio', { name: 'Off' }).check();
  await page.keyboard.press('Escape');
  expect(await editor.innerHTML()).toBe(before);
  expect((await mockState(page)).writes).toBe(0);
  // Writing, saving and relaunching still work with every effect on.
  await editor.click();
  await page.keyboard.press('ControlOrMeta+End');
  await page.keyboard.type(' 2.0');
  await expect(page.locator('#storage-status')).toHaveText('Saved');
  await page.reload();
  await expect(page.getByRole('textbox', { name: 'Journal body' })).toContainText('2.0');
  expect(await page.evaluate(() => [document.documentElement.dataset.theme, document.documentElement.dataset.motion, JSON.parse(localStorage.getItem('terminal.sound') ?? '{}').enabled])).toEqual(['mint', 'off', true]);
});
