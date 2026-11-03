import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const files = (dir, ext) => readdirSync(join(root, dir)).flatMap(name => {
  const path = join(dir, name);
  return statSync(join(root, path)).isDirectory() ? files(path, ext) : ext.some(e => name.endsWith(e)) ? [path] : [];
});
/** Rust source without its `#[cfg(test)]` module, i.e. the code that ships. */
const shipped = path => { const s = readFileSync(join(root, path), 'utf8'); const i = s.indexOf('#[cfg(test)]'); return i < 0 ? s : s.slice(0, i); };

test('shipped code never writes logs, so journal content cannot reach them', () => {
  const offenders = [];
  for (const f of files('src', ['.ts', '.tsx'])) if (/\bconsole\.\w+\s*\(/.test(readFileSync(join(root, f), 'utf8'))) offenders.push(f);
  // metrics.rs prints elapsed milliseconds only and is compiled solely with the
  // measurement feature (docs/PERFORMANCE.md); every use of it must be feature-gated.
  for (const f of files('src-tauri/src', ['.rs'])) if (!f.endsWith('metrics.rs') && /\b(println|eprintln|print|eprint|dbg)!\s*\(|\b(log|tracing)::/.test(shipped(f))) offenders.push(f);
  assert.deepEqual(offenders, []);
  const lib = readFileSync(join(root, 'src-tauri/src/lib.rs'), 'utf8').split('\n');
  // Each use sits directly under the feature attribute, or inside a gated block that starts at most four lines above.
  lib.forEach((line, i) => { if (/\bmetrics(::|;)/.test(line)) assert.ok(lib.slice(Math.max(0, i - 4), i).some(l => l.includes('#[cfg(feature = "startup-metrics")]')), `ungated metrics use on lib.rs line ${i + 1}`); });
  const metrics = readFileSync(join(root, 'src-tauri/src/metrics.rs'), 'utf8');
  assert.deepEqual(metrics.match(/eprintln!\([^;]*\);/g)?.map(c => c.replace(/\s+/g, '')), ['eprintln!("startup-metrics{milestone}{}ms",start.elapsed().as_millis());']);
});

test('the frontend makes no network requests and loads nothing remote', () => {
  const offenders = [];
  for (const f of files('src', ['.ts', '.tsx', '.css'])) {
    const s = readFileSync(join(root, f), 'utf8');
    if (/\bfetch\s*\(|XMLHttpRequest|WebSocket|EventSource|sendBeacon|https?:\/\/(?!localhost)/.test(s)) offenders.push(f);
  }
  assert.deepEqual(offenders, []);
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  assert.ok(!/https?:\/\//.test(html), 'index.html references a remote resource');
});

test('runtime dependencies are exactly the reviewed set', () => {
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  assert.deepEqual(Object.keys(pkg.dependencies).sort(), [
    '@fontsource/ibm-plex-mono', '@fontsource/ibm-plex-sans', '@fontsource/ibm-plex-sans-condensed', '@fontsource/ibm-plex-serif', '@fontsource/literata',
    '@tauri-apps/api', '@tiptap/extension-table', '@tiptap/extension-text-align', '@tiptap/extension-text-style', '@tiptap/pm', '@tiptap/react', '@tiptap/starter-kit', 'react', 'react-dom',
  ]);
  const cargo = readFileSync(join(root, 'src-tauri/Cargo.toml'), 'utf8');
  const deps = cargo.split('[dependencies]')[1].split(/\n\[/)[0].match(/^[a-z][\w-]*(?=\s*=)/gm);
  assert.deepEqual(deps.sort(), ['rusqlite', 'serde', 'serde_json', 'tauri', 'tauri-plugin-dialog']);
  assert.ok(!/features\s*=\s*\[[^\]]*"(devtools|http|updater)/.test(cargo), 'tauri network or devtools features enabled');
});
