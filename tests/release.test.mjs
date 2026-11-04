import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { versions } from '../scripts/check_version.mjs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('package, Tauri and Cargo versions agree', () => {
  assert.equal(new Set(Object.values(versions())).size, 1, JSON.stringify(versions()));
});

test('release workflow builds macOS and Windows only after CI, into a draft release', () => {
  const workflow = read('.github/workflows/release.yml');
  assert.match(workflow, /uses: \.\/\.github\/workflows\/ci\.yml/);
  assert.match(workflow, /needs: checks/);
  assert.match(workflow, /releaseDraft: true/);
  assert.match(workflow, /universal-apple-darwin/);
  assert.match(workflow, /windows-/);
  assert.match(workflow, /check_version\.mjs/);
  assert.match(read('.github/workflows/ci.yml'), /workflow_call:/);
});

test('signing material only comes from repository secrets', () => {
  const workflow = read('.github/workflows/release.yml');
  for (const name of ['APPLE_CERTIFICATE', 'APPLE_CERTIFICATE_PASSWORD', 'APPLE_SIGNING_IDENTITY', 'APPLE_ID', 'APPLE_PASSWORD', 'APPLE_TEAM_ID'])
    assert.match(workflow, new RegExp(`${name}: \\$\\{\\{ secrets\\.${name} \\}\\}`));
  assert.ok(!/-----BEGIN|\.p12\b(?!.*secret)/i.test(workflow.replace(/#.*$/gm, '')));
  const ignored = read('.gitignore');
  for (const pattern of ['*.p12', '*.pfx', '*.key', '*.pem']) assert.ok(ignored.includes(pattern), pattern);
});

test('installers are configured for macOS and Windows with an ad-hoc fallback signature', () => {
  const bundle = JSON.parse(read('src-tauri/tauri.conf.json')).bundle;
  assert.deepEqual(bundle.targets, ['app', 'dmg', 'nsis', 'msi']);
  assert.equal(bundle.macOS.signingIdentity, '-');
  assert.equal(bundle.windows.nsis.installMode, 'currentUser');
  for (const field of ['publisher', 'copyright', 'shortDescription']) assert.ok(bundle[field], field);
});
