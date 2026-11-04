import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('native shell grants no filesystem, shell, or network capabilities', () => {
  const capability = JSON.parse(readFileSync(new URL('../src-tauri/capabilities/default.json', import.meta.url)));
  assert.deepEqual(capability.permissions, ['allow-journal-list','allow-journal-last','allow-journal-select','allow-journal-save','allow-journal-delete','allow-journal-finish-exit','allow-preferences-get','allow-preferences-set','allow-backup-export','allow-backup-choose','allow-backup-restore','allow-backup-cancel','allow-entry-export','core:event:allow-listen','core:event:allow-unlisten']);
  assert.deepEqual(capability.windows, ['main']);
});

test('production policy excludes remote scripts and connections', () => {
  const config = JSON.parse(readFileSync(new URL('../src-tauri/tauri.conf.json', import.meta.url)));
  assert.ok(config.app.security.csp.includes("script-src 'self'"));
  // 'self' lets Web Audio fetch the bundled sound files; no external host is allowed.
  assert.ok(config.app.security.csp.includes("connect-src 'self' ipc: http://ipc.localhost;"));
  assert.ok(!/connect-src[^;]*(http:\/\/(?!ipc\.localhost)|\*)/.test(config.app.security.csp));
  assert.ok(!config.app.security.csp.includes('https:'));
});
