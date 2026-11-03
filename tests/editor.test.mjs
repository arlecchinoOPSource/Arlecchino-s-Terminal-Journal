import test from 'node:test';
import assert from 'node:assert/strict';
import { getSchema } from '@tiptap/core';
import { basicExtensions } from '../src/editor/extensions.ts';
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
    { type: 'paragraph', content: [{ type: 'text', text: 'Synthetic café 日本語 🎸', marks: [{ type: 'bold' }] }, { type: 'hardBreak' }, { type: 'text', text: 'Next line', marks: [{ type: 'italic' }, { type: 'strike' }, { type: 'underline' }] }] },
    { type: 'paragraph', content: [{ type: 'text', text: 'Second paragraph' }] },
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
