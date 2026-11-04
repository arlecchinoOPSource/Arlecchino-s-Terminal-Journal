import { DEFAULT_THEME, parseTheme, type ThemeId } from '../domain/themes';

/**
 * The interface theme, kept in the webview's local storage on this device.
 * Reading is synchronous so the theme is applied before the first paint; it is
 * not journal data and is not part of backups. Unavailable storage means Mint.
 */
export interface ThemeRepository {
  load(): ThemeId;
  save(theme: ThemeId): void;
}

const KEY = 'terminal.theme';

export const themeRepository: ThemeRepository = {
  load() {
    try { return parseTheme(localStorage.getItem(KEY)); } catch { return DEFAULT_THEME; }
  },
  save(theme) {
    try { localStorage.setItem(KEY, theme); } catch { /* The theme still applies until Terminal closes. */ }
  },
};

/** Shows the theme on the whole window. */
export const applyTheme = (theme: ThemeId) => { document.documentElement.dataset.theme = theme; };
