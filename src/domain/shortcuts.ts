/** App-level actions with their own shortcuts; editor formatting shortcuts come from Tiptap. */
export type ShortcutAction = 'new-entry' | 'search' | 'archives' | 'settings';

/** Mod is ⌘ on macOS and Ctrl on Windows. */
const APP_SHORTCUTS: { action: ShortcutAction; key: string; shift?: boolean }[] = [
  { action: 'new-entry', key: 'n' },
  { action: 'search', key: 'k' },
  { action: 'archives', key: 'o' },
  { action: 'settings', key: ',' },
];

export interface KeyLike { key: string; metaKey: boolean; ctrlKey: boolean; altKey: boolean; shiftKey: boolean }

/** The app action for a keydown, or null. Requires exactly the platform modifier (no Alt, no other Mod). */
export function matchShortcut(event: KeyLike, mac: boolean): ShortcutAction | null {
  const mod = mac ? event.metaKey && !event.ctrlKey : event.ctrlKey && !event.metaKey;
  if (!mod || event.altKey) return null;
  const key = event.key.toLowerCase();
  return APP_SHORTCUTS.find(s => s.key === key && Boolean(s.shift) === event.shiftKey)?.action ?? null;
}

export const isMacPlatform = () => typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

/** Human-readable shortcut, e.g. "⌘K" on macOS or "Ctrl+K" on Windows. */
export function shortcutLabel(keys: string, mac: boolean): string {
  return keys.split('+').map(part => {
    if (part === 'Mod') return mac ? '⌘' : 'Ctrl+';
    if (part === 'Shift') return mac ? '⇧' : 'Shift+';
    if (part === 'Alt') return mac ? '⌥' : 'Alt+';
    return part.length === 1 ? part.toUpperCase() : part;
  }).join('');
}

/** aria-keyshortcuts value, e.g. "Meta+K" or "Control+K". */
export const ariaShortcut = (keys: string, mac: boolean) => keys.replace('Mod', mac ? 'Meta' : 'Control');

/** Reference list shown in Settings; each entry lists one or more alternative combinations. */
export const SHORTCUT_HELP: { label: string; keys: string[] }[] = [
  { label: 'New entry', keys: ['Mod+N'] },
  { label: 'Search titles', keys: ['Mod+K'] },
  { label: 'Archives', keys: ['Mod+O'] },
  { label: 'Settings', keys: ['Mod+,'] },
  { label: 'Close panel', keys: ['Escape'] },
  { label: 'Undo / Redo', keys: ['Mod+Z', 'Mod+Shift+Z'] },
  { label: 'Bold / Italic / Underline', keys: ['Mod+B', 'Mod+I', 'Mod+U'] },
  { label: 'Strikethrough', keys: ['Mod+Shift+S'] },
  { label: 'Heading 1–3 / Body', keys: ['Mod+Alt+1–3', 'Mod+Alt+0'] },
  { label: 'Bulleted / Numbered list', keys: ['Mod+Shift+8', 'Mod+Shift+7'] },
  { label: 'Blockquote', keys: ['Mod+Shift+B'] },
  { label: 'Align left / center / right', keys: ['Mod+Shift+L', 'Mod+Shift+E', 'Mod+Shift+R'] },
  { label: 'Next / previous table cell', keys: ['Tab', 'Shift+Tab'] },
];
