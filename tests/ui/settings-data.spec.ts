import { expect, test } from '@playwright/test';
import { installNativeMock, mockState } from './native-mock';

const cssVar = (page: import('@playwright/test').Page, name: string) => page.evaluate(n => document.documentElement.style.getPropertyValue(n), name);

test('settings apply immediately, are saved, and are restored on relaunch', async ({ page }) => {
  await installNativeMock(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Settings' }).click();
  const settings = page.getByRole('dialog', { name: 'Settings' });
  await settings.locator('select').nth(0).selectOption('literata');
  await settings.locator('select').nth(1).selectOption('20');
  await settings.getByRole('radio', { name: 'Narrow' }).check();
  await settings.getByRole('radio', { name: 'Relaxed' }).check();
  await expect.poll(() => cssVar(page, '--entry-size')).toBe('20px');
  expect(await cssVar(page, '--entry-font')).toContain('Literata');
  expect(await cssVar(page, '--writing-width')).toBe('560px');
  expect(await cssVar(page, '--entry-line-height')).toBe('1.8');
  await expect.poll(async () => (await mockState(page)).preferences).toEqual({ font: 'literata', font_size: 20, writing_width: 560, line_spacing: 180 });

  await page.reload();
  await expect.poll(() => cssVar(page, '--entry-size')).toBe('20px');
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('button', { name: 'Reset to defaults' }).click();
  await expect.poll(async () => (await mockState(page)).preferences).toEqual({ font: 'plex-sans', font_size: 17, writing_width: 720, line_spacing: 165 });
  await expect(page.getByRole('button', { name: 'Reset to defaults' })).toBeDisabled();
});

test('restoring a backup asks first, defaults to cancel, and reloads the journal', async ({ page }) => {
  await installNativeMock(page, { entries: [{ title: 'Current one' }, { title: 'Current two' }, { title: 'Current three' }], openEntry: 1 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('button', { name: 'Restore backup…' }).click();
  const confirm = page.getByRole('dialog', { name: 'Replace your journal?' });
  await expect(confirm).toBeVisible();
  await expect(confirm).toContainText('contains 2 entries');
  await expect(confirm).toContainText('replaces all 3 entries');
  await expect(confirm.getByRole('button', { name: 'Cancel' })).toBeFocused();
  await confirm.getByRole('button', { name: 'Cancel' }).click();
  expect(Object.values((await mockState(page)).entries).map(e => e.title).sort()).toEqual(['Current one', 'Current three', 'Current two']);

  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('button', { name: 'Restore backup…' }).click();
  await page.getByRole('dialog', { name: 'Replace your journal?' }).getByRole('button', { name: 'Replace journal' }).click();
  await expect(page.locator('.journal-notice')).toContainText('Journal restored: 2 entries');
  await expect(page.locator('.journal-notice')).toContainText('before-restore-1.json');
  await page.getByRole('button', { name: 'Archives' }).click();
  await expect(page.locator('#archive-panel .archive-title')).toHaveText(['Restored second', 'Restored first']);
});

test('exporting a backup saves pending writing first', async ({ page }) => {
  await installNativeMock(page, { entries: [{ title: 'Pending' }], openEntry: 1 });
  await page.goto('/');
  await page.getByRole('textbox', { name: 'Journal body' }).click();
  await page.keyboard.type(' typed just now');
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('button', { name: 'Export backup…' }).click();
  await expect(page.locator('.settings-data .settings-status')).toContainText(/Backup saved as “Terminal backup \d{4}-\d{2}-\d{2}\.json”/);
  const calls = (await mockState(page)).calls;
  expect(calls.lastIndexOf('journal_save')).toBeLessThan(calls.lastIndexOf('backup_export'));
});

test('an entry exports as readable HTML and text, including unsaved edits', async ({ page }) => {
  await installNativeMock(page, { entries: [{ title: 'Trip: Lisbon / day 2', body: 'Synthetic <script>body</script>' }], openEntry: 1 });
  await page.goto('/');
  await page.getByRole('textbox', { name: 'Journal body' }).click();
  await page.keyboard.press('End');
  await page.keyboard.type(' plus edit');
  await page.getByRole('button', { name: 'Export entry…' }).click();
  await expect(page.locator('.export-status')).toContainText('Exported as');
  const exported = (await mockState(page)).exported!;
  expect(exported.suggestedName).toBe('Trip Lisbon day 2');
  expect(exported.html).toContain('<h1>Trip: Lisbon / day 2</h1>');
  expect(exported.html).toContain('Synthetic &lt;script&gt;body&lt;/script&gt; plus edit');
  expect(exported.html).not.toContain('<script>');
  expect(exported.text.split('\n')[0]).toBe('Trip: Lisbon / day 2');
  expect(exported.text).toContain('Synthetic <script>body</script> plus edit');
});
