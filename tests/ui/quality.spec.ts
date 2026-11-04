import { expect, test } from '@playwright/test';
import { installNativeMock } from './native-mock';

test('a full session makes no request outside the app', async ({ page }) => {
  const external: string[] = [];
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.hostname === 'localhost' || url.protocol === 'data:') return route.continue();
    external.push(url.href);
    return route.abort();
  });
  await installNativeMock(page, { entries: [{ title: 'Offline check' }], openEntry: 1 });
  await page.goto('/');
  const editor = page.getByRole('textbox', { name: 'Journal body' });
  await editor.click();
  await page.keyboard.type(' typed offline');
  await page.getByRole('button', { name: /Insert table/ }).click();
  // The editor command restores focus asynchronously. Complete that operation
  // before opening a panel that dismisses itself when focus leaves it.
  await expect(editor).toBeFocused();
  await expect(page.locator('#storage-status')).toHaveText('Saved');
  await page.keyboard.press('ControlOrMeta+o');
  const archives = page.getByRole('dialog', { name: 'Archives' });
  await expect(archives).toBeVisible();
  await expect(archives.locator('[aria-current="true"]')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(archives).toHaveCount(0);
  await expect(editor).toBeFocused();
  await page.keyboard.press('ControlOrMeta+k');
  const search = page.getByRole('combobox', { name: 'Search entry titles' });
  await expect(search).toBeFocused();
  await page.keyboard.type('offline');
  await page.keyboard.press('Escape');
  await expect(search).toHaveCount(0);
  await expect(editor).toBeFocused();
  await page.keyboard.press('ControlOrMeta+,');
  const settings = page.getByRole('dialog', { name: 'Settings' });
  await expect(settings).toBeVisible();
  const fontSelect = settings.getByRole('combobox', { name: 'Font', exact: true });
  for (const font of ['plex-serif', 'literata', 'plex-mono']) {
    await fontSelect.selectOption(font);
    await expect(fontSelect).toHaveValue(font);
  }
  await expect(page.locator('#storage-status')).toHaveText('Saved');
  await page.evaluate(() => document.fonts.ready);
  expect(external).toEqual([]);
});

test('a 5,000-entry archive opens and searches quickly', async ({ page }, info) => {
  const entries = Array.from({ length: 5000 }, (_, i) => ({ title: `Synthetic entry ${i + 1}`, updated_at: Date.UTC(2020, 0, 1) + i * 3_600_000 }));
  await installNativeMock(page, { entries, openEntry: 1 });
  let t = Date.now();
  await page.goto('/');
  await expect(page.locator('#storage-status')).toHaveText('Saved');
  const launch = Date.now() - t;

  t = Date.now();
  await page.keyboard.press('ControlOrMeta+o');
  await expect(page.locator('#archive-panel .archive-row')).toHaveCount(5000);
  const archive = Date.now() - t;
  await page.keyboard.press('End');
  await expect(page.locator('#archive-panel .archive-row').last()).toBeFocused();
  await page.keyboard.press('Escape');

  t = Date.now();
  await page.keyboard.press('ControlOrMeta+k');
  await page.keyboard.type('entry 4999');
  await expect(page.getByRole('listbox', { name: 'Matching entries' }).getByRole('option')).toHaveCount(1);
  const search = Date.now() - t;
  info.annotations.push({ type: 'timing', description: `launch ${launch} ms; open archive ${archive} ms; type search and filter ${search} ms` });
  console.log(`[5,000 entries] launch ${launch} ms; open archive ${archive} ms; search ${search} ms`);
  expect(archive).toBeLessThan(5000);
  expect(search).toBeLessThan(5000);
});

test('a very long entry opens and stays responsive while typing', async ({ page }, info) => {
  const paragraph = 'Synthetic long entry sentence for responsiveness checks. '.repeat(10);
  const content = { type: 'doc', content: Array.from({ length: 2000 }, () => ({ type: 'paragraph', attrs: { textAlign: null }, content: [{ type: 'text', text: paragraph }] })) };
  await installNativeMock(page, { entries: [{ title: 'Long synthetic entry', content }], openEntry: 1 });
  let t = Date.now();
  await page.goto('/');
  await expect(page.getByRole('textbox', { name: 'Journal body' }).locator('p')).toHaveCount(2000);
  const open = Date.now() - t;
  const words = await page.getByRole('textbox', { name: 'Journal body' }).evaluate(el => el.textContent!.split(/\s+/).filter(Boolean).length);
  await page.getByRole('textbox', { name: 'Journal body' }).click();
  await page.keyboard.press('ControlOrMeta+End');
  t = Date.now();
  await page.keyboard.type(' twenty more characters');
  await expect(page.getByRole('textbox', { name: 'Journal body' })).toContainText('twenty more characters');
  const typing = Date.now() - t;
  await expect(page.locator('#storage-status')).toHaveText('Saved', { timeout: 10_000 });
  info.annotations.push({ type: 'timing', description: `${words} words; open ${open} ms; type 23 characters ${typing} ms` });
  console.log(`[long entry ${words} words] open ${open} ms; typing 23 chars ${typing} ms`);
  expect(open).toBeLessThan(8000);
  expect(typing).toBeLessThan(5000);
});

test('reduced-motion preference stops every animation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await installNativeMock(page, { entries: [{ title: 'Calm' }], openEntry: 1 });
  await page.goto('/');
  await page.evaluate(() => { document.querySelector('.save-status')!.setAttribute('data-tone', 'busy'); });
  const running = await page.evaluate(() => document.getAnimations().filter(a => a.playState === 'running').length);
  expect(running).toBe(0);
  expect(await page.locator('.wordmark-glow').evaluate(el => getComputedStyle(el).animationName)).toBe('none');
});
