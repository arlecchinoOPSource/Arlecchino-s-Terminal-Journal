/** Sound preferences (T-25). Off until the person turns sound on, including after upgrading from 1.0. */
export const KEYBOARD_PACKS = [
  { id: 'silent', label: 'Silent', description: 'No typing sounds' },
  { id: 'thock', label: 'Thock', description: 'Soft, low Cherry keyboard' },
  { id: 'clicky', label: 'Clicky', description: 'Bright vintage keys' },
] as const;
export type KeyboardPack = (typeof KEYBOARD_PACKS)[number]['id'];

/** Sounds with their own on/off switch. Clicks are grouped by where they happen. */
export const SOUND_EVENTS = [
  { id: 'iconMenu', label: 'Icon menus', description: 'Rail buttons and panels' },
  { id: 'typesetting', label: 'Typesetting', description: 'Toolbar, font and spacing' },
  { id: 'textEdit', label: 'Text edit', description: 'Export, delete and dialogs' },
  { id: 'error', label: 'Error', description: 'When something fails' },
  { id: 'close', label: 'Close', description: 'When Terminal closes' },
  { id: 'startup', label: 'Startup', description: 'With the startup screen (coming in a later update)' },
] as const;
export type SoundEvent = (typeof SOUND_EVENTS)[number]['id'];

export interface SoundSettings extends Record<SoundEvent, boolean> {
  enabled: boolean;
  /** Volumes are percentages, 0–100. */
  volume: number;
  keyboard: KeyboardPack;
  keyboardVolume: number;
  interfaceVolume: number;
}

export const DEFAULT_SOUND: Readonly<SoundSettings> = Object.freeze({
  enabled: false, volume: 70, keyboard: 'thock', keyboardVolume: 60, interfaceVolume: 70,
  iconMenu: true, typesetting: true, textEdit: true, error: true, close: true, startup: true,
});

const volume = (value: unknown, fallback: number) => typeof value === 'number' && Number.isFinite(value) ? Math.round(Math.min(100, Math.max(0, value))) : fallback;
const flag = (value: unknown, fallback: boolean) => typeof value === 'boolean' ? value : fallback;

/** Reads stored settings field by field: anything missing or invalid takes its default. */
export function parseSoundSettings(value: unknown): SoundSettings {
  const v = typeof value === 'object' && value !== null ? value as Record<string, unknown> : {};
  const d = DEFAULT_SOUND;
  const events = Object.fromEntries(SOUND_EVENTS.map(e => [e.id, flag(v[e.id], d[e.id])])) as Record<SoundEvent, boolean>;
  return {
    ...events,
    enabled: flag(v.enabled, d.enabled),
    volume: volume(v.volume, d.volume),
    keyboard: KEYBOARD_PACKS.find(p => p.id === v.keyboard)?.id ?? d.keyboard,
    keyboardVolume: volume(v.keyboardVolume, d.keyboardVolume),
    interfaceVolume: volume(v.interfaceVolume, d.interfaceVolume),
  };
}

/** What a keystroke may sound like. Only the kind of key is kept, never the character. */
export type KeyCue = 'key' | 'space' | 'enter' | 'backspace';
export interface KeyLike { key: string; metaKey: boolean; ctrlKey: boolean; isComposing: boolean }

/** The cue for a keydown that may insert or delete text, or null for shortcuts, modifiers, navigation and IME composition. */
export function keyCue(event: KeyLike): KeyCue | null {
  if (event.isComposing || event.metaKey || event.ctrlKey) return null;
  if (event.key === 'Enter') return 'enter';
  if (event.key === 'Backspace' || event.key === 'Delete') return 'backspace';
  if (event.key === ' ') return 'space';
  return [...event.key].length === 1 ? 'key' : null;
}

/** Click regions, marked in the interface with data-sound. */
export const CLICK_REGIONS = { 'icon-menu': 'iconMenu', typesetting: 'typesetting', 'text-edit': 'textEdit' } as const satisfies Record<string, SoundEvent>;
export type ClickRegion = keyof typeof CLICK_REGIONS;
export const isClickRegion = (value: unknown): value is ClickRegion => typeof value === 'string' && Object.hasOwn(CLICK_REGIONS, value);
