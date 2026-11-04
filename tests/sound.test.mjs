import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { DEFAULT_SOUND, keyCue, parseSoundSettings } from '../src/domain/sound.ts';
import { KEY_VOICES, MAX_CLOSE_MS, SoundManager } from '../src/audio/soundManager.ts';

// T-25–T-27: sound settings, key classification and the playback manager, with a stand-in audio context.
const assets = {
  events: { iconMenu: 'icon', typesetting: 'type', textEdit: 'edit', error: 'error', close: 'close', startup: 'startup' },
  keyboard: { thock: { key: ['t1', 't2', 't3'], space: 'tspace', enter: 'tenter', backspace: 'tback' }, clicky: { key: ['c1'], space: 'cspace', enter: 'center', backspace: 'cback' } },
};
function fakeAudio({ state = 'running', duration = 6, failDecode = [] } = {}) {
  const log = { started: [], stopped: [], loads: [], contexts: 0 };
  const gain = () => ({ gain: { value: 1 }, connect() {} });
  const context = {
    state, currentTime: 0, destination: {},
    resume: async () => { context.state = 'running'; },
    createGain: gain,
    decodeAudioData: async data => { if (failDecode.includes(data.url)) throw new Error('bad'); return { url: data.url, duration }; },
    createBufferSource() {
      const source = { buffer: null, playbackRate: { value: 1 }, onended: null, connect() {}, start() { log.started.push(source.buffer.url); }, stop() { log.stopped.push(source.buffer.url); } };
      return source;
    },
  };
  const manager = new SoundManager(assets, () => { log.contexts++; return context; }, async url => { log.loads.push(url); return { url }; }, () => 0);
  return { manager, log, context };
}
const settle = () => new Promise(resolve => setTimeout(resolve, 0));
const on = (patch = {}) => ({ ...DEFAULT_SOUND, enabled: true, ...patch });

test('sound is off by default and missing or invalid settings take safe defaults', () => {
  assert.equal(DEFAULT_SOUND.enabled, false);
  for (const stored of [null, undefined, 'x', 42, [], {}]) assert.deepEqual(parseSoundSettings(stored), DEFAULT_SOUND);
  const parsed = parseSoundSettings({ enabled: true, volume: 250, keyboard: 'loud', keyboardVolume: -5, interfaceVolume: '50', error: 'no', close: false });
  assert.equal(parsed.enabled, true);
  assert.equal(parsed.volume, 100);
  assert.equal(parsed.keyboard, 'thock');
  assert.equal(parsed.keyboardVolume, 0);
  assert.equal(parsed.interfaceVolume, DEFAULT_SOUND.interfaceVolume);
  assert.equal(parsed.error, true);
  assert.equal(parsed.close, false);
});

test('only text-producing keys have a cue, and only the kind of key is kept', () => {
  const k = (key, extra = {}) => keyCue({ key, metaKey: false, ctrlKey: false, isComposing: false, ...extra });
  assert.equal(k('a'), 'key');
  assert.equal(k('é'), 'key');
  assert.equal(k('😀'), 'key');
  assert.equal(k(' '), 'space');
  assert.equal(k('Enter'), 'enter');
  assert.equal(k('Backspace'), 'backspace');
  assert.equal(k('Delete'), 'backspace');
  for (const key of ['Shift', 'Meta', 'Alt', 'ArrowLeft', 'Tab', 'Escape', 'F5', 'Dead', 'Process']) assert.equal(k(key), null, key);
  assert.equal(k('b', { metaKey: true }), null);
  assert.equal(k('b', { ctrlKey: true }), null);
  assert.equal(k('a', { isComposing: true }), null);
});

test('nothing loads or plays while sound is off, and no audio context is created at launch', async () => {
  const { manager, log } = fakeAudio();
  manager.configure(DEFAULT_SOUND);
  manager.playKey('key');
  manager.play('iconMenu');
  assert.equal(await manager.playClose(), 0);
  await settle();
  assert.equal(log.contexts, 0);
  assert.deepEqual(log.started, []);
});

test('playback follows the pack, the per-sound switches and the Silent pack', async () => {
  const { manager, log } = fakeAudio();
  manager.configure(on({ keyboard: 'clicky', typesetting: false }));
  manager.playKey('space');
  manager.playKey('key');
  manager.play('iconMenu');
  manager.play('typesetting');
  await settle();
  assert.deepEqual(log.started.sort(), ['c1', 'cspace', 'icon']);
  manager.configure(on({ keyboard: 'silent' }));
  manager.playKey('key');
  await settle();
  assert.equal(log.started.length, 3);
  // Preloading decodes only what the settings can play, never the startup sound.
  assert.ok(!log.loads.includes('startup'));
});

test('key voices are bounded and repeated events replace each other', async () => {
  const { manager, log } = fakeAudio();
  manager.configure(on());
  for (let i = 0; i < KEY_VOICES + 4; i++) manager.playKey('key');
  for (let i = 0; i < 5; i++) manager.play('error');
  await settle();
  assert.equal(log.started.filter(u => u.startsWith('t')).length - log.stopped.filter(u => u.startsWith('t')).length, KEY_VOICES);
  assert.equal(log.started.filter(u => u === 'error').length - log.stopped.filter(u => u === 'error').length, 1);
});

test('turning sound off silences what is playing at once', async () => {
  const { manager, log } = fakeAudio();
  manager.configure(on());
  manager.playKey('key');
  manager.play('textEdit');
  await settle();
  manager.configure({ ...DEFAULT_SOUND, enabled: false });
  assert.equal(log.stopped.length, 2);
  // A sound still decoding when sound is switched off never starts.
  manager.configure(on());
  manager.play('iconMenu');
  manager.configure({ ...DEFAULT_SOUND, enabled: false });
  await settle();
  assert.ok(!log.started.includes('icon'));
});

test('failures are silent: no context, a failing decode, or a suspended device', async () => {
  const none = new SoundManager(assets, () => null);
  none.configure(on());
  none.playKey('key');
  assert.equal(await none.playClose(), 0);
  const throwing = new SoundManager(assets, () => { throw new Error('no audio device'); });
  throwing.configure(on());
  assert.doesNotThrow(() => { throwing.playKey('key'); throwing.play('error'); });
  const { manager, log } = fakeAudio({ failDecode: ['icon'] });
  manager.configure(on());
  manager.play('iconMenu');
  await settle();
  assert.deepEqual(log.started, []);
  const suspended = fakeAudio({ state: 'suspended' });
  suspended.context.resume = async () => { throw new Error('not allowed'); };
  suspended.manager.configure(on());
  assert.equal(await suspended.manager.playClose(), 0);
});

test('the close sound reports how long to wait, capped', async () => {
  const { manager } = fakeAudio({ duration: 6 });
  manager.configure(on());
  assert.equal(await manager.playClose(), 6000);
  const long = fakeAudio({ duration: 30 });
  long.manager.configure(on());
  assert.equal(await long.manager.playClose(), MAX_CLOSE_MS);
  const off = fakeAudio();
  off.manager.configure(on({ close: false }));
  assert.equal(await off.manager.playClose(), 0);
  const rust = readFileSync(new URL('../src-tauri/src/lib.rs', import.meta.url), 'utf8');
  assert.match(rust, new RegExp(`MAX_CLOSE_SOUND_MS: u64 = ${MAX_CLOSE_MS};`));
});

test('bundled sounds are small 16-bit PCM WAV files and every one is credited', () => {
  const root = new URL('../src/assets/sounds/', import.meta.url);
  const walk = dir => readdirSync(new URL(dir, root), { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(`${dir}${e.name}/`) : [`${dir}${e.name}`]);
  const files = walk('');
  assert.equal(files.length, 25);
  const credits = readFileSync(new URL('../docs/AUDIO-ASSETS-v2.0.md', import.meta.url), 'utf8');
  for (const file of files) {
    const data = readFileSync(new URL(file, root));
    assert.equal(data.toString('ascii', 0, 4), 'RIFF', file);
    assert.equal(data.toString('ascii', 8, 12), 'WAVE', file);
    assert.ok(statSync(new URL(file, root)).size <= (file.startsWith('arlecchino/') ? 1_100_000 : 30_000), file);
    assert.ok(credits.includes(file.replace(/key-\d+\.wav$/, 'key-')), `${file} is listed in AUDIO-ASSETS-v2.0.md`);
  }
});
