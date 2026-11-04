import { SoundManager, type SoundAssets } from './soundManager';
import iconMenu from '../assets/sounds/ui/icon-menu.wav';
import typesetting from '../assets/sounds/ui/typesetting.wav';
import textEdit from '../assets/sounds/ui/text-edit.wav';
import error from '../assets/sounds/arlecchino/error.wav';
import close from '../assets/sounds/arlecchino/close.wav';
import startup from '../assets/sounds/arlecchino/startup.wav';

// Bundled with the app and loaded from it; nothing is downloaded at runtime.
// Sources and licences: docs/AUDIO-ASSETS-v2.0.md.
const keys = (files: Record<string, string>) => Object.keys(files).sort().map(name => files[name]!);
const pack = (name: 'thock' | 'clicky', files: Record<string, string>) => {
  const url = (file: string) => files[`../assets/sounds/keys/${name}/${file}.wav`]!;
  return { key: keys(Object.fromEntries(Object.entries(files).filter(([path]) => /\/key-\d+\.wav$/.test(path)))), space: url('space'), enter: url('enter'), backspace: url('backspace') };
};

export const SOUND_ASSETS: SoundAssets = {
  events: { iconMenu, typesetting, textEdit, error, close, startup },
  keyboard: {
    thock: pack('thock', import.meta.glob<string>('../assets/sounds/keys/thock/*.wav', { query: '?url', import: 'default', eager: true })),
    clicky: pack('clicky', import.meta.glob<string>('../assets/sounds/keys/clicky/*.wav', { query: '?url', import: 'default', eager: true })),
  },
};

/** The app's single sound manager. */
export const sounds = new SoundManager(SOUND_ASSETS);
