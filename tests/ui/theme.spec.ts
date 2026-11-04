import { expect, test } from '@playwright/test';
import { installNativeMock, mockState } from './native-mock';

// T-22: the theme token chains resolve, in the browser engines, to the colours Mint used in v1.0.0.
test('Mint renders with the released v1.0.0 colours', async ({ page }) => {
  await installNativeMock(page, { entries: [{ title: 'Theme check' }], openEntry: 1 });
  await page.goto('/');
  await expect(page.locator('#storage-status')).toHaveText('Saved');
  const style = (selector: string, property: string) =>
    page.locator(selector).first().evaluate((el, p) => getComputedStyle(el).getPropertyValue(p), property);

  expect(await style('body', 'background-color')).toBe('rgb(5, 7, 6)');
  expect(await style('.rail', 'background-color')).toBe('rgb(11, 15, 13)');
  expect(await style('.rail', 'border-top-color')).toBe('rgb(40, 66, 57)');
  expect(await style('.rail', 'box-shadow')).toContain('rgba(82, 240, 190, 0.07)');
  expect(await style('.writing-column', 'background-color')).toBe('rgb(13, 18, 16)');
  expect(await style('.journal-body', 'caret-color')).toBe('rgb(82, 240, 190)');
  expect(await style('.tool-field select', 'background-image')).toContain('%2352F0BE');

  await page.keyboard.press('ControlOrMeta+o');
  await expect(page.getByRole('dialog', { name: 'Archives' })).toBeVisible();
  expect(await style('.popover-scrim', 'background-color')).toBe('rgba(3, 5, 4, 0.62)');
  expect(await style('.archive-popover h2', 'color')).toBe('rgb(82, 240, 190)');
});

test('the Themes panel sits between Archives and New entry and applies a theme without touching the entry', async ({ page }) => {
  await installNativeMock(page, { entries: [{ title: 'Theme switch', body: 'Draft that must survive' }], openEntry: 1 });
  await page.goto('/');
  await expect(page.locator('#storage-status')).toHaveText('Saved');
  const rail = page.getByRole('navigation', { name: 'Journal navigation' }).locator('.rail-actions button');
  expect(await rail.evaluateAll(buttons => buttons.map(b => b.getAttribute('aria-label')))).toEqual(['Search titles', 'Archives', 'Themes', 'New entry']);
  expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe('mint');

  const editor = page.getByRole('textbox', { name: 'Journal body' });
  await editor.click();
  await page.keyboard.type(' typed');
  await expect(page.locator('#storage-status')).toHaveText('Saved');
  const writes = (await mockState(page)).writes;

  await page.getByRole('button', { name: 'Themes' }).click();
  const panel = page.getByRole('dialog', { name: 'Themes' });
  const search = panel.getByRole('combobox', { name: 'Search themes' });
  await expect(search).toBeFocused();
  await expect(panel.getByRole('option')).toHaveCount(4);
  await expect(panel.getByRole('option', { selected: true })).toContainText('Terminal Mint');
  await search.fill('crt');
  await expect(panel.getByRole('option')).toHaveText([/Blue Monitor/]);
  await page.keyboard.press('Enter');
  expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe('blue');
  expect(await page.locator('.rail').evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgb(11, 13, 15)');
  await search.fill('zzz');
  await expect(panel.getByRole('status')).toHaveText('No themes match “zzz”.');
  await search.fill('');
  await panel.getByRole('option', { name: /Ember Orange/ }).click();
  expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe('ember');
  await expect(panel).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(panel).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Themes' })).toBeFocused();

  await expect(editor).toContainText('Draft that must survive typed');
  await expect(page.locator('#storage-status')).toHaveText('Saved');
  expect((await mockState(page)).writes).toBe(writes);

  // Restored on relaunch before the interface renders.
  await page.reload();
  expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe('ember');
  await expect(page.locator('#storage-status')).toHaveText('Saved');
});

test('a missing or unknown stored theme falls back to Mint', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('terminal.theme', 'neon'));
  await installNativeMock(page, { entries: [{ title: 'Fallback' }], openEntry: 1 });
  await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe('mint');
  expect(await page.locator('body').evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgb(5, 7, 6)');
});
