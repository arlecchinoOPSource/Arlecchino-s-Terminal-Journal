import { expect, test } from '@playwright/test';
import { installNativeMock, mockState, setMock } from './native-mock';

const status = (page: import('@playwright/test').Page) => page.locator('#storage-status');
const body = (page: import('@playwright/test').Page) => page.getByRole('textbox', { name: 'Journal body' });
const title = (page: import('@playwright/test').Page) => page.getByRole('textbox', { name: 'Entry title' });

test('a new entry autosaves, gets a number, and reopens after relaunch', async ({ page }) => {
  await installNativeMock(page);
  await page.goto('/');
  await expect(status(page)).toHaveText('Empty draft');
  await title(page).fill('Synthetic morning');
  await body(page).click();
  await page.keyboard.type('First synthetic paragraph.');
  await expect(status(page)).toHaveText('Saved');
  await expect(page.locator('.draft-label')).toHaveText('#1');
  const saved = Object.values((await mockState(page)).entries);
  expect(saved).toHaveLength(1);
  expect(saved[0]?.title).toBe('Synthetic morning');
  expect(JSON.stringify(saved[0]?.content)).toContain('First synthetic paragraph.');

  await page.reload();
  await expect(title(page)).toHaveValue('Synthetic morning');
  await expect(body(page)).toContainText('First synthetic paragraph.');
  await expect(status(page)).toHaveText('Saved');
});

test('a blank draft is never stored and opening entries does not rewrite them', async ({ page }) => {
  await installNativeMock(page, { entries: [{ title: 'One' }, { title: 'Two' }], openEntry: 1 });
  await page.goto('/');
  await expect(title(page)).toHaveValue('One');
  await page.getByRole('button', { name: 'New entry' }).click();
  await expect(status(page)).toHaveText('Empty draft');
  await page.keyboard.press('ControlOrMeta+o');
  await page.getByRole('button', { name: /^Two,/ }).click();
  await expect(title(page)).toHaveValue('Two');
  const state = await mockState(page);
  expect(state.writes).toBe(0);
  expect(Object.keys(state.entries)).toHaveLength(2);
});

test('a failed save keeps the writing, says so, and retry succeeds', async ({ page }) => {
  await installNativeMock(page, { entries: [{ title: 'Keep me' }], openEntry: 1 });
  await page.goto('/');
  await expect(status(page)).toHaveText('Saved');
  await setMock(page, { failSaves: 1 });
  await body(page).click();
  await page.keyboard.press('End');
  await page.keyboard.type(' unsaved words');
  await expect(status(page)).toHaveText('Save failed');
  await expect(page.getByRole('alert')).toContainText('unsaved writing is still in this window');
  await expect(body(page)).toContainText('unsaved words');
  await page.getByRole('button', { name: 'Retry save' }).click();
  await expect(status(page)).toHaveText('Saved');
  expect(JSON.stringify(Object.values((await mockState(page)).entries)[0]?.content)).toContain('unsaved words');
});

test('formatting applies to the selection, the toolbar reflects it, and it is saved', async ({ page }) => {
  await installNativeMock(page);
  await page.goto('/');
  await body(page).click();
  await page.keyboard.type('Plain then bold');
  for (let i = 0; i < 4; i++) await page.keyboard.press('Shift+ArrowLeft');
  await page.getByRole('button', { name: 'Bold', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Bold', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(body(page).locator('strong')).toHaveText('bold');
  await page.getByRole('button', { name: 'Align center' }).click();
  await expect(status(page)).toHaveText('Saved');
  const content = JSON.stringify(Object.values((await mockState(page)).entries)[0]?.content);
  expect(content).toContain('"type":"bold"');
  expect(content).toContain('"textAlign":"center"');
});

test('tables can be inserted, navigated with Tab, grown and saved', async ({ page }) => {
  await installNativeMock(page);
  await page.goto('/');
  await body(page).click();
  await page.getByRole('button', { name: /Insert table/ }).click();
  await expect(body(page)).toBeFocused();
  await page.keyboard.type('Day');
  await expect(body(page).locator('th').first()).toHaveText('Day');
  await page.keyboard.press('Tab');
  await expect.poll(() => body(page).evaluate(() => window.getSelection()?.anchorNode?.parentElement?.closest<HTMLTableCellElement>('th, td')?.cellIndex)).toBe(1);
  await page.keyboard.type('Note');
  await expect(body(page).locator('th').nth(1)).toHaveText('Note');
  await page.getByRole('button', { name: 'Add row below' }).click();
  await page.getByRole('button', { name: 'Add column right' }).click();
  await expect(body(page).locator('table tr')).toHaveCount(4);
  await expect(body(page).locator('table tr').first().locator('th')).toHaveCount(4);
  await expect(status(page)).toHaveText('Saved');
  const content = JSON.stringify(Object.values((await mockState(page)).entries)[0]?.content);
  expect(content).toContain('"type":"tableHeader"');
  expect(content).toContain('"text":"Note"');
});

test('deleting asks first, names the entry, and removes it from archives and search', async ({ page }) => {
  await installNativeMock(page, { entries: [{ title: 'Lisbon keep' }, { title: 'Lisbon remove' }], openEntry: 2 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Delete entry' }).click();
  const dialog = page.getByRole('dialog', { name: /Delete “Lisbon remove”/ });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused();
  await dialog.getByRole('button', { name: 'Cancel' }).click();
  expect(Object.keys((await mockState(page)).entries)).toHaveLength(2);

  await page.getByRole('button', { name: 'Delete entry' }).click();
  await page.getByRole('dialog', { name: /Delete/ }).getByRole('button', { name: 'Delete entry' }).click();
  await expect(page.locator('.draft-label')).toHaveText('DRAFT');
  await page.keyboard.press('ControlOrMeta+k');
  await page.getByRole('combobox', { name: 'Search entry titles' }).fill('lisbon');
  await expect(page.getByRole('listbox', { name: 'Matching entries' }).getByRole('option')).toHaveText([/Lisbon keep/]);
});

test('title font, size, emphasis and alignment persist independently of body formatting', async ({ page }) => {
  await installNativeMock(page);
  await page.goto('/');
  const title=page.getByRole('textbox',{name:'Entry title'});
  await title.fill('Synthetic styled title');
  await page.getByRole('combobox',{name:'Font family',exact:true}).selectOption("'Literata', serif");
  await page.getByRole('combobox',{name:'Font size',exact:true}).selectOption('24px');
  await page.getByRole('button',{name:'Bold',exact:true}).click();
  await page.getByRole('button',{name:'Align center',exact:true}).click();
  await expect(title).toHaveCSS('font-size','24px');
  await expect(title).toHaveCSS('font-weight','700');
  await expect(title).toHaveCSS('text-align','center');
  await body(page).click();
  await page.keyboard.type('Body remains separate');
  await expect(status(page)).toHaveText('Saved');
  await page.reload();
  await expect(title).toHaveValue('Synthetic styled title');
  await expect(title).toHaveCSS('font-size','24px');
  await expect(title).toHaveCSS('font-family', /Literata/);
  await expect(title).toHaveCSS('font-weight','700');
  await expect(body(page)).toContainText('Body remains separate');
  await expect(body(page).locator('strong')).toHaveCount(0);
});

test('title formatting shortcuts apply to the whole title and leave the body alone', async ({ page }) => {
  await installNativeMock(page);
  await page.goto('/');
  const title=page.getByRole('textbox',{name:'Entry title'});
  await title.fill('Synthetic shortcut title');
  await page.keyboard.press('ControlOrMeta+b');
  await page.keyboard.press('ControlOrMeta+i');
  await page.keyboard.press('ControlOrMeta+Shift+S');
  await page.keyboard.press('ControlOrMeta+Shift+E');
  await expect(title).toHaveCSS('font-weight','700');
  await expect(title).toHaveCSS('font-style','italic');
  await expect(title).toHaveCSS('text-decoration-line','line-through');
  await expect(title).toHaveCSS('text-align','center');
  await expect(page.getByRole('button',{name:'Bold',exact:true})).toHaveAttribute('aria-pressed','true');
  await page.keyboard.press('ControlOrMeta+b');
  await expect(title).toHaveCSS('font-weight','400');
  await expect(page.getByRole('button',{name:'Bold',exact:true})).toHaveAttribute('aria-pressed','false');
  // The body keeps its own shortcuts and never inherits the title's emphasis.
  await body(page).click();
  await page.keyboard.type('Body shortcut');
  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.press('ControlOrMeta+b');
  await expect(body(page).locator('strong')).toHaveText('Body shortcut');
  await expect(title).toHaveCSS('font-weight','400');
  await expect(status(page)).toHaveText('Saved');
});
