import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

// T-22: the theme contract in tokens.css and its use by the interface styles.
const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const stripComments = css => css.replace(/\/\*[\s\S]*?\*\//g, '');
const tokensCss = stripComments(read('src/styles/tokens.css'));
const appCss = stripComments(read('src/styles/app.css'));

/** Custom properties declared in the block whose selector list starts with `selector`. */
function block(selector) {
  const escaped = selector.replace(/[[\]'().*]/g, c => `\\${c}`);
  const found = tokensCss.match(new RegExp(`(?:^|[};])\\s*${escaped}[^{]*\\{([^}]*)\\}`));
  assert.ok(found, `tokens.css declares ${selector}`);
  const tokens = {};
  for (const [, name, value] of found[1].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) tokens[name] = value.trim();
  return tokens;
}
const mintBlock = block(':root');
const themeTokens = id => id === 'mint' ? mintBlock : { ...mintBlock, ...block(`[data-theme='${id}']`) };
let theme = mintBlock;
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
    assert.ok(name in theme || tokensCss.includes(`${name}:`) || ['--page-pad-x', '--segment'].includes(name), `${name} is a defined token`);
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

// T-23/T-24: every theme in the catalogue has a complete, readable palette.
const { THEMES, parseTheme, searchThemes } = await import('../src/domain/themes.ts');
const aliases = new Set(['--void', '--panel', '--line-2', '--phosphor', '--glow']);
const themed = Object.keys(mintBlock).filter(name => !aliases.has(name));

test('every theme in the catalogue sets every themed token', () => {
  assert.deepEqual(THEMES.map(t => t.id), ['mint', 'blue', 'ember', 'amber']);
  const declared = [...tokensCss.matchAll(/\[data-theme='([\w-]+)'\]/g)].map(m => m[1]);
  assert.deepEqual([...new Set(declared)].sort(), THEMES.map(t => t.id).sort());
  for (const { id } of THEMES.filter(t => t.id !== 'mint')) {
    assert.deepEqual(Object.keys(block(`[data-theme='${id}']`)).sort(), themed.sort(), id);
  }
});

const luminance = hex => channels(hex).split(',').map(c => c / 255).map(c => c <= .03928 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4).reduce((sum, c, i) => sum + c * [.2126, .7152, .0722][i], 0);
const contrast = (a, b) => { const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p); return (x + .05) / (y + .05); };

for (const { id, label } of THEMES) {
  test(`${label}: channels, chevron and WCAG AA contrast`, () => {
    theme = themeTokens(id);
    try {
      assert.equal(theme['--dominant-rgb'].replace(/\s/g, ''), channels(resolve('var(--dominant)')));
      assert.equal(theme['--danger-rgb'].replace(/\s/g, ''), channels(resolve('var(--danger)')));
      assert.ok(theme['--select-arrow'].includes(`stroke='%23${resolve('var(--dominant)').slice(1)}'`));
      const failures = [];
      const need = (fg, bg, min) => { const r = contrast(resolve(`var(${fg})`), resolve(`var(${bg})`)); if (r < min) failures.push(`${fg} on ${bg} ${r.toFixed(2)} < ${min}`); };
      const surfaces = ['--void', '--gutter', '--panel', '--page', '--panel-2', '--tint'];
      for (const ink of ['--text-strong', '--text', '--text-2', '--muted', '--phosphor', '--phosphor-hi', '--amber', '--danger']) for (const bg of surfaces) need(ink, bg, 4.5);
      for (const bg of surfaces) need('--focus', bg, 3);
      for (const bg of ['--void', '--panel', '--panel-2']) need('--line-3', bg, 3);
      need('--void', '--phosphor', 4.5); // text selection
      // Attention, failure and the accent must not be the same colour.
      assert.notEqual(resolve('var(--amber)'), resolve('var(--dominant)'));
      assert.notEqual(resolve('var(--danger)'), resolve('var(--dominant)'));
      assert.deepEqual(failures, []);
    } finally { theme = mintBlock; }
  });
}

test('theme ids and search', () => {
  assert.equal(parseTheme('ember'), 'ember');
  for (const bad of [null, undefined, '', 'MINT', 'neon', 42, {}]) assert.equal(parseTheme(bad), 'mint');
  assert.equal(searchThemes('').length, 4);
  assert.deepEqual(searchThemes('  CRT ').map(t => t.id), ['blue']);
  assert.deepEqual(searchThemes('phosphor').map(t => t.id), ['mint', 'amber']);
  assert.deepEqual(searchThemes('purple'), []);
});
