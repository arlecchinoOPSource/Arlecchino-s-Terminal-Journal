import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

// T-22: the theme contract in tokens.css and its use by the interface styles.
const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const stripComments = css => css.replace(/\/\*[\s\S]*?\*\//g, '');
const tokensCss = stripComments(read('src/styles/tokens.css'));
const appCss = stripComments(read('src/styles/app.css'));

/** Custom properties declared in the :root block that holds the core roles. */
function themeTokens() {
  const block = tokensCss.match(/:root\s*\{([^}]*--dominant:[^}]*)\}/);
  assert.ok(block, 'tokens.css declares a theme block with the core roles');
  const tokens = {};
  for (const [, name, value] of block[1].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) tokens[name] = value.trim();
  return tokens;
}
const theme = themeTokens();
const resolve = (value, depth = 0) => {
  assert.ok(depth < 10, `var() chain too deep: ${value}`);
  const next = value.replace(/var\((--[\w-]+)\)/g, (_, name) => {
    assert.ok(name in theme, `${name} is defined in the theme block`);
    return theme[name];
  });
  return next === value ? value.toUpperCase().replace(/\s+/g, '') : resolve(next, depth + 1);
};
const channels = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)).join(',');

// Every themed colour of Terminal Mint as released in v1.0.0 (7071143).
const releasedMint = {
  '--void': '#050706', '--gutter': '#070908', '--panel': '#0B0F0D', '--page': '#0D1210',
  '--panel-2': '#121815', '--tint': '#10261E', '--line': '#1A2420', '--line-2': '#284239',
  '--line-3': '#43786A', '--text': '#E0EFE8', '--text-2': '#A2BDB1', '--muted': '#7E9A8E',
  '--phosphor': '#52F0BE', '--phosphor-hi': '#B4FFE4', '--phosphor-lo': '#16906C',
  '--glow': 'RGBA(82,240,190,.32)', '--amber': '#FFB648', '--danger': '#FF6B78', '--focus': '#C2FFE9',
  // Literals in v1.0.0 app.css that are now tokens.
  '--shell-bloom': '#0E1C17', '--text-strong': '#F3FBF7',
};

test('Mint keeps every released v1.0.0 colour', () => {
  for (const [name, value] of Object.entries(releasedMint)) assert.equal(resolve(`var(${name})`), value, name);
});

test('the four core roles map onto the released Mint tokens', () => {
  assert.equal(resolve('var(--dominant)'), resolve('var(--phosphor)'));
  assert.equal(resolve('var(--default-line)'), resolve('var(--line-2)'));
  assert.equal(resolve('var(--background)'), resolve('var(--panel)'));
  assert.equal(resolve('var(--text-drop)'), resolve('var(--void)'));
  // Mint's writing page is lighter than the canvas; Text Drop stays the darkest surface.
  const luminance = hex => channels(hex).split(',').reduce((sum, c) => sum + Number(c), 0);
  for (const surface of ['--gutter', '--panel', '--page', '--panel-2']) {
    assert.ok(luminance(resolve('var(--text-drop)')) < luminance(resolve(`var(${surface})`)), `${surface} is lighter than Text Drop`);
  }
});

test('channel tokens and the select chevron match their colours', () => {
  assert.equal(theme['--dominant-rgb'].replace(/\s/g, ''), channels(resolve('var(--dominant)')));
  assert.equal(theme['--danger-rgb'].replace(/\s/g, ''), channels(resolve('var(--danger)')));
  assert.equal(theme['--scrim-rgb'].replace(/\s/g, ''), '3,5,4');
  assert.ok(theme['--select-arrow'].includes(`stroke='%23${resolve('var(--dominant)').slice(1)}'`));
});

test('interface styles use theme tokens instead of colour literals', () => {
  // Masks use #000 only as an alpha stencil, and shadows use neutral black; neither is a theme colour.
  const css = appCss.replace(/(?:-webkit-)?mask-image:[^;]+;/g, '').replace(/rgba\(0,\s*0,\s*0,\s*[.\d]+\)/g, '');
  assert.deepEqual(css.match(/#[0-9a-f]{3,8}\b/gi) ?? [], []);
  assert.deepEqual(css.match(/(?:rgba?|hsla?)\((?!var\(--[\w-]+-rgb\))[^)]*\)/gi) ?? [], []);
  assert.deepEqual(css.match(/url\(["']?data:/gi) ?? [], []);
  for (const name of new Set(appCss.match(/var\(--[\w-]+\)/g).map(v => v.slice(4, -1)))) {
    assert.ok(name in theme || tokensCss.includes(`${name}:`) || name === '--page-pad-x', `${name} is a defined token`);
  }
});

test('components carry no inline theme colours', () => {
  const files = [];
  const walk = dir => {
    for (const entry of readdirSync(new URL(`../${dir}`, import.meta.url), { withFileTypes: true })) {
      const path = `${dir}/${entry.name}`;
      if (entry.isDirectory()) walk(path);
      else if (/\.tsx?$/.test(entry.name) && path !== 'src/domain/export.ts') files.push(path);
    }
  };
  // export.ts styles the exported HTML file, which is deliberately theme-independent.
  walk('src');
  for (const path of files) assert.deepEqual(read(path).match(/#[0-9a-f]{6}\b|rgba?\(\s*\d/gi) ?? [], [], path);
});
