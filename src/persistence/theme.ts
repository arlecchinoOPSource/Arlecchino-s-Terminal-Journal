import { DEFAULT_MOTION, parseMotion, type MotionLevel } from '../domain/motion';
import { DEFAULT_THEME, parseTheme, type ThemeId } from '../domain/themes';

/**
 * Appearance settings (theme, motion), kept in the webview's local storage on this
 * device. Reading is synchronous so they apply before the first paint; they are not
 * journal data and are not part of backups. Unavailable storage means the defaults.
 */
export interface LocalSetting<T> {
  load(): T;
  save(value: T): void;
}

function localSetting<T extends string>(key: string, parse: (value: unknown) => T, fallback: T): LocalSetting<T> {
  return {
    load() {
      try { return parse(localStorage.getItem(key)); } catch { return fallback; }
    },
    save(value) {
      try { localStorage.setItem(key, value); } catch { /* Still applies until Terminal closes. */ }
    },
  };
}

export type ThemeRepository = LocalSetting<ThemeId>;
export const themeRepository: ThemeRepository = localSetting('terminal.theme', parseTheme, DEFAULT_THEME);
export const motionRepository: LocalSetting<MotionLevel> = localSetting('terminal.motion', parseMotion, DEFAULT_MOTION);

/** Shows the theme on the whole window. */
export const applyTheme = (theme: ThemeId) => { document.documentElement.dataset.theme = theme; };
/** Sets the chosen motion level; CSS combines it with the OS reduced-motion setting. */
export const applyMotion = (motion: MotionLevel) => { document.documentElement.dataset.motion = motion; };
