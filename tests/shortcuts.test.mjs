import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ariaShortcut, matchShortcut, SHORTCUT_HELP, shortcutLabel } from '../src/domain/shortcuts.ts';

const key = (k, mods = {}) => ({ key: k, metaKey: false, ctrlKey: false, altKey: false, shiftKey: false, ...mods });

test('app shortcuts use ⌘ on macOS and Ctrl on Windows', () => {
  assert.equal(matchShortcut(key('n', { metaKey: true }), true), 'new-entry');
  assert.equal(matchShortcut(key('k', { metaKey: true }), true), 'search');
  assert.equal(matchShortcut(key('o', { metaKey: true }), true), 'archives');
  assert.equal(matchShortcut(key(',', { metaKey: true }), true), 'settings');
  assert.equal(matchShortcut(key('n', { ctrlKey: true }), false), 'new-entry');
  assert.equal(matchShortcut(key('K', { ctrlKey: true }), false), 'search');
});

test('wrong or extra modifiers and plain typing never trigger app actions', () => {
  assert.equal(matchShortcut(key('n'), true), null);
  assert.equal(matchShortcut(key('n', { ctrlKey: true }), true), null);
  assert.equal(matchShortcut(key('n', { metaKey: true }), false), null);
  assert.equal(matchShortcut(key('n', { metaKey: true, ctrlKey: true }), true), null);
  assert.equal(matchShortcut(key('k', { metaKey: true, altKey: true }), true), null);
  assert.equal(matchShortcut(key('k', { metaKey: true, shiftKey: true }), true), null);
  for (const formatting of ['b', 'i', 'u', 'z', 'y']) assert.equal(matchShortcut(key(formatting, { metaKey: true }), true), null);
});

test('shortcut labels and aria-keyshortcuts follow the platform', () => {
  assert.equal(shortcutLabel('Mod+K', true), '⌘K');
  assert.equal(shortcutLabel('Mod+Shift+Z', true), '⌘⇧Z');
  assert.equal(shortcutLabel('Mod+Alt+1–3', false), 'Ctrl+Alt+1–3');
  assert.equal(shortcutLabel('Mod+,', false), 'Ctrl+,');
  assert.equal(shortcutLabel('Escape', true), 'Escape');
  assert.equal(ariaShortcut('Mod+K', true), 'Meta+K');
  assert.equal(ariaShortcut('Mod+K', false), 'Control+K');
});

test('documented editor shortcuts exist in the bundled Tiptap extensions', () => {
  const source = name => readFileSync(new URL(`../node_modules/@tiptap/${name}/dist/index.js`, import.meta.url), 'utf8');
  const expected = { 'extension-bold': 'Mod-b', 'extension-italic': 'Mod-i', 'extension-underline': 'Mod-u', 'extension-strike': 'Mod-Shift-s', 'extension-blockquote': 'Mod-Shift-b', 'extension-paragraph': 'Mod-Alt-0', 'extension-text-align': 'Mod-Shift-l' };
  for (const [pkg, binding] of Object.entries(expected)) assert.ok(source(pkg).includes(binding), `${pkg} ${binding}`);
  assert.ok(SHORTCUT_HELP.every(s => s.keys.length > 0 && s.label));
});
