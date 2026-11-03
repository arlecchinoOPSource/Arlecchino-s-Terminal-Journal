/** Editor preferences. Allowed values must match src-tauri/src/preferences.rs. */
export interface Preferences {
  font: WritingFont;
  font_size: number;
  writing_width: number;
  /** Hundredths: 165 means a line height of 1.65. */
  line_spacing: number;
}

export const WRITING_FONTS = [
  { id: 'plex-sans', label: 'IBM Plex Sans', css: "'IBM Plex Sans', sans-serif" },
  { id: 'plex-serif', label: 'IBM Plex Serif', css: "'IBM Plex Serif', serif" },
  { id: 'literata', label: 'Literata', css: "'Literata', serif" },
  { id: 'plex-mono', label: 'IBM Plex Mono', css: "'IBM Plex Mono', monospace" },
] as const;
export type WritingFont = (typeof WRITING_FONTS)[number]['id'];
export const FONT_SIZE_RANGE = { min: 14, max: 22 } as const;
export const WRITING_WIDTHS = [
  { value: 560, label: 'Narrow' },
  { value: 640, label: 'Medium' },
  { value: 720, label: 'Wide' },
  { value: 840, label: 'Extra wide' },
] as const;
export const LINE_SPACINGS = [
  { value: 140, label: 'Compact' },
  { value: 165, label: 'Comfortable' },
  { value: 180, label: 'Relaxed' },
  { value: 200, label: 'Double' },
] as const;

export const DEFAULT_PREFERENCES: Readonly<Preferences> = Object.freeze({ font: 'plex-sans', font_size: 17, writing_width: 720, line_spacing: 165 });

/** Accepts only a complete, allowed preference set; anything else yields null. */
export function parsePreferences(value: unknown): Preferences | null {
  if (typeof value !== 'object' || value === null) return null;
  const v = value as Record<string, unknown>;
  const keys = Object.keys(v).sort().join();
  if (keys !== 'font,font_size,line_spacing,writing_width') return null;
  const ok = WRITING_FONTS.some(f => f.id === v.font)
    && Number.isInteger(v.font_size) && (v.font_size as number) >= FONT_SIZE_RANGE.min && (v.font_size as number) <= FONT_SIZE_RANGE.max
    && WRITING_WIDTHS.some(w => w.value === v.writing_width)
    && LINE_SPACINGS.some(l => l.value === v.line_spacing);
  return ok ? { font: v.font as WritingFont, font_size: v.font_size as number, writing_width: v.writing_width as number, line_spacing: v.line_spacing as number } : null;
}

/** CSS custom properties that apply the preferences to the writing column. */
export function preferenceStyles(p: Preferences): Record<string, string> {
  return {
    '--entry-font': WRITING_FONTS.find(f => f.id === p.font)?.css ?? WRITING_FONTS[0].css,
    '--entry-size': `${p.font_size}px`,
    '--entry-line-height': String(p.line_spacing / 100),
    '--writing-width': `${p.writing_width}px`,
  };
}
