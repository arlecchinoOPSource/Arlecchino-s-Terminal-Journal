import test from 'node:test';
import assert from 'node:assert/strict';
import { archiveDate, archiveOrder } from '../src/domain/archive.ts';

const entry = (entry_number, updated_at) => ({ id: `id-${entry_number}`, entry_number, title: `Synthetic ${entry_number}`, updated_at });

test('archive lists the most recently modified entry first, newest number breaking ties', () => {
  const ordered = archiveOrder([entry(1, 100), entry(2, 300), entry(3, 100), entry(4, 200)]);
  assert.deepEqual(ordered.map(e => e.entry_number), [2, 4, 3, 1]);
});

test('archive ordering does not mutate the stored list', () => {
  const entries = [entry(1, 100), entry(2, 300)];
  archiveOrder(entries);
  assert.deepEqual(entries.map(e => e.entry_number), [1, 2]);
});

test('archive keeps every entry of a long journal', () => {
  const many = Array.from({ length: 2000 }, (_, i) => entry(i + 1, i * 1000));
  const ordered = archiveOrder(many);
  assert.equal(ordered.length, 2000);
  assert.equal(new Set(ordered.map(e => e.id)).size, 2000);
  assert.equal(ordered[0].entry_number, 2000);
});

test('archive rows show the local modification date and time', () => {
  assert.equal(archiveDate(new Date(2026, 10, 3, 9, 5).getTime()), '2026-11-03 09:05');
  assert.equal(archiveDate(new Date(2026, 0, 7, 23, 59).getTime()), '2026-01-07 23:59');
});
