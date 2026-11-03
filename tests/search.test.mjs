import test from 'node:test';
import assert from 'node:assert/strict';
import { searchTitles, titleKey } from '../src/domain/search.ts';

const entry = (entry_number, title, updated_at = entry_number) => ({ id: `id-${entry_number}`, entry_number, title, updated_at });
const journal = [entry(1, 'Morning pages', 10), entry(2, 'Trip to LISBON', 30), entry(3, 'lisbon, day two', 20), entry(4, ''), entry(5, 'Café notes', 5)];
const titles = (query) => searchTitles(journal, query).map(e => e.title);

test('matches titles case-insensitively anywhere in the title, newest first', () => {
  assert.deepEqual(titles('lisbon'), ['Trip to LISBON', 'lisbon, day two']);
  assert.deepEqual(titles('PAGES'), ['Morning pages']);
  assert.deepEqual(titles('  day  '), ['lisbon, day two']);
});

test('blank queries and untitled entries return nothing', () => {
  assert.deepEqual(titles(''), []);
  assert.deepEqual(titles('   '), []);
  assert.deepEqual(titles('untitled'), []);
});

test('composed and decomposed accents match; accents are not ignored', () => {
  assert.deepEqual(titles('CAFÉ'), ['Café notes']);
  assert.deepEqual(titles('café'), ['Café notes']);
  assert.deepEqual(titles('cafe'), []);
  assert.equal(titleKey('ÉTÉ'), 'été');
});

test('searching does not modify the journal list', () => {
  const before = JSON.stringify(journal);
  titles('lisbon');
  assert.equal(JSON.stringify(journal), before);
});

test('search over a large journal stays fast', () => {
  const many = Array.from({ length: 10000 }, (_, i) => entry(i + 1, `Synthetic entry ${i + 1}`));
  const start = performance.now();
  const results = searchTitles(many, 'entry 99');
  const elapsed = performance.now() - start;
  assert.equal(results.length, 111);
  assert.ok(elapsed < 100, `took ${elapsed} ms`);
});
