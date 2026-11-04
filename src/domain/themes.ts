/** Interface colour themes (T-23). Colours live in src/styles/tokens.css under the same ids. */
export const THEMES = [
  { id: 'mint', label: 'Terminal Mint', description: 'Original green phosphor' },
  { id: 'blue', label: 'Blue Monitor', description: 'Cool blue CRT' },
  { id: 'ember', label: 'Ember Orange', description: 'Warm orange glow' },
  { id: 'amber', label: 'Amber Display', description: 'Yellow phosphor monitor' },
] as const;
export type ThemeId = (typeof THEMES)[number]['id'];
export type Theme = (typeof THEMES)[number];

export const DEFAULT_THEME: ThemeId = 'mint';

/** A known theme id, or the default for anything missing or unrecognised. */
export const parseTheme = (value: unknown): ThemeId => THEMES.find(t => t.id === value)?.id ?? DEFAULT_THEME;

/** Themes whose name or description contains the query, in catalogue order. A blank query lists all. */
export function searchThemes(query: string): Theme[] {
  const needle = query.trim().normalize('NFC').toLocaleLowerCase();
  return THEMES.filter(t => `${t.label} ${t.description}`.toLocaleLowerCase().includes(needle));
}
