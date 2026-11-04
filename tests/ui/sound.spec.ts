import { expect, test, type Page } from '@playwright/test';
import { installNativeMock, setMock } from './native-mock';

// T-25–T-27: which bundled sound actually starts, observed by wrapping Web Audio in the page.
async function recordSounds(page: Page, stored?: Record<string, unknown>) {
  await page.addInitScript(settings => {
    // The startup sound has its own tests (startup.spec.ts); keep it out of these recordings.
    if (settings) localStorage.setItem('terminal.sound', JSON.stringify({ startup: false, ...settings }));
    const played: string[] = [];
    (window as unknown as { __played: string[] }).__played = played;
    const names = new WeakMap<object, string>();
    const realFetch = window.fetch.bind(window);
    window.fetch = async (input, init) => {
      const response = await realFetch(input, init);
      const url = String(input instanceof Request ? input.url : input);
      const name = decodeURIComponent(url.split('?')[0]!.split('/').slice(-2).join('/')).replace(/-[\w-]{8}\.wav$/, '.wav');
      const data = await response.arrayBuffer();
      names.set(data, name);
      return { ok: response.ok, status: response.status, statusText: response.statusText, arrayBuffer: async () => data } as Response;
    };
    const decode = BaseAudioContext.prototype.decodeAudioData;
    BaseAudioContext.prototype.decodeAudioData = async function (this: BaseAudioContext, data: ArrayBuffer) {
      const name = names.get(data);
      const buffer = await decode.call(this, data);
      if (name) names.set(buffer, name);
      return buffer;
    } as typeof decode;
    const start = AudioBufferSourceNode.prototype.start;
    AudioBufferSourceNode.prototype.start = function (this: AudioBufferSourceNode, ...args: Parameters<typeof start>) {
      played.push(this.buffer ? names.get(this.buffer) ?? 'unknown' : 'none');
      return start.apply(this, args);
    };
  }, stored ?? null);
  await installNativeMock(page, { entries: [{ title: 'Sound entry', body: 'Synthetic' }, { title: 'Other' }], openEntry: 1 });
  await page.goto('/');
  await expect(page.locator('#storage-status')).toHaveText('Saved');
}
/** Sounds started since the last clear (read without clearing, so polls see the whole sequence). */
const played = (page: Page) => page.evaluate(() => [...(window as unknown as { __played: string[] }).__played]);
const clear = (page: Page) => page.evaluate(() => { (window as unknown as { __played: string[] }).__played.length = 0; });
const on = { enabled: true };

test('sound is off by default; the Sounds panel turns it on and remembers it', async ({ page }) => {
  await recordSounds(page);
  const rail = page.getByRole('navigation', { name: 'Journal navigation' });
  await rail.getByRole('button', { name: 'Archives' }).click();
  await page.keyboard.press('Escape');
  await page.getByRole('textbox', { name: 'Journal body' }).click();
  await page.keyboard.type('quiet');
  await expect.poll(() => played(page)).toEqual([]);
  await clear(page);

  await rail.getByRole('button', { name: 'Sounds', exact: true }).click();
  const panel = page.getByRole('dialog', { name: 'Sounds' });
  const master = panel.getByRole('switch', { name: 'Sound' });
  await expect(master).not.toBeChecked();
  await master.check();
  await expect.poll(() => played(page)).toEqual(['ui/icon-menu.wav']);
  await clear(page);
  await panel.getByRole('radio', { name: /Clicky/ }).check();
  await expect.poll(() => played(page)).toEqual(['clicky/key-01.wav']);
  await clear(page);
  await panel.getByRole('button', { name: 'Preview Close sound' }).click();
  await expect.poll(() => played(page)).toEqual(['arlecchino/close.wav']);
  await clear(page);
  await panel.getByRole('checkbox', { name: /Typesetting/ }).uncheck();
  await page.reload();
  await expect(page.locator('#storage-status')).toHaveText('Saved');
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('terminal.sound') ?? 'null'));
  expect(stored).toMatchObject({ enabled: true, keyboard: 'clicky', typesetting: false });
});

test('clicks sound by region: icon menus, typesetting and text editing', async ({ page }) => {
  await recordSounds(page, on);
  await page.getByRole('button', { name: 'Archives' }).click();
  await expect.poll(() => played(page)).toEqual(['ui/icon-menu.wav']);
  await clear(page);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Bold' }).click();
  await expect.poll(() => played(page)).toEqual(['ui/typesetting.wav']);
  await clear(page);
  await page.getByRole('combobox', { name: 'Font family' }).selectOption({ index: 1 });
  await expect.poll(() => played(page)).toEqual(['ui/typesetting.wav']);
  await clear(page);
  await page.getByRole('button', { name: 'Delete entry' }).click();
  await expect.poll(() => played(page)).toEqual(['ui/text-edit.wav']);
  await clear(page);
  await page.getByRole('dialog', { name: /Delete/ }).getByRole('button', { name: 'Cancel' }).click();
  await expect.poll(() => played(page)).toEqual(['ui/text-edit.wav']);
  await clear(page);
  // Shortcuts and disabled controls make no click.
  await page.keyboard.press('ControlOrMeta+o');
  await page.keyboard.press('Escape');
  expect(await played(page)).toEqual([]);
});

test('typing sounds follow text changes only', async ({ page }) => {
  await recordSounds(page, on);
  const editor = page.getByRole('textbox', { name: 'Journal body' });
  await editor.click();
  await expect(editor).toBeFocused();
  await page.keyboard.press('ControlOrMeta+End');
  await clear(page);
  await page.keyboard.type('ab c');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Backspace');
  // The first sounds of a session may start out of order while their files decode, so compare as a set.
  await expect.poll(async () => (await played(page)).map(n => n.replace(/key-\d+/, 'key')).sort().join(' ')).toBe('thock/backspace.wav thock/enter.wav thock/key.wav thock/key.wav thock/key.wav thock/space.wav');
  await clear(page);
  // Shortcuts, navigation and modifiers are silent, even when a shortcut changes formatting.
  await page.keyboard.press('ControlOrMeta+b');
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('Shift');
  await page.keyboard.press('ControlOrMeta+z');
  await page.waitForTimeout(250);
  expect(await played(page)).toEqual([]);
  // The title sounds too.
  await page.getByRole('textbox', { name: 'Entry title' }).click();
  await page.keyboard.press('End');
  await page.keyboard.type('x');
  await expect.poll(() => played(page)).toEqual([expect.stringMatching(/^thock\/key-\d+\.wav$/)]);
  await clear(page);
  // Nothing typed is stored with the sound settings.
  expect(await page.evaluate(() => localStorage.getItem('terminal.sound') ?? '')).not.toContain('ab c');
});

test('the Silent pack and the master switch silence everything at once', async ({ page }) => {
  await recordSounds(page, { enabled: true, keyboard: 'silent' });
  const editor = page.getByRole('textbox', { name: 'Journal body' });
  await editor.click();
  await page.keyboard.type('silent');
  await page.waitForTimeout(250);
  expect(await played(page)).toEqual([]);
  await page.getByRole('button', { name: 'Sounds', exact: true }).click();
  // Let the menu cue start before muting: mute correctly cancels pending decodes.
  await expect.poll(() => played(page)).toEqual(['ui/icon-menu.wav']);
  await page.getByRole('dialog', { name: 'Sounds' }).getByRole('switch', { name: 'Sound' }).uncheck();
  expect(await played(page)).toEqual(['ui/icon-menu.wav']);
  await clear(page);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Archives' }).click();
  await page.waitForTimeout(250);
  expect(await played(page)).toEqual([]);
});

test('a failed save plays the error sound once, and writing continues', async ({ page }) => {
  await recordSounds(page, on);
  const editor = page.getByRole('textbox', { name: 'Journal body' });
  await editor.click();
  await page.keyboard.press('ControlOrMeta+End');
  await setMock(page, { failSaves: 3 });
  await page.keyboard.type('!');
  await expect(page.locator('.save-status')).toHaveAttribute('data-tone', 'error', { timeout: 10_000 });
  await expect.poll(async () => (await played(page)).filter(n => n.includes('error'))).toEqual(['arlecchino/error.wav']);
  await clear(page);
  await page.keyboard.type('?');
  await expect(editor).toContainText('Synthetic!?');
});

test('typesetting sounds survive toolbar rerenders for buttons and dropdowns and respect mute', async ({page})=>{
  await recordSounds(page,{enabled:true,typesetting:true});
  await page.getByRole('textbox',{name:'Journal body'}).click();
  await clear(page);
  await page.getByRole('button',{name:'Bold',exact:true}).click();
  await expect.poll(()=>played(page)).toContain('ui/typesetting.wav');
  await clear(page);
  await page.getByRole('combobox',{name:'Font size',exact:true}).selectOption('24px');
  await expect.poll(()=>played(page)).toContain('ui/typesetting.wav');
  await page.getByRole('button',{name:'Sounds',exact:true}).click();
  await page.getByRole('switch',{name:'Sound',exact:true}).click();
  await page.keyboard.press('Escape');
  await clear(page);
  await page.getByRole('button',{name:'Italic',exact:true}).click();
  expect(await played(page)).toEqual([]);
});
