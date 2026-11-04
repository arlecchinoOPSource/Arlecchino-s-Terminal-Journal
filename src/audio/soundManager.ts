import { DEFAULT_SOUND, type KeyCue, type KeyboardPack, type SoundEvent, type SoundSettings } from '../domain/sound.ts';

/** Bundled sound files by use. Keyboard packs list several key variants to avoid a machine-gun repeat. */
export interface SoundAssets {
  events: Record<SoundEvent, string>;
  keyboard: Record<Exclude<KeyboardPack, 'silent'>, { key: readonly string[]; space: string; enter: string; backspace: string }>;
}

/** At most this many keystrokes sound at once; the oldest stops first. */
export const KEY_VOICES = 6;
/** The window may stay hidden this long at most while the close sound finishes. */
export const MAX_CLOSE_MS = 6500;

const curve = (percent: number) => (percent / 100) ** 2;

/**
 * The only place Terminal plays sound (T-25). Every call returns at once and never
 * throws: playback, decoding and an unavailable audio device fail silently, so sound
 * can never interrupt writing or saving. Nothing about what is typed is received here
 * beyond the kind of key. The audio context is created on first use, not at launch.
 */
export class SoundManager {
  private settings: SoundSettings = { ...DEFAULT_SOUND };
  private context: AudioContext | null = null;
  private unavailable = false;
  private master: GainNode | null = null;
  private keyboardBus: GainNode | null = null;
  private interfaceBus: GainNode | null = null;
  private readonly buffers = new Map<string, Promise<AudioBuffer | null>>();
  private keyVoices: AudioBufferSourceNode[] = [];
  private readonly eventVoices = new Map<string, AudioBufferSourceNode>();
  private lastKey = -1;

  private readonly assets: SoundAssets;
  private readonly createContext: () => AudioContext | null;
  private readonly load: (url: string) => Promise<ArrayBuffer>;
  private readonly random: () => number;

  constructor(
    assets: SoundAssets,
    createContext: () => AudioContext | null = () => typeof AudioContext === 'undefined' ? null : new AudioContext({ latencyHint: 'interactive' }),
    load: (url: string) => Promise<ArrayBuffer> = url => fetch(url).then(r => { if (!r.ok) throw new Error(r.statusText); return r.arrayBuffer(); }),
    random: () => number = Math.random,
  ) {
    this.assets = assets;
    this.createContext = createContext;
    this.load = load;
    this.random = random;
  }

  /** Applies new settings at once: turning sound off silences everything already playing. */
  configure(next: SoundSettings) {
    this.settings = next;
    if (!next.enabled) this.stopAll();
    else if (next.keyboard === 'silent') this.stopKeys();
    this.applyGains();
    if (next.enabled && this.context) this.preload();
  }

  /** A keystroke that changed the text. */
  playKey(cue: KeyCue) {
    const s = this.settings;
    if (!s.enabled || s.keyboard === 'silent' || s.keyboardVolume === 0) return;
    const pack = this.assets.keyboard[s.keyboard];
    let url: string;
    if (cue === 'key') {
      // A different variant each time, so fast typing does not sound mechanical-identical.
      let index = Math.floor(this.random() * pack.key.length);
      if (index === this.lastKey && pack.key.length > 1) index = (index + 1) % pack.key.length;
      this.lastKey = index;
      url = pack.key[index] ?? pack.space;
    } else url = pack[cue];
    const variation = { rate: 0.97 + this.random() * 0.06, gain: 0.85 + this.random() * 0.15 };
    this.start(url, 'keyboard', variation, source => {
      this.keyVoices.push(source);
      while (this.keyVoices.length > KEY_VOICES) this.stopSource(this.keyVoices.shift());
      source.onended = () => { this.keyVoices = this.keyVoices.filter(v => v !== source); };
    });
  }

  /** An interface event; a repeat of the same event replaces the one still playing. */
  play(event: SoundEvent) {
    const s = this.settings;
    if (!s.enabled || !s[event] || s.interfaceVolume === 0) return;
    this.startEvent(event, this.assets.events[event], 'interface');
  }

  /** Plays a sound from the Sounds panel even while it is switched off, at the chosen volumes. */
  preview(target: SoundEvent | Exclude<KeyboardPack, 'silent'>) {
    const keyboard = target === 'thock' || target === 'clicky';
    const url = keyboard ? this.assets.keyboard[target].key[0] : this.assets.events[target];
    if (!url) return;
    this.startEvent('preview', url, 'preview', curve(this.settings.volume) * curve(keyboard ? this.settings.keyboardVolume : this.settings.interfaceVolume));
  }

  /**
   * Starts the close sound and resolves with how long to keep the app alive for it
   * (0 when it is off or cannot play). The journal must already be saved.
   */
  async playClose(): Promise<number> {
    const s = this.settings;
    if (!s.enabled || !s.close || s.interfaceVolume === 0 || s.volume === 0) return 0;
    const context = this.ensure();
    if (!context) return 0;
    // A slow decode must not hold up closing.
    const buffer = await Promise.race([this.buffer(this.assets.events.close), new Promise<null>(resolve => setTimeout(() => resolve(null), 500))]);
    if (!buffer || context.state !== 'running' || !this.interfaceBus) return 0;
    try {
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(this.interfaceBus);
      source.start();
      return Math.min(MAX_CLOSE_MS, Math.ceil(buffer.duration * 1000));
    } catch { return 0; }
  }

  private ensure(): AudioContext | null {
    if (this.unavailable) return null;
    if (!this.context) {
      try {
        const context = this.createContext();
        if (!context) { this.unavailable = true; return null; }
        this.context = context;
        this.master = context.createGain();
        this.master.connect(context.destination);
        this.keyboardBus = context.createGain();
        this.keyboardBus.connect(this.master);
        this.interfaceBus = context.createGain();
        this.interfaceBus.connect(this.master);
        this.applyGains();
        this.preload();
      } catch { this.unavailable = true; this.context = null; return null; }
    }
    // Contexts start suspended until a user gesture; keystrokes and clicks are gestures.
    if (this.context.state === 'suspended') void this.context.resume().catch(() => {});
    return this.context;
  }

  private applyGains() {
    const s = this.settings;
    const set = (node: GainNode | null, value: number) => { if (node) node.gain.value = value; };
    set(this.master, s.enabled ? curve(s.volume) : 0);
    set(this.keyboardBus, s.keyboard === 'silent' ? 0 : curve(s.keyboardVolume));
    set(this.interfaceBus, curve(s.interfaceVolume));
  }

  /** Decodes what the current settings can play, so the first keystroke is not late. The startup sound waits for T-31. */
  private preload() {
    const s = this.settings;
    if (!s.enabled) return;
    const urls: string[] = [];
    if (s.keyboard !== 'silent') { const p = this.assets.keyboard[s.keyboard]; urls.push(...p.key, p.space, p.enter, p.backspace); }
    for (const event of ['iconMenu', 'typesetting', 'textEdit', 'error', 'close'] as const) if (s[event]) urls.push(this.assets.events[event]);
    for (const url of urls) void this.buffer(url);
  }

  private buffer(url: string): Promise<AudioBuffer | null> {
    const context = this.context;
    if (!context) return Promise.resolve(null);
    let pending = this.buffers.get(url);
    if (!pending) {
      pending = this.load(url).then(data => context.decodeAudioData(data)).catch(() => null);
      this.buffers.set(url, pending);
    }
    return pending;
  }

  private startEvent(key: string, url: string, bus: 'interface' | 'preview', gain = 1) {
    this.start(url, bus, { rate: 1, gain }, source => {
      this.stopSource(this.eventVoices.get(key));
      this.eventVoices.set(key, source);
      source.onended = () => { if (this.eventVoices.get(key) === source) this.eventVoices.delete(key); };
    });
  }

  private start(url: string, bus: 'keyboard' | 'interface' | 'preview', { rate, gain }: { rate: number; gain: number }, track: (source: AudioBufferSourceNode) => void) {
    const context = this.ensure();
    if (!context) return;
    void this.buffer(url).then(buffer => {
      // Settings may have changed while decoding: check again so muting is immediate.
      const s = this.settings;
      const allowed = bus === 'preview' || (s.enabled && (bus !== 'keyboard' || s.keyboard !== 'silent'));
      const output = bus === 'keyboard' ? this.keyboardBus : bus === 'interface' ? this.interfaceBus : context.destination;
      if (!buffer || !allowed || !output) return;
      try {
        const source = context.createBufferSource();
        source.buffer = buffer;
        source.playbackRate.value = rate;
        const level = context.createGain();
        level.gain.value = gain;
        source.connect(level);
        level.connect(output);
        track(source);
        source.start();
      } catch { /* An unplayable sound is skipped. */ }
    });
  }

  private stopSource(source: AudioBufferSourceNode | undefined) {
    try { source?.stop(); } catch { /* Already stopped. */ }
  }
  private stopKeys() { this.keyVoices.forEach(v => this.stopSource(v)); this.keyVoices = []; }
  private stopAll() {
    this.stopKeys();
    this.eventVoices.forEach(v => this.stopSource(v));
    this.eventVoices.clear();
  }
}
