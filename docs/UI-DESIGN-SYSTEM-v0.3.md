# TERMINAL — Visual Design System

**Design version:** 0.3 — "Terminal 84"
**Approved scope:** Implemented on November 4, 2026, at the product owner's request ("make the UI sleeker, more user-friendly and better looking; stay true to the retro-futuristic vibe; the colour palette may change")
**References:** Four retro-futuristic "84" boot screens supplied by the product owner (framed dark panels, wide striped display lettering, thin loading bars, a single neon hue per screen)

This version supersedes [v0.2](UI-DESIGN-SYSTEM-v0.2.md). It changes presentation only: product scope, layout order, data behaviour, privacy boundaries and architecture are unchanged.

## 1. Direction

A night-shift CRT console: deep blue-black glass, one phosphor-cyan signal colour, thin framed panels, and a wide striped wordmark. The chrome carries the retro character; the writing page stays calm and highly legible.

### What was taken from the references

| Adopted | How |
| --- | --- |
| Wide, heavy display lettering with horizontal cuts | `TERMINAL` wordmark in Orbitron Black, phosphor gradient, lower half cut into stripes, soft glow |
| Framed panels with an inner rule | Rail, header, panels and dialogs use a 1px frame plus an inset hairline, a soft phosphor bloom, and glowing corner brackets (header, rail, Search, Archives, dialogs) |
| CRT texture | Visible scanlines and a vignette on the canvas; fainter scanlines under chrome panels and in the gutter beside the page |
| Thin framed loading bar | The segmented save indicator in the status bar (state only — never fake progress) |
| `>` prompt lines | `> personal journal` with a blinking block caret in the header |
| One neon hue on near-black | Phosphor cyan `#4FF0D0`; amber and rose only for attention and failure |

### What was deliberately left out

Fake surveillance or telemetry messages, brand parodies, "premium"/payment copy, Japanese subtitles, chromatic aberration, multi-colour gradients, glow or scanlines on the writing page, and any network or security claims.

## 2. Colour tokens (`src/styles/tokens.css`)

| Token | Value | Use |
| --- | --- | --- |
| `--void` | `#04070A` | Window canvas |
| `--gutter` | `#060B0E` | Space beside the writing page |
| `--panel` | `#0A1116` | Rail, header, toolbar, status bar, panels |
| `--page` | `#0C151A` | Writing page |
| `--panel-2` | `#0F1A20` | Inputs, hover, raised |
| `--tint` | `#11292A` | Accent-tinted selection background |
| `--line` / `--line-2` | `#18292F` / `#24464C` | Quiet rules / frames |
| `--line-3` | `#3F7A7E` | Control borders (≥3:1 against their background) |
| `--text` / `--text-2` / `--muted` | `#DDEFEA` / `#9FBDB6` / `#7A9B95` | Primary, secondary and meta text |
| `--phosphor` | `#4FF0D0` | Accent: active state, focus of attention, wordmark |
| `--phosphor-hi` / `--phosphor-lo` | `#A6FFEE` / `#148E80` | Gradient highlight and foot, dim accent |
| `--amber` | `#FFB648` | Unsaved changes and saving |
| `--danger` | `#FF6B78` | Failures and destructive actions |
| `--focus` | `#B9FFF1` | Keyboard focus rings |

Measured contrast (WCAG): primary text 14.8–16.9:1, secondary 8.8–10:1, meta 5.9–6.7:1, accent 12.4–14.1:1, amber ≥10:1, danger ≥6.4:1 on every surface. Control borders 3.6–3.9:1.

## 3. Typography

- **Display — Orbitron** (OFL-1.1, Bold 700 and Black 900, bundled locally): wordmark, brand mark, panel titles, dialog titles and settings section labels. Uppercase, tracked, never for body text.
- **Interface — IBM Plex Mono**: labels, toolbar captions, metadata, status, shortcuts.
- **Writing — the person's chosen font** (IBM Plex Sans by default; Plex Serif, Literata, Plex Mono). Title 32px, body 17px/1.65 by default, set in Settings.

## 4. Layout and components

- **Density**: compact — 6px gaps between regions, 44px header, 42px toolbar with 30px buttons, 28px status bar, 20/44px page padding, 28px title.
- **Rail** (72px): brand mark, then Search, Archive, New with visible captions, Settings at the bottom. The open panel's button shows a phosphor bar and tint. Captions hide below 520px.
- **Header**: striped wordmark left, `> personal journal` prompt right (hidden below 760px).
- **Toolbar**: one row at common window sizes; groups separated by hairlines; undo/redo pinned right. Active formatting uses a tint, phosphor ink and an inset bar. Below 520px it becomes one horizontally scrollable row.
- **Writing page**: the chosen writing width plus padding, on a dark gutter, with a thin phosphor line along its top edge. Entry header row: `ENTRY` chip, number, created date, rule, then Export and Delete as compact ghost buttons (icon-only below 520px, names kept for assistive technology).
- **Status bar**: framed save meter — full phosphor when saved, amber when unsaved, a moving amber segment while saving (static under reduced motion), rose on failure — plus the status text.
- **Panels**: framed, with a sticky title bar in Orbitron. Search and Archives open centred over a dimmed window; Settings opens beside its rail button. Selected rows use the tint, a phosphor border and accent title.
- **Dialogs**: same frame; destructive buttons in rose; Cancel remains the default.
- **Corners**: 3px radius on frames and controls — square in character, softened slightly.
- **Scrollbars**: thin, line-coloured.

## 5. Motion

Only state changes animate: 120–300ms colour and border transitions, the header caret blink, the saving sweep, and a single 1.1s "power-on" flicker of the wordmark at launch. `prefers-reduced-motion` disables all of them.

## 6. Accessibility

Accessible names, keyboard order, shortcuts and focus behaviour from T-14 are unchanged. Every focus ring is visible on every surface. Status is conveyed by text as well as colour.

## 7. Verification

See [VALIDATION-UI-V03.md](VALIDATION-UI-V03.md).
