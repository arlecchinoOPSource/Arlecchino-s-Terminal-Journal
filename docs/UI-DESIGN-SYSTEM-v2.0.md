# Terminal 2.0 — sensory design extension

Status: accepted target for future implementation, November 4, 2026. This extends [Terminal 84 v0.3](UI-DESIGN-SYSTEM-v0.3.md) only within the four features in the [2.0 specification](TERMINAL_V2_SPEC.md). It is not an implemented redesign.

## Preserve the released foundation

Keep the rail order (Search, Archives, Themes, Sounds, New entry, Settings below; Themes and Sounds added by the product owner on November 4, 2026), dominant right writing field, Orbitron display lettering, IBM Plex Mono interface labels, and chosen writing fonts. Writing stays free of scanlines, glow, grids, and decorative overlays. All themes share the same layout, typography, controls, and motion behaviour.

## Theme contract

Available themes: Terminal Mint (default), Blue Monitor, Ember Orange, Amber Display. Theme choices apply to interface colours, never rewrite user-authored rich-text formatting. Derived tokens cover readable text, muted labels, focus, hover, active/disabled state, attention, errors, and glow.

The four requested core roles are Dominant, Default Line, Background, and Text Drop. T-22 established their semantic mapping from the actual released CSS (below). Do not replace Mint with approximate colours from a screenshot or a proposed palette.

Released Mint source: `src/styles/tokens.css` at `v1.0.0` (`7071143`). Examples to preserve:

| Role / current token | Released value |
| --- | --- |
| Dominant / `--phosphor` | `#52F0BE` |
| Frames / `--line-2` | `#284239` |
| Control outlines / `--line-3` | `#43786A` |
| Chrome / `--panel` | `#0B0F0D` |
| Writing page / `--page` | `#0D1210` |
| Canvas / `--void` | `#050706` |
| Gutter / `--gutter` | `#070908` |
| Primary text / `--text` | `#E0EFE8` |
| Attention / `--amber` | `#FFB648` |
| Failure / `--danger` | `#FF6B78` |
| Focus / `--focus` | `#C2FFE9` |

The conceptual Text Drop role describes a recessed writing surface, but in the released Mint CSS the writing page is lighter than the canvas. Preserve that measured baseline rather than darkening Mint to force a new role name. The resolved aliases are recorded below. Other palettes are implementation proposals until contrast and theme/state coverage pass T-24.

### Themes panel (T-23)

At the product owner's request (November 4, 2026), themes are chosen from their own rail button, **Themes**, between Archives and New entry, not from Settings. Its icon is a monitor with a half-lit disc. The panel opens centred over a dimmed window like Search and Archives: a search field filters themes by name or description, Arrow/Home/End move the highlight, and Enter or a click applies the theme at once. The panel stays open so themes can be compared, and Escape returns focus. Each row shows a three-bar swatch (Background, Default Line, Dominant), drawn from the theme's own tokens through a scoped `data-theme`, and marks the theme in use with ▶ and "in use".

The choice is applied with `data-theme` on `<html>` before React renders, so the interface never appears in the wrong theme. It is stored in the webview's local storage (`terminal.theme`), not in the journal database or backups; a missing, unknown, or unreadable value means Terminal Mint.

| Theme | Dominant | Background | Text Drop | Attention | Failure |
| --- | --- | --- | --- | --- | --- |
| Terminal Mint | `#52F0BE` | `#0B0F0D` | `#050706` | `#FFB648` | `#FF6B78` |
| Blue Monitor | `#4FC3FF` | `#0B0D0F` | `#050607` | `#FFB648` | `#FF6B78` |
| Ember Orange | `#FF8A3D` | `#0F0D0B` | `#070605` | `#7FD8FF` | `#FF6B9A` |
| Amber Display | `#FFC93C` | `#0F0E0B` | `#070605` | `#7FD8FF` | `#FF6B9A` |

The other themes keep Mint's saturation and lightness for every surface, line, and ink token at their own hue. Two control-border tokens were raised to reach 3:1. In the warm themes, attention uses cyan and failure uses rose, so that neither matches the accent.

### Semantic token mapping (T-22)

`src/styles/tokens.css` holds one theme block. It declares the four core roles, and every other themed token either aliases a role or is a derived value for that theme. `src/styles/app.css` uses tokens only; `tests/theme-tokens.test.mjs` fails on a colour literal there or in a component, and pins every Mint value to v1.0.0.

| Spec role | Token | Mint | Component-facing alias | Used for |
| --- | --- | --- | --- | --- |
| Dominant | `--dominant` | `#52F0BE` | `--phosphor` | wordmark, active controls, caret, markers, corner brackets, segments |
| Default Line | `--default-line` | `#284239` | `--line-2` | frames, dividers, scrollbar thumb |
| Background | `--background` | `#0B0F0D` | `--panel` | rail, header, toolbar, status bar, panels, dialogs |
| Text Drop | `--text-drop` | `#050706` | `--void` | window canvas and recessed fields (search field, segmented controls) |

Derived tokens each theme must define:

| Group | Tokens (Mint value) |
| --- | --- |
| Surfaces | `--gutter` `#070908`, `--page` `#0D1210`, `--panel-2` `#121815` (raised, hover), `--tint` `#10261E` (selected), `--shell-bloom` `#0E1C17` |
| Lines | `--line` `#1A2420` (quiet rules), `--line-3` `#43786A` (control borders, 3:1) |
| Ink | `--text-strong` `#F3FBF7`, `--text` `#E0EFE8`, `--text-2` `#A2BDB1`, `--muted` `#7E9A8E` |
| Accent states | `--phosphor-hi` `#B4FFE4`, `--phosphor-lo` `#16906C`, `--focus` `#C2FFE9`, `--glow` (Dominant at 32%) |
| Signals | `--amber` `#FFB648` (attention), `--danger` `#FF6B78` (failure) |
| Alpha channels | `--dominant-rgb` `82, 240, 190`, `--danger-rgb` `255, 107, 120`, `--scrim-rgb` `3, 5, 4` |
| Assets | `--select-arrow`: the select chevron as a data URI stroked in Dominant; a data URI cannot read custom properties, so each theme supplies its own |

Alpha tints use `rgba(var(--dominant-rgb), a)`. The comma (legacy) form is deliberate: Chromium rounds legacy `rgba()` alpha to 8 bits but keeps `rgb(r g b / a)` alpha exact, so the modern form shifted Mint by 1/255 across the shell.

**Surface difference.** The spec describes Text Drop as the darkest surface and the main writing area. In Mint the writing page (`--page`) is lighter than the canvas, gutter, and chrome. Text Drop therefore maps to the darkest measured surface, `--void`, which already serves the recessed fields; the writing page remains its own derived token, `--page`. Mint is not darkened to make the names line up. Other themes may set `--page` closer to Text Drop, subject to T-24 contrast checks.

**Deliberately not themed.** Neutral black shadows and vignette (`rgba(0, 0, 0, a)`), the `#000` alpha stencils in masks, `color-scheme: dark`, and the HTML export stylesheet in `src/domain/export.ts`, which stays print-neutral for every theme. Journal documents store no colours, so a theme cannot rewrite them.

**Left for T-23/T-24.** The search field's native clear button is tinted with `hue-rotate(120deg)`, which is tuned to Mint. Neither `index.html` nor the native window sets a background colour, so restoring a non-default theme without a flash belongs to T-23.

## Sounds

Optional, local, centrally managed, and immediately muteable. Existing 1.0 users upgrade silently until enabling sound. Playback follows actual text input or actual action outcomes; do not sound every raw key event. Respect IME and accessibility input. Asset provenance and redistribution rights are release gates; see [the asset record](AUDIO-ASSETS-v2.0.md).

### Sounds panel (T-25–T-27)

At the product owner's request (November 4, 2026), sound has its own rail button, **Sounds** (a speaker with two waves), between Themes and New entry. It opens a centred panel like Archives:

- **Sound** switch (off by default for everyone, including people upgrading from 1.0) and **Master volume**.
- **Keyboard**: Silent, Thock (soft Cherry KC 1000) or Clicky (bright vintage keys), each with ▶ preview, and **Typing volume**. Choosing a pack previews it.
- **Interface**: switches with ▶ preview for Icon menus, Typesetting, Text edit, Error, Close and Startup, and **Interface volume**.
- Previews play even while sound is off, so a sound can be heard before switching it on.

| Sound | Plays when | Source |
| --- | --- | --- |
| Icon menus | a rail button, panel row (archive, search result, theme) or panel close button is clicked | Kenney `switch_002` |
| Typesetting | a toolbar control (font, size, style, formatting, alignment, table, undo/redo) or a Settings writing control is used | Kenney `tick_002` |
| Text edit | Export, Delete, dialog buttons, notices, Retry, backup and restore are clicked | Kenney `click1` |
| Keyboard | a keystroke changes the title or body: separate samples for letters (random variants), space, return and delete | Thock or Clicky pack |
| Error | a save, export, backup or restore fails, once as the failure appears | Arlecchino |
| Close | Terminal closes after the journal is saved; the window hides at once and the app exits when the sound ends (at most 6.5 s) | Arlecchino |
| Startup | not yet; the startup screen (T-31) will play it | Arlecchino |

Clicks are classified by the region of the interface (`data-sound` on the rail, panels, toolbar and writing area), not per component. Keyboard shortcuts, modifiers, navigation keys, paste, undo and toolbar formatting are silent; IME input sounds once when committed. Only the kind of key is known to the sound code; no text is recorded.

## Motion

Mechanical, segmented, precise feedback. Centralize timing: button feedback 60–120 ms, control state 100–160 ms, popovers 120–200 ms, dialogs 140–220 ms as starting ranges. Prefer CSS and transform/opacity. OS reduced motion takes precedence over enabling full effects in the app. Never delay typing/saving or animate journal text.

### Motion tokens and patterns (T-28, T-29)

Every duration in `app.css` comes from `src/styles/tokens.css`, and `tests/motion.test.mjs` fails on a literal. Motion is CSS only, with no library.

| Token | Value | Used for |
| --- | --- | --- |
| `--motion-press` | 80 ms | two-step press highlight |
| `--motion-state` | 130 ms | hover and selection colour changes, active-control flash |
| `--motion-popover` | 160 ms | Search, Archives, Themes, Settings reveal and scrim fade |
| `--motion-dialog` | 180 ms | confirmation dialog reveal and backdrop fade |
| `--motion-status` | 140 ms | save meter segment fill, saved flash, failure blink |
| `--motion-sweep` | 1 s | save meter sweep, only while a save is running |
| `--motion-power-on` | 1.1 s | one wordmark flicker at launch (unchanged from v1) |
| `--steps-reveal` / `--steps-dialog` / `--steps-flash` | `steps(4, jump-start)` / `steps(5, jump-start)` / `steps(3, end)` | segmented timing |

| Pattern | Applied to | How it moves |
| --- | --- | --- |
| Press | rail, toolbar, ghost, settings, notice and dialog buttons | instant 1px drop, two-step highlight; no delay before the action |
| Control on | rail button opening its panel, active formatting, selected segment, highlighted search/theme row, open archive row | three-step brightness flash |
| Panel reveal | every popover | top-down in four bands (`clip-path`) with an opacity lift; the first band shows at once |
| Dialog reveal | `<dialog>` | opens outward from a centre line in five steps, like a CRT |
| Overlay fade | popover scrim, dialog backdrop | opacity only |
| Save meter | footer status | fills in segments; flashes once when saved; blinks twice on failure, starting lit; stepped sweep while saving |

Rules: animations are triggered only by state changes, so nothing runs while idle. Movement uses `clip-path`, opacity, filter, and a 1px transform, so nothing shifts layout. Panels and dialogs take focus immediately and are interactive from the first frame. Closing is instant, because delaying an unmount would hold back focus and state. Nothing inside the writing page animates.

**Motion levels.** Settings → Interface → Motion: **Full** (default), **Reduced** (colour fades only: no flashes, reveals, sweeps, flicker, or press drop), **Off** (no transitions or animations). The choice is stored locally like the theme (`terminal.motion`) and applied before the first render. The OS reduced-motion setting turns everything off and cannot be overridden by Full; Settings says so when it is active. Themes do not change motion.

## Startup, implemented last

Centred TERMINAL wordmark, thin technical framing, chosen theme, a segmented readiness indicator, and Arlecchino's original sound when enabled. Use real readiness or clearly indeterminate progress, never fabricated percentages or artificial delays. Asset failures cannot block the editor; real database initialization errors remain visible. Animation and sound are independently controllable.

### Startup screen (T-31, T-32)

The screen covers the app while the journal opens underneath. It contains:

- a small **ARLECCHINO** label;
- the large **TERMINAL** wordmark, with the same gradient, scan-cut mask and glow as the header, as the focal point;
- a 12-segment meter;
- one line of status: OPENING JOURNAL, then READY.

It sits in a bracketed frame on the shell's backdrop and uses the chosen theme from the first frame. The theme is applied before React renders, and the native window background is near-black (`#050706`), so the window never flashes white or Mint.

| Situation | What happens |
| --- | --- |
| Motion Full | The frame opens from a centre line, the wordmark powers on, and a lit band sweeps the meter until the journal is open. The meter then fills and the screen collapses (220 ms). The sequence lasts 1.4 s and runs while the journal opens; any key or click skips it. |
| Motion Reduced or Off, or OS reduced motion | Static screen; it leaves as soon as the journal is open, with no minimum time. |
| Journal slow to open | After 4 s the text changes to STILL OPENING THE JOURNAL. |
| Journal cannot open | The screen leaves at once, and the app's error with **Retry opening storage** is shown. |
| Anything else | The screen closes itself after 10 s whatever happens. If the screen itself fails, it removes itself. |
| Startup screen Off (Settings → Interface) | Terminal opens straight to the editor. |
| Startup sound | Played once per launch through the sound manager when Sound and Startup are on. It plays only if the audio device starts immediately, never late on a first click. It is independent of the screen. |

The meter never shows a percentage, because initialization has no measurable fraction.

## Verification gates

T-24 covers every theme and state, text/control contrast, scaling, and focus. T-30 measures input, sound, motion, and idle behaviour before startup work. T-33 covers native platform and v1 compatibility evidence. A browser screenshot alone cannot prove persistence, input latency, native startup audio, or installation.
