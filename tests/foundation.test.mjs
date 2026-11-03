import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('native shell grants no filesystem, shell, or network capabilities', () => {
  const capability = JSON.parse(readFileSync(new URL('../src-tauri/capabilities/default.json', import.meta.url)));
  assert.deepEqual(capability.permissions, []);
  assert.deepEqual(capability.windows, ['main']);
});

test('production policy excludes remote scripts and connections', () => {
  const config = JSON.parse(readFileSync(new URL('../src-tauri/tauri.conf.json', import.meta.url)));
  assert.ok(config.app.security.csp.includes("script-src 'self'"));
  assert.ok(config.app.security.csp.includes('connect-src ipc: http://ipc.localhost;'));
  assert.ok(!config.app.security.csp.includes('https:'));
});
