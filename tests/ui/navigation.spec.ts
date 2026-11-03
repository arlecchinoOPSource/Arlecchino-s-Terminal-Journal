import { expect, test } from '@playwright/test';
import { installNativeMock, mockState } from './native-mock';

const entries = [
  { title: 'Morning pages', updated_at: Date.UTC(2026, 10, 1) },
  { title: 'Trip to LISBON', updated_at: Date.UTC(2026, 10, 3) },
  { title: 'Lisbon, day two', updated_at: Date.UTC(2026, 10, 2) },
  { title: 'Café notes', updated_at: Date.UTC(2026, 9, 30) },
];
const title = (page: import('@playwright/test').Page) => page.getByRole('textbox', { name: 'Entry title' });

test('archives list every entry newest first, mark the open one, and open by keyboard', async ({ page }) => {
  await installNativeMock(page, { entries, openEntry: 1 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Archives' }).click();
  const rows = page.locator('#archive-panel .archive-title');
  await expect(rows).toHaveText(['Trip to LISBON', 'Lisbon, day two', 'Morning pages', 'Café notes']);
  await expect(page.locator('#archive-panel [aria-current="true"]')).toContainText('Morning pages');
  await expect(page.locator('#archive-panel [aria-current="true"]')).toBeFocused();
  await page.keyboard.press('Home');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(page.locator('#archive-panel')).toHaveCount(0);
  await expect(title(page)).toHaveValue('Lisbon, day two');
});

test('search filters titles case-insensitively while typing and opens the highlighted result', async ({ page }) => {
  await installNativeMock(page, { entries, openEntry: 1 });
  await page.goto('/');
  await page.keyboard.press('ControlOrMeta+k');
  const input = page.getByRole('combobox', { name: 'Search entry titles' });
  await expect(input).toBeFocused();
  await input.fill('lis');
  await expect(page.getByRole('listbox', { name: 'Matching entries' }).getByRole('option')).toHaveText([/Trip to LISBON/, /Lisbon, day two/]);
  await input.fill('CAFÉ');
  await expect(page.getByRole('listbox', { name: 'Matching entries' }).getByRole('option')).toHaveText([/Café notes/]);
  await input.fill('zzz');
  await expect(page.locator('.search-message')).toContainText('No titles match');
  await input.fill('lisbon');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(title(page)).toHaveValue('Lisbon, day two');
});

test('closing search with Escape changes nothing and returns focus', async ({ page }) => {
  await installNativeMock(page, { entries, openEntry: 1 });
  await page.goto('/');
  await title(page).focus();
  await page.keyboard.press('ControlOrMeta+k');
  await page.getByRole('combobox', { name: 'Search entry titles' }).fill('lisbon');
  await page.keyboard.press('Escape');
  await expect(page.locator('#search-panel')).toHaveCount(0);
  await expect(title(page)).toBeFocused();
  await expect(title(page)).toHaveValue('Morning pages');
  expect((await mockState(page)).writes).toBe(0);
});

test('shortcuts open panels, start a new entry, and are inactive under a dialog', async ({ page }) => {
  await installNativeMock(page, { entries, openEntry: 1 });
  await page.goto('/');
  await page.keyboard.press('ControlOrMeta+,');
  await expect(page.getByRole('dialog', { name: 'Settings' })).toBeVisible();
  await page.keyboard.press('ControlOrMeta+o');
  await expect(page.getByRole('dialog', { name: 'Archives' })).toBeVisible();
  await expect(page.getByRole('dialog', { name: 'Settings' })).toHaveCount(0);
  await page.keyboard.press('Escape');
  await page.keyboard.press('ControlOrMeta+n');
  await expect(page.locator('.draft-label')).toHaveText('DRAFT');
  await expect(page.getByRole('textbox', { name: 'Journal body' })).toBeFocused();

  await page.getByRole('button', { name: 'Archives' }).click();
  await page.locator('#archive-panel .archive-row').first().click();
  await page.getByRole('button', { name: 'Delete entry' }).click();
  await page.keyboard.press('ControlOrMeta+k');
  await expect(page.locator('#search-panel')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: /Delete/ })).toBeHidden();
});

test('every visible button and field has an accessible name', async ({ page }) => {
  await installNativeMock(page, { entries, openEntry: 1 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Settings' }).click();
  const unnamed = await page.evaluate(() => [...document.querySelectorAll('button, select, input, [role="textbox"], [role="combobox"]')]
    .filter(el => (el as HTMLElement).offsetParent !== null)
    .filter(el => !(el.getAttribute('aria-label') || el.textContent?.trim() || el.closest('label')?.textContent?.trim()))
    .map(el => el.outerHTML.slice(0, 80)));
  expect(unnamed).toEqual([]);
});
