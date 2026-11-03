import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { entryToHtml, entryToText, exportFileStem } from '../src/domain/export.ts';

const content = JSON.parse(readFileSync(new URL('./fixtures/formatted-entry.json', import.meta.url)));
const entry = { title: 'Synthetic export', content, created_at: Date.UTC(2026, 10, 1, 9), updated_at: Date.UTC(2026, 10, 3, 18) };

test('HTML export is a self-contained readable document with the formatting', () => {
  const html = entryToHtml(entry);
  assert.match(html, /^<!doctype html>/);
  assert.match(html, /<title>Synthetic export<\/title>/);
  for (const piece of ['<h2>Synthetic heading</h2>', '<h4 style="text-align: center">Centered subheading</h4>', '<p style="text-align: right"><strong>Bold</strong><em> italic</em><u> underline</u><s> strike</s></p>',
    '<ul>', '<ol start="3">', '<blockquote>', '<th><p>Day</p></th>', '<td><p>Café 日本語 🎸</p></td>', "font-family: 'IBM Plex Mono', monospace; font-size: 20px"])
    assert.ok(html.includes(piece.replace(/'/g, '&#39;')) || html.includes(piece), piece);
  assert.ok(!/<script|<link|<img|https?:/i.test(html.replace(/name="viewport"[^>]*>/, '')));
  assert.match(html, /Content-Security-Policy" content="default-src 'none'/);
});

test('journal text is escaped so nothing in an entry becomes markup', () => {
  const hostile = { ...entry, title: '<script>alert(1)</script>', content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: '<img src=x onerror=alert(1)> & "quotes"' }] }] } };
  const html = entryToHtml(hostile);
  assert.ok(!html.includes('<script>alert'));
  assert.ok(!html.includes('<img'));
  assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt; &amp; &quot;quotes&quot;'));
  const styled = { ...entry, content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'x', marks: [{ type: 'textStyle', attrs: { fontFamily: 'x;background:url(https://example.invalid)', fontSize: '1px;position:fixed' } }] }] }] } };
  assert.ok(!entryToHtml(styled).includes('example.invalid'));
});

test('plain text export keeps structure readable without Terminal', () => {
  const text = entryToText(entry);
  const lines = text.split('\n');
  assert.equal(lines[0], 'Synthetic export');
  assert.match(lines[1], /^=+$/);
  for (const piece of ['# Synthetic heading', '### Centered subheading', 'Bold italic underline strike', 'Mono 20 condensed', '- Bullet one', '- Bullet two', '3. Third', '> Quoted synthetic line', '| Day | Note |', '| Monday | Café 日本語 🎸 |', 'After the table'])
    assert.ok(text.includes(piece), piece);
  assert.ok(!text.includes('\n\n\n'));
  assert.ok(text.endsWith('\n'));
});

test('empty and untitled entries still export', () => {
  const blank = { title: '  ', content: { type: 'doc', content: [{ type: 'paragraph' }] }, created_at: 0, updated_at: 0 };
  assert.match(entryToHtml(blank), /<h1>Untitled<\/h1>/);
  assert.match(entryToText(blank), /^Untitled\n/);
});

test('export file names never contain path separators or control characters', () => {
  assert.equal(exportFileStem('Trip: Lisbon / day 2?'), 'Trip Lisbon day 2');
  assert.equal(exportFileStem('../../etc/passwd'), 'etc passwd');
  assert.equal(exportFileStem('\u0007\n'), 'Untitled entry');
  assert.equal(exportFileStem('Café 日本語'), 'Café 日本語');
});
