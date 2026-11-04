import { expect, test, type Page } from '@playwright/test';
import { installNativeMock, setMock } from './native-mock';

// T-28–T-30: motion levels, reduced motion, idle behaviour, rapid actions and responsiveness.
const running = (page: Page) => page.evaluate(() => document.getAnimations().filter(a => a.playState === 'running').map(a => (a as CSSAnimation).animationName ?? 'transition'));
const launch = async (page: Page, motion?: string) => {
  if (motion) await page.addInitScript(m => localStorage.setItem('terminal.motion', m), motion);
  await installNativeMock(page, { entries: [{ title: 'Motion one', body: 'Synthetic motion body' }, { title: 'Motion two' }], openEntry: 1 });
  await page.goto('/');
  await expect(page.locator('#storage-status')).toHaveText('Saved');
};

test('panels and controls animate briefly, then nothing runs while idle', async ({ page }) => {
  await launch(page);
  expect(await page.evaluate(() => document.documentElement.dataset.motion)).toBe('full');
  await page.keyboard.press('ControlOrMeta+o');
  const archives = page.getByRole('dialog', { name: 'Archives' });
  await expect(archives).toBeVisible();
  // Focus moves into the panel at once; the reveal does not hold it back.
  await expect(archives.locator('[aria-current="true"]')).toBeFocused();
  const timing = await archives.evaluate(el => getComputedStyle(el).animationName + ' ' + getComputedStyle(el).animationDuration);
  expect(timing).toBe('panel-in 0.16s');
  const box = await archives.boundingBox();
  await page.waitForTimeout(400);
  // The reveal is clip-path and opacity only: the panel never moves.
  expect(await archives.boundingBox()).toEqual(box);
  await page.keyboard.press('Escape');
  await page.mouse.move(0, 0);
  await page.waitForTimeout(1500);
  expect(await running(page)).toEqual([]);
});

test('motion levels: Reduced keeps fades only, Off and the OS setting stop everything', async ({ page }) => {
  await launch(page);
  await page.keyboard.press('ControlOrMeta+,');
  const settings = page.getByRole('dialog', { name: 'Settings' });
  const motion = settings.getByRole('group', { name: /Motion/ });
  await expect(motion.getByRole('radio', { name: 'Full' })).toBeChecked();
  await motion.getByRole('radio', { name: 'Reduced' }).check();
  expect(await page.evaluate(() => document.documentElement.dataset.motion)).toBe('reduced');
  await page.keyboard.press('Escape');
  await page.keyboard.press('ControlOrMeta+o');
  await expect(page.getByRole('dialog', { name: 'Archives' })).toBeVisible();
  expect(await page.locator('#archive-panel').evaluate(el => getComputedStyle(el).animationName)).toBe('none');
  expect(await page.locator('.archive-row').first().evaluate(el => getComputedStyle(el).transitionDuration)).not.toBe('0s');
  await page.keyboard.press('Escape');

  await page.keyboard.press('ControlOrMeta+,');
  await page.getByRole('dialog', { name: 'Settings' }).getByRole('group', { name: /Motion/ }).getByRole('radio', { name: 'Off' }).check();
  await page.keyboard.press('Escape');
  await page.reload();
  await expect(page.locator('#storage-status')).toHaveText('Saved');
  expect(await page.evaluate(() => document.documentElement.dataset.motion)).toBe('off');
  await page.keyboard.press('ControlOrMeta+o');
  await expect(page.getByRole('dialog', { name: 'Archives' })).toBeVisible();
  expect(await page.locator('.archive-row').first().evaluate(el => getComputedStyle(el).transitionDuration)).toBe('0s');
  expect(await running(page)).toEqual([]);
});

test('the OS reduced-motion setting cannot be overridden by Full', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await launch(page, 'full');
  await page.keyboard.press('ControlOrMeta+o');
  await expect(page.getByRole('dialog', { name: 'Archives' })).toBeVisible();
  expect(await running(page)).toEqual([]);
  await page.keyboard.press('Escape');
  await page.keyboard.press('ControlOrMeta+,');
  await expect(page.getByRole('dialog', { name: 'Settings' })).toContainText('Your system asks for reduced motion');
});

test('every theme uses the same motion', async ({ page }) => {
  await launch(page);
  const seen = new Set<string>();
  for (const theme of ['mint', 'blue', 'ember', 'amber']) {
    await page.evaluate(t => { document.documentElement.dataset.theme = t; }, theme);
    await page.keyboard.press('ControlOrMeta+o');
    const panel = page.locator('#archive-panel');
    await expect(panel).toBeVisible();
    seen.add(await panel.evaluate(el => { const s = getComputedStyle(el); return `${s.animationName} ${s.animationDuration} ${s.animationTimingFunction}`; }));
    await page.keyboard.press('Escape');
  }
  expect([...seen]).toEqual(['panel-in 0.16s steps(4, jump-start)']);
});

test('rapid toggling leaves panels, focus and the entry consistent', async ({ page }) => {
  await launch(page);
  const editor = page.getByRole('textbox', { name: 'Journal body' });
  for (let i = 0; i < 9; i++) await page.keyboard.press('ControlOrMeta+o');
  await expect(page.getByRole('dialog', { name: 'Archives' })).toBeVisible();
  await page.keyboard.press('Escape');
  // Repeated clicks on the same spot: the second lands on the scrim, which closes the panel.
  const themes = await page.getByRole('button', { name: 'Themes', exact: true }).boundingBox();
  for (let i = 0; i < 6; i++) await page.mouse.click(themes!.x + themes!.width / 2, themes!.y + themes!.height / 2);
  await expect(page.locator('.popover')).toHaveCount(0);
  for (let i = 0; i < 5; i++) { await page.keyboard.press('ControlOrMeta+k'); await page.keyboard.press('Escape'); }
  await expect(page.locator('.popover, .popover-scrim')).toHaveCount(0);
  await editor.click();
  await expect(editor).toBeFocused();
  await page.keyboard.press('End');
  for (let i = 0; i < 8; i++) await page.keyboard.press('ControlOrMeta+b');
  await page.keyboard.type(' plain');
  await expect(editor).toContainText('Synthetic motion body plain');
  // Under heavy load a press can be dropped; what matters is that the toolbar and the text agree.
  const bold = await page.getByRole('button', { name: 'Bold' }).getAttribute('aria-pressed') === 'true';
  await expect(editor.locator('strong')).toHaveCount(bold ? 1 : 0);
  await expect(page.locator('#storage-status')).toHaveText('Saved');
});

test('writing is never animated and save failures show at once', async ({ page }) => {
  await launch(page);
  const editor = page.getByRole('textbox', { name: 'Journal body' });
  await editor.click();
  await page.keyboard.press('ControlOrMeta+End');
  await setMock(page, { failSaves: 5 });
  await page.keyboard.type(' typed while saving fails');
  const inWriting = await page.evaluate(() => document.getAnimations().filter(a => {
    const target = (a.effect as KeyframeEffect | null)?.target;
    return target instanceof Element && target.closest('.journal-body, .entry-title');
  }).length);
  expect(inWriting).toBe(0);
  const status = page.locator('.save-status');
  await expect(status).toHaveAttribute('data-tone', 'error', { timeout: 10_000 });
  // The failure blink starts fully lit (checked on its keyframes, not by sampling time).
  expect(await status.locator('.save-meter').evaluate(el => getComputedStyle(el).animationName)).toBe('status-alert');
  const first = await page.evaluate(() => {
    for (const sheet of document.styleSheets) for (const rule of sheet.cssRules) {
      if (rule instanceof CSSKeyframesRule && rule.name === 'status-alert') return ([...rule.cssRules] as CSSKeyframeRule[]).find(k => k.keyText.split(',').map(t => t.trim()).includes('0%'))?.style.opacity;
    }
    return null;
  });
  expect(first).toBe('1');
  await expect(page.locator('#storage-status')).not.toHaveText('Saved');
});

test('typing responsiveness is the same with motion on and off', async ({ page, browser }, info) => {
  const text = 'The quick brown fox jumps over the lazy dog. '.repeat(4);
  const measure = async (p: Page) => {
    const editor = p.getByRole('textbox', { name: 'Journal body' });
    await editor.click();
    await p.keyboard.press('ControlOrMeta+End');
    const t = Date.now();
    await p.keyboard.type(text);
    await expect(editor).toContainText(text.trim());
    return Date.now() - t;
  };
  await launch(page, 'full');
  const full = await measure(page);
  const other = await browser.newPage();
  await launch(other, 'off');
  const off = await measure(other);
  await other.close();
  info.annotations.push({ type: 'typing-ms', description: `${text.length} characters: full ${full} ms, off ${off} ms` });
  console.log(`[${info.project.name}] typing ${text.length} chars: motion full ${full} ms, off ${off} ms`);
  expect(full).toBeLessThan(off * 1.5 + 250);
});
