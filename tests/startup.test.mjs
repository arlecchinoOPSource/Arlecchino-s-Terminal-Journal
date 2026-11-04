import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { STARTUP_EXIT_MS, STARTUP_SEQUENCE_MS, STARTUP_SLOW_MS, STARTUP_TIMEOUT_MS, parseStartupScreen, startupLeaves, startupMessage } from '../src/domain/startup.ts';
import { DEFAULT_SOUND } from '../src/domain/sound.ts';
import { SoundManager } from '../src/audio/soundManager.ts';

// T-31/T-32: when the startup screen leaves, what it says, and the startup sound.
test('the screen leaves on real readiness, at once on error, and never stays past the timeout', () => {
  // Without animation, only readiness matters: no minimum display time.
  assert.equal(startupLeaves('ready', 0, false, false), true);
  assert.equal(startupLeaves('starting', 5000, false, false), false);
  // With animation, the sequence runs while the journal opens; readiness is still required.
  assert.equal(startupLeaves('ready', STARTUP_SEQUENCE_MS - 1, true, false), false);
  assert.equal(startupLeaves('ready', STARTUP_SEQUENCE_MS, true, false), true);
  assert.equal(startupLeaves('starting', STARTUP_SEQUENCE_MS * 2, true, false), false);
  // Errors and skips leave immediately so the editor or the error is shown.
  assert.equal(startupLeaves('error', 0, true, false), true);
  assert.equal(startupLeaves('starting', 0, true, true), true);
  // Nothing keeps it forever.
  assert.equal(startupLeaves('starting', STARTUP_TIMEOUT_MS, true, false), true);
  assert.equal(startupLeaves('starting', STARTUP_TIMEOUT_MS, false, false), true);
});

test('status text reports what is happening, never a percentage', () => {
  assert.equal(startupMessage('starting', 0), 'OPENING JOURNAL');
  assert.equal(startupMessage('starting', STARTUP_SLOW_MS), 'STILL OPENING THE JOURNAL');
  assert.equal(startupMessage('ready', 0), 'READY');
  assert.equal(startupMessage('error', 0), 'JOURNAL UNAVAILABLE');
  for (const r of ['starting', 'ready', 'error']) for (const t of [0, 3000, 9000]) assert.doesNotMatch(startupMessage(r, t), /\d|%/);
});

test('the startup screen setting defaults to on and accepts only on or off', () => {
  for (const v of [null, undefined, '', 'yes', 1]) assert.equal(parseStartupScreen(v), 'on');
  assert.equal(parseStartupScreen('off'), 'off');
});

test('CSS timings match the startup rules', () => {
  const tokens = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8');
  assert.match(tokens, new RegExp(`--motion-startup: ${STARTUP_SEQUENCE_MS / 1000}s;`));
  assert.match(tokens, new RegExp(`--motion-startup-exit: ${STARTUP_EXIT_MS}ms;`));
});

function fake(state = 'running') {
  const started = [];
  const context = {
    state, destination: {},
    resume: async () => { if (state === 'running') context.state = 'running'; else throw new Error('needs a gesture'); },
    createGain: () => ({ gain: { value: 1 }, connect() {} }),
    decodeAudioData: async data => ({ url: data.url, duration: 6 }),
    createBufferSource() { const s = { buffer: null, connect() {}, start() { started.push(s.buffer.url); }, stop() {} }; return s; },
  };
  const assets = { events: { iconMenu: 'i', typesetting: 't', textEdit: 'e', error: 'x', close: 'c', startup: 'startup' }, keyboard: { thock: { key: ['k'], space: 's', enter: 'n', backspace: 'b' }, clicky: { key: ['k'], space: 's', enter: 'n', backspace: 'b' } } };
  return { manager: new SoundManager(assets, () => context, async url => ({ url })), started };
}

test('the startup sound plays at most once per launch and follows the settings', async () => {
  const { manager, started } = fake();
  manager.configure({ ...DEFAULT_SOUND, enabled: true });
  assert.equal(await manager.playStartup(), true);
  assert.equal(await manager.playStartup(), false);
  assert.deepEqual(started, ['startup']);
  for (const settings of [DEFAULT_SOUND, { ...DEFAULT_SOUND, enabled: true, startup: false }, { ...DEFAULT_SOUND, enabled: true, volume: 0 }]) {
    const f = fake();
    f.manager.configure(settings);
    assert.equal(await f.manager.playStartup(), false);
    assert.deepEqual(f.started, []);
  }
});

test('a suspended audio device skips the startup sound instead of playing it late', async () => {
  const { manager, started } = fake('suspended');
  manager.configure({ ...DEFAULT_SOUND, enabled: true });
  assert.equal(await manager.playStartup(), false);
  assert.deepEqual(started, []);
});
