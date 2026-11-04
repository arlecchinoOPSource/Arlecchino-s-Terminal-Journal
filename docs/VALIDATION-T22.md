# T-22 validation — November 4, 2026

Scope: audit the interface CSS and establish semantic theme tokens ([#36](https://github.com/arlecchinoOPSource/Arlecchino-s-Terminal-Journal/issues/36)). Terminal Mint only; no new themes, settings, or theme switching (T-23).

## Audit

| Location | Colour literals in v1.0.0 | Result |
| --- | --- | --- |
| `src/styles/tokens.css` | 19 tokens | Kept with identical values; grouped under the four core roles |
| `src/styles/app.css` | 22 Dominant alpha tints `rgba(82,240,190,…)`, 2 danger tints, 2 scrims `rgba(3,5,4,…)`, `#0E1C17` shell gradient, `#F3FBF7` headings ×2, select chevron data URI | All replaced by tokens |
| `src/styles/app.css` | Black shadows/vignette, `#000` mask stencils | Kept: theme-neutral, not colours of the interface |
| `src/styles/app.css` | `hue-rotate(120deg)` on the search clear button | Kept: Mint-tuned; recorded for T-23/T-24 |
| `src/**/*.tsx`, `src/**/*.ts` | None, apart from the export stylesheet | `src/domain/export.ts` stays theme-independent by design |
| `index.html`, `tauri.conf.json` | No background colour | Recorded for T-23 (theme restored before first paint) |

The mapping, including Mint's writing page being lighter than Text Drop, is documented in [UI-DESIGN-SYSTEM-v2.0.md](UI-DESIGN-SYSTEM-v2.0.md#semantic-token-mapping-t-22).

## Checks

| Check | Result |
| --- | --- |
| `npm run check` (lint, typecheck, 56 unit tests, build, 40 UI tests in Chromium + WebKit, fmt, clippy, 31 native tests, 3 schema checks) | pass |
| `tests/theme-tokens.test.mjs` (new): every v1.0.0 Mint value, role mapping, channel tokens, no literals in `app.css` or components | pass; fails when a literal is added to `app.css` (checked by mutation) |
| `tests/ui/theme.spec.ts` (new): computed colours of canvas, rail, frame, glow, page, caret, chevron, scrim, panel title | pass in Chromium and WebKit |
| Screenshot comparison with v1.0.0: 8 states (editor with headings, lists, quote and table; toolbar hover; archives; search with a selected result; settings; delete dialog; save error; 480 × 640 window) × Chromium and WebKit, reduced motion, captured from the unchanged source before editing | 16 of 16 pixel-identical |
| Production bundle | JS 717.44 kB, unchanged; existing >500 kB warning remains |

The first token version used the modern `rgb(r g b / a)` form. Chromium then differed from v1.0.0 by at most 1/255 per channel across the shell, because it keeps that alpha unrounded; the legacy `rgba(var(--…-rgb), a)` form made every screenshot identical. Two WebKit captures (search, small window) varied between repeated runs of the same source, so pixel identity there is from the final run and repeat runs can show anti-aliasing noise.

## Not verified

- The native macOS and Windows apps were not launched; the comparison used the browser engines from the UI tests (WebKit for macOS, Chromium as a stand-in for WebView2).
- Comparison screenshots were made with a temporary script and are not committed; the committed regression checks are the two tests above.
- No journal data was read or written beyond the synthetic UI mock.
