import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// fileURLToPath, not URL#pathname: on Windows the latter yields "/C:/..." and breaks join().
const root = fileURLToPath(new URL('..', import.meta.url));
const files = (dir, ext) => readdirSync(join(root, dir)).flatMap(name => {
  // Forward slashes on every OS, so the path comparisons below hold on Windows too.
  const path = `${dir}/${name}`;
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
  // The shared commands moved out of lib.rs, so every file that can mention the metrics module is checked.
  for (const name of ['lib.rs', 'commands.rs', 'standalone.rs']) {
    const lib = readFileSync(join(root, 'src-tauri/src', name), 'utf8').split('\n');
    // Each use sits directly under the feature attribute, or inside a gated block that starts at most four lines above.
    lib.forEach((line, i) => { if (/\bmetrics(::|;)/.test(line)) assert.ok(lib.slice(Math.max(0, i - 4), i).some(l => l.includes('#[cfg(feature = "startup-metrics")]')), `ungated metrics use on ${name} line ${i + 1}`); });
  }
  const metrics = readFileSync(join(root, 'src-tauri/src/metrics.rs'), 'utf8');
  assert.deepEqual(metrics.match(/eprintln!\([^;]*\);/g)?.map(c => c.replace(/\s+/g, '')), ['eprintln!("startup-metrics{milestone}{}ms",start.elapsed().as_millis());']);
});

test('the frontend makes no network requests and loads nothing remote', () => {
  const offenders = [];
  for (const f of files('src', ['.ts', '.tsx', '.css'])) {
    // The SVG namespace inside inline data: images is an identifier, not a request.
    const s = readFileSync(join(root, f), 'utf8').replaceAll('http://www.w3.org/2000/svg', '');
    // The sound manager alone may fetch: it decodes the app's own bundled sound files (checked below).
    const network = f === 'src/audio/soundManager.ts' ? /XMLHttpRequest|WebSocket|EventSource|sendBeacon|https?:\/\/(?!localhost)/ : /\bfetch\s*\(|XMLHttpRequest|WebSocket|EventSource|sendBeacon|https?:\/\/(?!localhost)/;
    if (network.test(s)) offenders.push(f);
  }
  assert.deepEqual(offenders, []);
  // Every sound it can be given is a local file imported from src/assets/sounds.
  const assets = readFileSync(join(root, 'src/audio/sounds.ts'), 'utf8');
  const sources = [...assets.matchAll(/(?:from|glob<string>\()\s*'([^']+)'/g)].map(m => m[1]).filter(p => p.endsWith('.wav'));
  assert.ok(sources.length >= 8);
  for (const source of sources) assert.match(source, /^\.\.\/assets\/sounds\/[\w/*-]+\.wav$/);
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  assert.ok(!/https?:\/\//.test(html), 'index.html references a remote resource');
});

test('runtime dependencies are exactly the reviewed set', () => {
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  assert.deepEqual(Object.keys(pkg.dependencies).sort(), [
    '@fontsource/ibm-plex-mono', '@fontsource/ibm-plex-sans', '@fontsource/ibm-plex-sans-condensed', '@fontsource/ibm-plex-serif', '@fontsource/literata', '@fontsource/orbitron',
    '@tauri-apps/api', '@tiptap/extension-table', '@tiptap/extension-text-align', '@tiptap/extension-text-style', '@tiptap/pm', '@tiptap/react', '@tiptap/starter-kit', 'react', 'react-dom',
  ]);
  const cargo = readFileSync(join(root, 'src-tauri/Cargo.toml'), 'utf8');
  const deps = cargo.split('[dependencies]')[1].split(/\n\[/)[0].match(/^[a-z][\w-]*(?=\s*=)/gm);
  assert.deepEqual(deps.sort(), ['rusqlite', 'serde', 'serde_json', 'tauri', 'tauri-plugin-dialog']);
  assert.ok(!/features\s*=\s*\[[^\]]*"(devtools|http|updater)/.test(cargo), 'tauri network or devtools features enabled');
});
