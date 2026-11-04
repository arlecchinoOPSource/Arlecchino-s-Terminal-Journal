import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { effectiveMotion, parseMotion } from '../src/domain/motion.ts';

// T-28: motion tokens and levels.
const stripComments = css => css.replace(/\/\*[\s\S]*?\*\//g, '');
const appCss = stripComments(readFileSync(new URL('../src/styles/app.css', import.meta.url), 'utf8'));
const tokensCss = stripComments(readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8'));
const ms = name => {
  const value = tokensCss.match(new RegExp(`${name}:\\s*([\\d.]+)(m?s);`));
  assert.ok(value, `${name} is defined`);
  return Number(value[1]) * (value[2] === 's' ? 1000 : 1);
};

test('motion timings stay within the specification ranges', () => {
  const within = (name, min, max) => { const v = ms(name); assert.ok(v >= min && v <= max, `${name} ${v} ms not in ${min}–${max}`); };
  within('--motion-press', 60, 120);
  within('--motion-state', 100, 160);
  within('--motion-popover', 120, 200);
  within('--motion-dialog', 140, 220);
});

test('every animation and transition duration comes from a motion token', () => {
  const declarations = appCss.match(/(?:transition|animation)(?:-duration)?\s*:[^;}]+/g) ?? [];
  assert.ok(declarations.length > 10);
  for (const d of declarations) {
    if (/:\s*none/.test(d)) continue;
    assert.doesNotMatch(d.replace(/steps\([^)]*\)|cubic-bezier\([^)]*\)/g, ''), /(?<![\w-])\d*\.?\d+m?s\b/, d);
  }
});

test('the writing page is never animated', () => {
  for (const rule of appCss.match(/[^{}]+\{[^}]*animation\s*:[^}]*\}/g) ?? []) {
    assert.doesNotMatch(rule.split('{')[0], /journal-body|entry-title|writing-column|editor/, rule);
  }
});

test('reduced and off levels, and the OS setting, disable animation', () => {
  assert.match(appCss, /:root\[data-motion='reduced'\] \*[^{]*\{ animation: none !important; \}/);
  assert.match(appCss, /:root\[data-motion='off'\] \*[^{]*\{[^}]*animation: none !important; transition: none !important;/);
  assert.match(appCss, /@media \(prefers-reduced-motion: reduce\) \{\s*\*[^{]*\{[^}]*animation: none !important; transition: none !important;/);
});

test('motion level parsing and the OS override', () => {
  assert.equal(parseMotion('reduced'), 'reduced');
  for (const bad of [null, undefined, '', 'FULL', 'fast', 1]) assert.equal(parseMotion(bad), 'full');
  assert.equal(effectiveMotion('full', true), 'off');
  assert.equal(effectiveMotion('reduced', true), 'off');
  assert.equal(effectiveMotion('reduced', false), 'reduced');
  assert.equal(effectiveMotion('full', false), 'full');
});
