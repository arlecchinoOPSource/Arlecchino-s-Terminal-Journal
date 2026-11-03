import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DEFAULT_PREFERENCES, FONT_SIZE_RANGE, LINE_SPACINGS, parsePreferences, preferenceStyles, WRITING_FONTS, WRITING_WIDTHS } from '../src/domain/preferences.ts';

test('defaults are clearly defined and themselves valid', () => {
  assert.deepEqual({ ...DEFAULT_PREFERENCES }, { font: 'plex-sans', font_size: 17, writing_width: 720, line_spacing: 165 });
  assert.deepEqual(parsePreferences({ ...DEFAULT_PREFERENCES }), { ...DEFAULT_PREFERENCES });
  assert.ok(Object.isFrozen(DEFAULT_PREFERENCES));
});

test('only complete, allowed preference records are accepted', () => {
  const ok = { font: 'literata', font_size: 22, writing_width: 840, line_spacing: 200 };
  assert.deepEqual(parsePreferences(ok), ok);
  for (const bad of [null, 'x', {}, { ...ok, font: 'comic-sans' }, { ...ok, font_size: 13 }, { ...ok, font_size: 17.5 }, { ...ok, writing_width: 700 }, { ...ok, line_spacing: 1.65 }, { ...ok, extra: true }, { font: 'literata' }]) {
    assert.equal(parsePreferences(bad), null, JSON.stringify(bad));
  }
});

test('preferences become CSS variables for the writing column', () => {
  assert.deepEqual(preferenceStyles({ font: 'plex-mono', font_size: 20, writing_width: 560, line_spacing: 180 }), {
    '--entry-font': "'IBM Plex Mono', monospace", '--entry-size': '20px', '--entry-line-height': '1.8', '--writing-width': '560px',
  });
});

test('editor and native store allow exactly the same preference values', () => {
  const native = readFileSync(new URL('../src-tauri/src/preferences.rs', import.meta.url), 'utf8');
  const list = name => native.match(new RegExp(`const ${name}: \\[[^\\]]+\\] = \\[([^\\]]+)\\]`))[1].split(',').map(s => s.trim().replace(/"/g, '')).filter(Boolean);
  assert.deepEqual(list('FONTS'), WRITING_FONTS.map(f => f.id));
  assert.deepEqual(list('WIDTHS').map(Number), WRITING_WIDTHS.map(w => w.value));
  assert.deepEqual(list('LINE_SPACINGS').map(Number), LINE_SPACINGS.map(l => l.value));
  assert.ok(native.includes(`${FONT_SIZE_RANGE.min}..=${FONT_SIZE_RANGE.max}`));
  for (const [key, value] of Object.entries(DEFAULT_PREFERENCES)) assert.ok(native.includes(typeof value === 'string' ? `${key}: "${value}".into()` : `${key}: ${value},`), key);
});
