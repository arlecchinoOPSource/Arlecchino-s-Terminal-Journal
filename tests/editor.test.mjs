import test from 'node:test';
import assert from 'node:assert/strict';
import { getSchema } from '@tiptap/core';
import { readFileSync } from 'node:fs';
import { ALIGNMENTS, basicExtensions, FONT_FAMILIES, FONT_SIZES } from '../src/editor/extensions.ts';
import { createDraft } from '../src/domain/draft.ts';

const schema = getSchema(basicExtensions());
test('blank draft is valid, unnumbered, and independent of another draft', () => {
  const first = createDraft();
  const second = createDraft();
  first.title = 'Synthetic';
  assert.equal(second.title, '');
  assert.equal(first.schema_version, 1);
  assert.equal('entry_number' in first, false);
  assert.equal(schema.nodeFromJSON(second.content).textContent, '');
});

test('structured document preserves multiple paragraphs, line breaks, Unicode and rich clipboard marks', () => {
  const content = { type: 'doc', content: [
    { type: 'paragraph', attrs: { textAlign: null }, content: [{ type: 'text', text: 'Synthetic café 日本語 🎸', marks: [{ type: 'bold' }] }, { type: 'hardBreak' }, { type: 'text', text: 'Next line', marks: [{ type: 'italic' }, { type: 'strike' }, { type: 'underline' }] }] },
    { type: 'paragraph', attrs: { textAlign: null }, content: [{ type: 'text', text: 'Second paragraph' }] },
  ] };
  const document = schema.nodeFromJSON(content);
  document.check();
  assert.deepEqual(JSON.parse(JSON.stringify(document.toJSON())), content);
});

test('basic schema does not accept remote media or embedded content', () => {
  for (const type of ['image', 'iframe', 'script', 'video']) {
    assert.throws(() => schema.nodeFromJSON({ type: 'doc', content: [{ type }] }));
  }
  assert.equal(schema.marks.link, undefined);
});

test('entries saved before formatting attributes existed still open unchanged', () => {
  const legacy = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Pre-T-09 synthetic entry', marks: [{ type: 'bold' }] }] }] };
  const document = schema.nodeFromJSON(legacy);
  document.check();
  assert.equal(document.textContent, 'Pre-T-09 synthetic entry');
  assert.equal(document.firstChild.attrs.textAlign, null);
});

test('formatted entry with headings, lists, quote, alignment and fonts round-trips exactly', () => {
  const content = JSON.parse(readFileSync(new URL('./fixtures/formatted-entry.json', import.meta.url)));
  const document = schema.nodeFromJSON(content);
  document.check();
  assert.deepEqual(JSON.parse(JSON.stringify(document.toJSON())), content);
  const types = new Set();
  document.descendants(node => { types.add(node.type.name); });
  for (const type of ['heading', 'bulletList', 'orderedList', 'blockquote']) assert.ok(types.has(type), type);
});

test('editor font choices match the native validator allowlist', () => {
  const native = readFileSync(new URL('../src-tauri/src/journal.rs', import.meta.url), 'utf8');
  for (const family of FONT_FAMILIES) if (family.value) assert.ok(native.includes(`"${family.value}"`), family.value);
  for (const size of FONT_SIZES) assert.ok(native.includes(`"${size}"`), size);
  for (const align of ALIGNMENTS) assert.ok(native.includes(`"${align}"`), align);
});

test('formatting schema still excludes links, code and media', () => {
  for (const name of ['link', 'code']) assert.equal(schema.marks[name], undefined);
  for (const name of ['image', 'codeBlock', 'horizontalRule']) assert.equal(schema.nodes[name], undefined);
});
