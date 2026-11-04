# UI v0.3 validation — November 4, 2026

Scope: visual refresh to design system v0.3 ("Terminal 84"), requested by the product owner with four retro-futuristic reference images and permission to change the palette. Only synthetic entries were used.

## What changed

- New colour tokens (blue-black surfaces, phosphor-cyan accent, amber and rose signals) replacing the v0.2 forest/mint palette. All text meets WCAG AA on every surface (lowest: meta text 5.9:1); control borders meet 3:1.
- Striped, glowing Orbitron Black wordmark and Orbitron panel titles (`@fontsource/orbitron` 5.3.0, OFL-1.1, bundled locally).
- Rail with visible captions and a lit active state; header prompt with a blinking block caret.
- One-row toolbar at common sizes with refined active states (tint, accent ink, inset bar); styled dropdowns.
- Writing page with a thin top accent line on a darker gutter; entry header row holding the entry chip, number, created date, and compact Export/Delete buttons.
- Status bar with a framed save meter: saved, unsaved, saving (animated sweep), failed.
- Framed panels with sticky titles. Search and Archives open centred over a dimmed window; selected rows are tinted with an accent border.
- Restyled dialogs, notices, error banner and scrollbars.
- Small windows: below 520 px the toolbar becomes one horizontally scrollable row, rail captions hide, and Export/Delete become icon-only. This grows the writing area at 480 × 400 from 158 px to 240 px.
- Writing focus is shown by the caret and a hairline in the page margin, not a box over the text. A container panel's frame brightens instead of drawing a heavy focus ring.
- Documentation: `docs/UI-DESIGN-SYSTEM-v0.3.md`; AGENTS.md, PRD, ARCHITECTURE and README now point to v0.3. v0.2 is marked superseded.

## Owner tweaks — more retro, more compact

At the owner's request, after the first pass:

- **More retro effects**, all in the chrome only:
  - stronger canvas scanlines and a vignette, plus faint scanlines in the chrome panels and gutter;
  - glowing corner brackets on the header, rail, Search, Archives and dialogs;
  - a soft phosphor bloom around panels;
  - a larger wordmark with a double glow and a one-time power-on flicker;
  - a segmented save meter, and glowing accent text and active states.
- **More compact overall**: slimmer rail (72 px), header (44 px), toolbar (42 px, 30 px buttons) and status bar (28 px); tighter page, panel and settings spacing; a 28 px title. The writing area at 480 × 400 grew from 240 to 254 px; at 1100 × 780 the toolbar stays on one row.
- The writing text itself remains free of glow, scanlines and overlays.

## Owner tweaks — simpler header, rail and status bar

- Removed the header's `> personal journal` prompt and the status bar's `LOCAL JOURNAL · STORED ON THIS DEVICE` text; the wordmark is centred in the header.
- Rail buttons are icon-only, each in its own framed box; the rail narrowed from 72 to 56 px (48 px below 520 px wide). Names remain available to assistive technology and as tooltips.

## Bugs found and fixed during the refresh

- **Focus race after New entry or delete.** The editor's delayed autofocus could close a panel opened by shortcut straight afterwards: ⌘K right after deleting showed Search and immediately hid it.
- **Caret jump while typing.** The same delayed focus could also move the caret to the start of the entry after typing had begun. This was the cause of an intermittent failure in the table UI test.
- **Fix for both.** The editor now takes focus once, synchronously, and only if nothing else is focused.

## Checks

| Check | Result |
| --- | --- |
| `npm run check` (lint, typecheck, 47 unit tests, build, 19 UI tests, fmt, clippy, 31 native tests, schema check) | pass |
| UI tests repeated 10× with 6 workers | 180/180 passed |
| New UI test: reduced-motion preference stops every animation | pass |
| Layout at 1280 × 800, 1100 × 780, 760 × 600, 480 × 400 | no horizontal page scrolling, no clipped controls |

## Not verified

- The look inside the native WebKit window was not captured by me; it uses the same CSS and fonts as the Chromium checks.
- Windows (WebView2) rendering of the striped wordmark mask and custom scrollbars.
- 200% text enlargement.
