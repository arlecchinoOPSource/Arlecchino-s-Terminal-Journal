// Fails unless package.json, tauri.conf.json and Cargo.toml share one version,
// and (when given) the release tag is "v" + that version.
// usage: node scripts/check_version.mjs [v1.2.3]
import { readFileSync } from 'node:fs';

const root = new URL('..', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');
export function versions() {
  return {
    'package.json': JSON.parse(read('package.json')).version,
    'src-tauri/tauri.conf.json': JSON.parse(read('src-tauri/tauri.conf.json')).version,
    'src-tauri/Cargo.toml': read('src-tauri/Cargo.toml').match(/^\[package\][^[]*?^version\s*=\s*"([^"]+)"/m)?.[1],
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const found = versions();
  const distinct = new Set(Object.values(found));
  const tag = process.argv[2];
  const problems = [];
  if (distinct.size !== 1 || distinct.has(undefined)) problems.push(`versions differ: ${JSON.stringify(found)}`);
  const [version] = distinct;
  if (tag && tag !== `v${version}`) problems.push(`tag ${tag} does not match version ${version}`);
  if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
  console.log(`version ${version}${tag ? ` matches tag ${tag}` : ''}`);
}
