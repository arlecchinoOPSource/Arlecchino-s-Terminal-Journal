import { expect, test } from '@playwright/test';
import { installNativeMock } from './native-mock';

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
