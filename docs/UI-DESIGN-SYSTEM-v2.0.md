# Terminal 2.0 — sensory design extension

Status: accepted target for future implementation, November 4, 2026. This extends [Terminal 84 v0.3](UI-DESIGN-SYSTEM-v0.3.md) only within the four features in the [2.0 specification](TERMINAL_V2_SPEC.md). It is not an implemented redesign.

## Preserve the released foundation

Keep the rail order (Search, Archives, New entry, Settings below), dominant right writing field, Orbitron display lettering, IBM Plex Mono interface labels, and chosen writing fonts. Writing stays free of scanlines, glow, grids, and decorative overlays. All themes share the same layout, typography, controls, and motion behaviour.

## Theme contract

Available themes: Terminal Mint (default), Blue Monitor, Ember Orange, Amber Display. Theme choices apply to interface colours, never rewrite user-authored rich-text formatting. Derived tokens cover readable text, muted labels, focus, hover, active/disabled state, attention, errors, and glow.

The four requested core roles are Dominant, Default Line, Background, and Text Drop. T-22 will establish their semantic mapping from the actual released CSS. Do not replace Mint with approximate colours from a screenshot or a proposed palette.

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

The conceptual Text Drop role describes a recessed writing surface, but in the released Mint CSS the writing page is lighter than the canvas. Preserve that measured baseline rather than darkening Mint to force a new role name. Resolve and document semantic aliases in T-22. Other palettes are implementation proposals until contrast and theme/state coverage pass T-24.

## Sounds

Optional, local, centrally managed, and immediately muteable. Existing 1.0 users upgrade silently until enabling sound. Keep master, keyboard, UI, and startup preferences explicit. Playback follows actual text input or actual action outcomes; do not sound every raw key event. Respect IME and accessibility input. Asset provenance and redistribution rights are release gates; see [the asset checklist](AUDIO-ASSETS-v2.0.md).

## Motion

Mechanical, segmented, precise feedback. Centralize timing: button feedback 60–120 ms, control state 100–160 ms, popovers 120–200 ms, dialogs 140–220 ms as starting ranges. Prefer CSS and transform/opacity. OS reduced motion takes precedence over enabling full effects in the app. Never delay typing/saving or animate journal text.

## Startup, implemented last

Centred TERMINAL wordmark, thin technical framing, chosen theme, a segmented readiness indicator, and Arlecchino's original sound when enabled. Use real readiness or clearly indeterminate progress, never fabricated percentages or artificial delays. Asset failures cannot block the editor; real database initialization errors remain visible. Animation and sound are independently controllable.

## Verification gates

T-24 covers every theme and state, text/control contrast, scaling, and focus. T-30 measures input, sound, motion, and idle behaviour before startup work. T-33 covers native platform and v1 compatibility evidence. A browser screenshot alone cannot prove persistence, input latency, native startup audio, or installation.
